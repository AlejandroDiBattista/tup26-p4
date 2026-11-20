import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';

process.env.TURSO_DATABASE_URL = 'file:test-api.sqlite';

const { db } = await import('../src/db/index.js');
const { clientes, actividades } = await import('../src/db/schema.js');
const { app } = await import('../src/app.js');
const { pushSQLiteSchema } = await import('drizzle-kit/api');

let server: Server;
let base: string;

const api = async (metodo: string, ruta: string, body?: object) => {
  const r = await fetch(base + ruta, {
    method: metodo,
    headers: { 'content-type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  return { status: r.status, data: r.status === 204 ? null : await r.json() };
};

before(async () => {
  await (await pushSQLiteSchema({ clientes, actividades }, db as any)).apply();
  await db.delete(actividades);
  await db.delete(clientes);
  server = app.listen(0);
  base = `http://localhost:${(server.address() as any).port}`;
});

after(() => server.close());

test('flujo completo de clientes y actividades', async () => {
  const alta = await api('POST', '/api/clientes', { nombre: 'ana', apellido: 'paz', email: 'ANA@x.com' });
  assert.equal(alta.status, 201);
  assert.equal(alta.data.nombre, 'Ana');
  const url = `/api/clientes/${alta.data.id}`;

  assert.equal((await api('POST', '/api/clientes', { nombre: 'a', apellido: 'b', email: 'ana@x.com' })).status, 409);
  assert.equal((await api('POST', '/api/clientes', { nombre: 'a' })).status, 400);
  assert.equal((await api('GET', '/api/clientes?q=paz')).data.length, 1);
  assert.equal((await api('GET', '/api/clientes?localidad=nada')).data.length, 0);
  assert.equal((await api('GET', '/api/clientes/abc')).status, 400);
  assert.equal((await api('GET', '/api/clientes/9999')).status, 404);

  const act = await api('POST', `${url}/actividades`, { descripcion: 'Llamar', fechaCompromiso: '2000-01-01' });
  assert.equal(act.status, 201);
  assert.equal(act.data.estado, 'vencida');
  const aurl = `${url}/actividades/${act.data.id}`;

  assert.equal((await api('PUT', aurl, { descripcion: 'Llamar hoy' })).data.descripcion, 'Llamar hoy');
  assert.equal((await api('POST', `${aurl}/completar`, { fecha: '2026-10-01' })).data.estado, 'completada');
  assert.equal((await api('PUT', aurl, { descripcion: 'x' })).status, 409);
  assert.equal((await api('DELETE', aurl)).status, 409);
  assert.equal((await api('GET', `${url}/actividades`)).data.length, 1);

  assert.equal((await api('DELETE', url)).status, 204);
  assert.equal((await api('GET', url)).status, 404);
});
