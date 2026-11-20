import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { RepositorioContactos } from './repositorio.js';
import { crearServidor } from './mcp.js';

function preparar(t) {
  const carpeta = mkdtempSync(join(tmpdir(), 'mcp-contactos-'));
  t.after(() => rmSync(carpeta, { recursive: true, force: true }));
  const archivo = join(carpeta, 'contactos.json');
  return { archivo, repositorio: new RepositorioContactos(archivo) };
}

const datos = { nombre: ' Ana Pérez ', telefono: '3815550101', email: 'ana@example.com' };

test('el repositorio persiste el CRUD y permite volver a abrir el archivo', t => {
  const { archivo, repositorio } = preparar(t);
  assert.deepEqual(repositorio.listar(), []);
  const ana = repositorio.agregar(datos);
  assert.equal(ana.nombre, 'Ana Pérez');
  const luis = repositorio.agregar({ ...datos, nombre: 'Luis', email: 'luis@example.com' });
  assert.notEqual(ana.id, luis.id);

  const reabierto = new RepositorioContactos(archivo);
  assert.deepEqual(reabierto.traer(ana.id), ana);
  assert.deepEqual(reabierto.listar('PÉREZ'), [ana]);
  const actualizado = reabierto.actualizar(ana.id, { telefono: '1234' });
  assert.equal(actualizado.nombre, ana.nombre);
  assert.equal(actualizado.telefono, '1234');
  assert.equal(repositorio.traer(ana.id).telefono, '1234');
  assert.deepEqual(reabierto.eliminar(luis.id), luis);
  assert.deepEqual(JSON.parse(readFileSync(archivo, 'utf8')), [actualizado]);
  assert.throws(() => reabierto.traer(luis.id), /No existe/);
});

test('rechaza datos inválidos y conserva el archivo ante errores', t => {
  const { archivo, repositorio } = preparar(t);
  const ana = repositorio.agregar(datos);
  const original = readFileSync(archivo, 'utf8');
  assert.throws(() => repositorio.agregar({ ...datos, nombre: '  ' }));
  assert.throws(() => repositorio.agregar({ ...datos, email: 'invalido' }));
  assert.throws(() => repositorio.actualizar(ana.id, {}));
  assert.throws(() => repositorio.actualizar(ana.id, { id: 99 }));
  assert.throws(() => repositorio.actualizar(999, { nombre: 'Otro' }), /No existe/);
  assert.throws(() => repositorio.eliminar(999), /No existe/);
  assert.equal(readFileSync(archivo, 'utf8'), original);

  writeFileSync(archivo, '{ json roto');
  assert.throws(() => repositorio.agregar(datos));
  assert.equal(readFileSync(archivo, 'utf8'), '{ json roto');
});

test('un cliente MCP descubre las herramientas y completa el CRUD por HTTP', async t => {
  const { archivo, repositorio } = preparar(t);
  // El sistema elige un puerto libre para no interferir con las demos.
  const reserva = createServer();
  await new Promise(resolve => reserva.listen(0, '127.0.0.1', resolve));
  const puerto = reserva.address().port;
  await new Promise(resolve => reserva.close(resolve));

  const servidor = crearServidor(repositorio);
  const cliente = new Client({ name: 'prueba-contactos', version: '1.0.0' });
  try {
    await servidor.start({
      transportType: 'httpStream',
      httpStream: { host: '127.0.0.1', port: puerto, stateless: true, enableJsonResponse: true }
    });
    await cliente.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${puerto}/mcp`)));
    const { tools } = await cliente.listTools();
    assert.deepEqual(tools.map(herramienta => herramienta.name).sort(), [
      'actualizar_contacto', 'agregar_contacto', 'eliminar_contacto', 'listar_contactos', 'traer_contacto'
    ]);

    async function llamar(name, args = {}) {
      return cliente.callTool({ name, arguments: args });
    }
    function leer(resultado) {
      assert.ok(!resultado.isError, JSON.stringify(resultado));
      return JSON.parse(resultado.content[0].text);
    }

    const ana = leer(await llamar('agregar_contacto', datos));
    assert.deepEqual(leer(await llamar('traer_contacto', { id: ana.id })), ana);
    assert.deepEqual(leer(await llamar('listar_contactos', { filtro: 'ANA' })), [ana]);
    const actualizado = leer(await llamar('actualizar_contacto', { id: ana.id, datos: { nombre: 'Ana María' } }));
    assert.equal(actualizado.nombre, 'Ana María');
    assert.equal(new RepositorioContactos(archivo).traer(ana.id).nombre, 'Ana María');
    assert.equal((await llamar('agregar_contacto', { ...datos, email: 'invalido' })).isError, true);
    assert.equal((await llamar('actualizar_contacto', { id: ana.id, datos: {} })).isError, true);
    assert.deepEqual(leer(await llamar('eliminar_contacto', { id: ana.id })), actualizado);
    assert.equal((await llamar('traer_contacto', { id: ana.id })).isError, true);
    assert.deepEqual(leer(await llamar('listar_contactos')), []);
    assert.deepEqual(JSON.parse(readFileSync(archivo, 'utf8')), []);
  } finally {
    await cliente.close();
    await servidor.stop();
  }
});
