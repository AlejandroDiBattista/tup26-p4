import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const carpeta = await mkdtemp(join(tmpdir(), 'minicrm-prueba-'));
process.env.DATABASE_URL = `file:${join(carpeta, 'prueba.db')}`;
delete process.env.DATABASE_AUTH_TOKEN;
const { db, conexion } = await import('../src/base.js');
const { app } = await import('../src/app.js');
const { hoyTucuman } = await import('../src/validacion.js');
await migrate(db, { migrationsFolder: './drizzle' });
const servidor = app.listen(0, '127.0.0.1');
await new Promise<void>(resolve => servidor.once('listening', resolve));
const direccion = servidor.address();
assert(direccion && typeof direccion !== 'string');
const origen = `http://127.0.0.1:${direccion.port}`;
const clienteMcp = new Client({ name: 'pruebas', version: '1.0.0' });
await clienteMcp.connect(new StreamableHTTPClientTransport(new URL('/mcp', origen)));

after(async () => {
  await clienteMcp.close();
  await new Promise<void>(resolve => servidor.close(() => resolve()));
  conexion.close();
  await rm(carpeta, { recursive: true, force: true });
});

async function rest(ruta: string, metodo = 'GET', datos?: unknown, estado = 200) {
  const respuesta = await fetch(origen + '/api/clientes' + ruta, {
    method: metodo, headers: { 'Content-Type': 'application/json' },
    body: datos === undefined ? undefined : JSON.stringify(datos),
  });
  const resultado = respuesta.status === 204 ? null : await respuesta.json();
  assert.equal(respuesta.status, estado, JSON.stringify(resultado));
  return resultado;
}

async function mcp(nombre: string, argumentos: Record<string, unknown>, error = false) {
  const resultado = await clienteMcp.callTool({ name: nombre, arguments: argumentos });
  assert.equal(Boolean(resultado.isError), error, JSON.stringify(resultado));
  const contenido = resultado.content as { type: string; text: string }[];
  return JSON.parse(contenido[0].text);
}

