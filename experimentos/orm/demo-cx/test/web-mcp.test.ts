import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { crearApp } from '../src/app.js';
import { connect } from '../src/db/connection.js';

test('módulo MCP embebido: handshake, CRUD, errores y datos compartidos con REST', async (t) => {
  const connection = connect({ url: ':memory:' });
  await migrate(connection.db, { migrationsFolder: 'drizzle' });
  const server = crearApp(connection.db).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    connection.close();
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Falta puerto HTTP.');
  const base = `http://127.0.0.1:${address.port}`;
  const html = readFileSync('public/microcrm.html', 'utf8');
  const codigo = html.match(/<script type="module" id="microcrm-mcp-client">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(codigo);
  const llamadas: string[] = [];
  // Ejecuta el módulo de servicios real del HTML sin DOM ni automatización de interfaz.
  const mcp = runInNewContext(codigo + '\nwindow.MicroCrmMcp;', {
    window: {},
    fetch: (url: string, opciones: RequestInit) => {
      assert.equal(url, '/mcp');
      llamadas.push(JSON.parse(String(opciones.body)).method);
      return fetch(new URL(url, base), opciones);
    },
  });
  await Promise.all([mcp.clientes.listar(), mcp.clientes.listar()]);
  assert.equal(llamadas.filter((method) => method === 'initialize').length, 1);
  assert.equal(llamadas.filter((method) => method === 'notifications/initialized').length, 1);
  const datos = { nombre: ' ANA ', apellido: ' PÉREZ ', email: 'ANA@EXAMPLE.COM' };
  const cliente = await mcp.clientes.crear(datos);
  assert.equal(cliente.nombre, 'Ana');
  await assert.rejects(mcp.clientes.crear(datos), /email/);
  await mcp.clientes.actualizar(cliente.id, { localidad: 'Yerba Buena' });
  assert.equal((await mcp.clientes.obtener(cliente.id)).localidad, 'Yerba Buena');
  assert.equal((await (await fetch(`${base}/api/clientes/${cliente.id}`)).json()).localidad, 'Yerba Buena');
  const actividad = await mcp.actividades.crear(cliente.id, { descripcion: 'Llamar' });
  await mcp.actividades.actualizar(cliente.id, actividad.id, { descripcion: 'Llamar mañana' });
  await mcp.actividades.completar(cliente.id, actividad.id);
  assert.equal((await mcp.clientes.obtener(cliente.id)).actividades[0].estado, 'completada');
  await assert.rejects(mcp.actividades.actualizar(cliente.id, actividad.id, { descripcion: 'Editar' }), /completada/);
  await assert.rejects(mcp.actividades.eliminar(cliente.id, actividad.id), /completada/);
  const pendiente = await mcp.actividades.crear(cliente.id, { descripcion: 'Borrar' });
  await mcp.actividades.eliminar(cliente.id, pendiente.id);
  assert.equal((await mcp.clientes.obtener(cliente.id)).actividades.length, 1);
  await assert.rejects(mcp.clientes.crear({ nombre: 'Falta apellido y email' }), /apellido|email/);
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(mcp.clientes.listar(abort.signal));
});
