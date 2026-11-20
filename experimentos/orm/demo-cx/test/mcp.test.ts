import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test, type TestContext } from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { crearApp } from '../src/app.js';
import { connect } from '../src/db/connection.js';

async function preparar(t: TestContext) {
  const connection = connect({ url: ':memory:' });
  await migrate(connection.db, { migrationsFolder: 'drizzle' });
  const server = crearApp(connection.db).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Sin puerto HTTP.');
  const base = `http://127.0.0.1:${address.port}`;
  const clientes: Client[] = [];
  t.after(async () => {
    await Promise.all(clientes.map((cliente) => cliente.close()));
    await new Promise<void>((resolve) => server.close(() => resolve()));
    connection.close();
  });
  async function conectar() {
    const client = new Client({ name: 'prueba-microcrm', version: '1.0.0' });
    clientes.push(client);
    await client.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp`)));
    return client;
  }
  const client = await conectar();
  async function llamar(name: string, args: Record<string, unknown>) {
    return await client.callTool({ name, arguments: args }) as CallToolResult;
  }
  return { base, client, llamar, conectar };
}
function leer(resultado: CallToolResult) {
  const bloque = resultado.content[0];
  if (bloque.type !== 'text') throw new Error('Falta resultado textual.');
  return JSON.parse(bloque.text);
}
const datos = { nombre: '  aNA ', apellido: ' PÉREZ ', email: ' ANA@EXAMPLE.COM ' };

test('MCP oficial: descubre 11 herramientas y comparte escrituras con REST', async (t) => {
  const { base, client, llamar, conectar } = await preparar(t);
  const listado = await client.listTools();
  assert.equal(listado.tools.length, 11);
  assert.ok(listado.tools.every((tool) => tool.inputSchema.type === 'object'));
  assert.equal(listado.tools.find((tool) => tool.name === 'clientes_eliminar')?.annotations?.destructiveHint, true);
  const creadoRest = await fetch(`${base}/api/clientes`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos),
  });
  const cliente = await creadoRest.json();
  assert.equal(leer(await llamar('clientes_obtener', { clienteId: cliente.id })).datos.nombre, 'Ana');
  await llamar('clientes_actualizar', { clienteId: cliente.id, datos: { localidad: 'Yerba Buena' } });
  assert.equal((await (await fetch(`${base}/api/clientes/${cliente.id}`)).json()).localidad, 'Yerba Buena');
  const creadoMcp = leer(await llamar('clientes_crear', { datos: { ...datos, email: 'otro@example.com' } })).datos;
  assert.equal((await (await fetch(`${base}/api/clientes`)).json()).length, 2);
  assert.equal(leer(await llamar('clientes_buscar', { filtro: { apellido: 'perez', localidad: 'yerba' } })).datos.length, 1);
  const segundo = await conectar();
  const resultados = await Promise.all([client.listTools(), segundo.listTools()]);
  assert.equal(resultados[1].tools.length, 11);
  await llamar('clientes_eliminar', { clienteId: creadoMcp.id });
  assert.equal((await fetch(`${base}/api/clientes/${creadoMcp.id}`)).status, 404);
});

test('MCP: composición, CRUD de actividades y bloqueo de completadas', async (t) => {
  const { base, llamar } = await preparar(t);
  const clienteId = leer(await llamar('clientes_crear', { datos })).datos.id;
  const otroId = leer(await llamar('clientes_crear', { datos: { ...datos, email: 'otro@example.com' } })).datos.id;
  const actividadId = leer(await llamar('actividades_crear', { clienteId, datos: { descripcion: 'Llamar' } })).datos.id;
  assert.equal(leer(await llamar('actividades_obtener', { clienteId, actividadId })).datos.estado, 'pendiente');
  assert.equal(leer(await llamar('actividades_obtener', { clienteId: otroId, actividadId })).codigo, 'no_encontrado');
  assert.equal(leer(await llamar('actividades_actualizar', { clienteId: otroId, actividadId, datos: { descripcion: 'Ajena' } })).codigo, 'no_encontrado');
  await llamar('actividades_actualizar', { clienteId, actividadId, datos: { descripcion: 'Llamar mañana', fechaCompromiso: '2020-01-01' } });
  assert.equal(leer(await llamar('actividades_buscar', { clienteId, filtro: { estado: 'vencida' } })).datos.length, 1);
  await llamar('actividades_completar', { clienteId, actividadId, fecha: '2026-10-16' });
  for (const [name, args] of [
    ['actividades_actualizar', { clienteId, actividadId, datos: { descripcion: 'Cambiar' } }],
    ['actividades_actualizar', { clienteId, actividadId, datos: { fechaFinalizacion: null } }],
    ['actividades_completar', { clienteId, actividadId }],
    ['actividades_eliminar', { clienteId, actividadId }],
  ] as const) {
    const error = await llamar(name, args);
    assert.equal(error.isError, true);
    assert.equal(leer(error).codigo, 'conflicto');
  }
  const borrable = leer(await llamar('actividades_crear', { clienteId, datos: { descripcion: 'Borrar' } })).datos;
  assert.equal((await llamar('actividades_eliminar', { clienteId, actividadId: borrable.id })).isError, undefined);
  assert.equal(leer(await llamar('actividades_buscar', { clienteId })).datos.length, 1);
  await llamar('clientes_eliminar', { clienteId });
  assert.equal((await fetch(`${base}/api/clientes/${clienteId}/actividades`)).status, 404);
});

test('MCP: entradas inválidas, conflictos, protocolo y origen', async (t) => {
  const { base, llamar } = await preparar(t);
  const clienteId = leer(await llamar('clientes_crear', { datos })).datos.id;
  const duplicado = await llamar('clientes_crear', { datos });
  assert.equal(duplicado.isError, true);
  assert.equal(leer(duplicado).codigo, 'conflicto');
  for (const [name, args] of [
    ['clientes_obtener', { clienteId: -1 }],
    ['clientes_crear', { datos: { nombre: 'Ana' } }],
    ['clientes_actualizar', { clienteId, datos: {} }],
    ['clientes_obtener', { clienteId, campoDesconocido: true }],
    ['actividades_crear', { clienteId, datos: { descripcion: 'Ajena', clienteId: 999 } }],
  ] as const) assert.equal((await llamar(name, args)).isError, true);
  const fechaInvalida = await llamar('actividades_crear', { clienteId, datos: { descripcion: 'Fecha', fechaCompromiso: '2026-02-30' } });
  assert.equal(leer(fechaInvalida).codigo, 'validacion');
  assert.equal((await fetch(`${base}/mcp`)).status, 405);
  assert.equal((await fetch(`${base}/mcp`, { method: 'DELETE' })).status, 405);
  const origen = await fetch(`${base}/mcp`, { method: 'POST', headers: {
    'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', Origin: 'https://ajeno.example',
  }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }) });
  assert.equal(origen.status, 403);
});