test('REST y MCP comparten datos, validaciones y composición', async () => {
  assert.equal(hoyTucuman(new Date('2026-10-15T02:59:59Z')), '2026-10-14');
  assert.equal(hoyTucuman(new Date('2026-10-15T03:00:00Z')), '2026-10-15');
  const herramientas = await clienteMcp.listTools();
  assert.equal(herramientas.tools.length, 12);
  const cliente = await rest('', 'POST', { nombre: '  MARÍA   josé ', apellido: ' péREZ ', email: ' MARIA@EXAMPLE.COM ', telefono: '0381 15 512-3456' }, 201);
  assert.equal(cliente.nombre, 'María José');
  assert.equal(cliente.apellido, 'Pérez');
  assert.equal(cliente.email, 'maria@example.com');
  assert.equal(cliente.telefono, '+5493815123456');
  await rest('', 'POST', { nombre: 'Otra', apellido: 'Persona', email: 'MARIA@example.com' }, 409);
  await rest('', 'POST', { nombre: 'Otra', apellido: 'Persona', email: 'otra@example.com', telefono: '123' }, 400);
  for (const texto of ['maria jose', 'PEREZ', 'maria@example.com', '+5493815123456', String(cliente.id)]) {
    const encontrados = await rest('?texto=' + encodeURIComponent(texto));
    assert(encontrados.some((c: { id: number }) => c.id === cliente.id));
  }
  assert.equal((await mcp('clientes_buscar_email', { email: 'MARIA@EXAMPLE.COM' })).id, cliente.id);
  await mcp('clientes_actualizar', { clienteId: cliente.id, datos: { nombre: ' ANA ' } });
  assert.equal((await rest('/' + cliente.id)).nombre, 'Ana');
  const otro = await mcp('clientes_crear', { datos: { nombre: 'Luis', apellido: 'Prueba', email: 'luis@example.com' } });
  const base = `/${cliente.id}/actividades`;
  const sinFecha = await rest(base, 'POST', { descripcion: 'Sin fecha' }, 201);
  const vencida = await rest(base, 'POST', { descripcion: 'Vencida', fechaCompromiso: '2000-01-01' }, 201);
  const hoy = await mcp('actividades_crear', { clienteId: cliente.id, datos: { descripcion: 'Hoy', fechaCompromiso: hoyTucuman() } });
  const futura = await rest(base, 'POST', { descripcion: 'Futura', fecha: '2026-10-10', fechaCompromiso: '2099-01-01' }, 201);
  await rest(base, 'POST', { descripcion: 'Inválida', fecha: '2026-02-30' }, 400);
  await rest(base, 'POST', { descripcion: 'Inválida', fechaFinalizacion: '2026-01-01' }, 400);
  await rest(`/${otro.id}/actividades/${sinFecha.id}`, 'PATCH', { descripcion: 'Cruce' }, 404);
  assert.equal((await rest(base + '?filtro=vencidas')).length, 1);
  assert.equal((await rest(base + '?filtro=sin-compromiso')).length, 1);
  assert.equal((await mcp('actividades_listar', { clienteId: cliente.id, filtro: 'pendientes' })).length, 4);
  await mcp('actividades_actualizar', { clienteId: cliente.id, actividadId: futura.id, datos: { descripcion: 'Futura editada' } });
  assert.equal((await mcp('actividades_obtener', { clienteId: cliente.id, actividadId: futura.id })).descripcion, 'Futura editada');
  const completada = await mcp('actividades_completar', { clienteId: cliente.id, actividadId: vencida.id });
  assert(!isNaN(Date.parse(completada.fechaFinalizacion)));
  assert.equal((await rest(`${base}/${vencida.id}/completar`, 'POST')).fechaFinalizacion, completada.fechaFinalizacion);
  await rest(`${base}/${vencida.id}`, 'PATCH', { descripcion: 'No permitido' }, 409);
  await rest(`${base}/${vencida.id}`, 'DELETE', undefined, 409);
  assert.equal((await mcp('actividades_eliminar', { clienteId: cliente.id, actividadId: vencida.id }, true)).estado, 409);
  assert.equal((await mcp('actividades_actualizar', { clienteId: cliente.id, actividadId: vencida.id, datos: { descripcion: 'No' } }, true)).estado, 409);
  assert.equal((await rest(base + '?filtro=vencidas')).length, 0);
  await rest(`${base}/${sinFecha.id}`, 'DELETE', undefined, 204);
  await mcp('actividades_eliminar', { clienteId: cliente.id, actividadId: futura.id });
  assert.equal((await mcp('actividades_obtener', { clienteId: otro.id, actividadId: hoy.id }, true)).estado, 404);
  await mcp('clientes_eliminar', { clienteId: cliente.id });
  const remanentes = await conexion.execute({ sql: 'SELECT count(*) AS cantidad FROM actividades WHERE cliente_id = ?', args: [cliente.id] });
  assert.equal(remanentes.rows[0].cantidad, 0);
  await rest('/' + cliente.id, 'GET', undefined, 404);
  await rest('/' + otro.id, 'DELETE', undefined, 204);
  await rest('/abc', 'GET', undefined, 400);
  await rest('?texto=a&texto=b', 'GET', undefined, 400);
  const malJson = await fetch(origen + '/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malJson.status, 400);
  assert.equal((await fetch(origen + '/mcp')).status, 405);
  for (const pagina of ['/clientes.html', '/clientes-mcp.html']) assert.equal((await fetch(origen + pagina)).status, 200);
});

test('La semilla se puede repetir sin duplicar clientes ni actividades', () => {
  const cargar = () => execFileSync(process.execPath, ['--import', 'tsx', 'src/semilla.ts'], { env: process.env, encoding: 'utf8' });
  assert.match(cargar(), /10 clientes/);
  assert.match(cargar(), /10 clientes/);
});

test('La segunda carga conserva exactamente 50 actividades y claves foráneas válidas', async () => {
  const resultado = await conexion.execute('SELECT count(*) AS cantidad FROM actividades');
  assert.equal(resultado.rows[0].cantidad, 50);
  assert.equal((await conexion.execute('PRAGMA foreign_key_check')).rows.length, 0);
});
