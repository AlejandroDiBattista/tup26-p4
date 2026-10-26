import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test, type TestContext } from 'node:test';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { crearApp } from '../src/app.js';
import { connect } from '../src/db/connection.js';

async function api(t: TestContext) {
  const connection = connect({ url: ':memory:' });
  await migrate(connection.db, { migrationsFolder: 'drizzle' });
  const server = crearApp(connection.db).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Sin dirección HTTP.');
  t.after(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    connection.close();
  });
  return async (path: string, method = 'GET', body?: unknown) => {
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      method, headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = response.status === 204 ? null : await response.json();
    return { status: response.status, headers: response.headers, data };
  };
}

const cliente = { nombre: '  anA ', apellido: ' PÉREZ ', email: ' ANA@EXAMPLE.COM ', telefono: '+54 (381) 555-0101' };

test('REST: CRUD de clientes, filtros, normalización y conflicto de email', async (t) => {
  const request = await api(t);
  const creado = await request('/api/clientes', 'POST', cliente);
  assert.equal(creado.status, 201);
  const path = `/api/clientes/${creado.data.id}`;
  assert.equal(creado.headers.get('location'), path);
  assert.equal(creado.data.nombre, 'Ana');
  assert.equal(creado.data.email, 'ana@example.com');
  assert.equal(creado.data.telefono, '+543815550101');
  assert.equal((await request('/api/clientes', 'POST', cliente)).status, 409);
  const encontrado = await request('/api/clientes?q=PEREZ');
  assert.equal(encontrado.status, 200);
  assert.equal(encontrado.data.length, 1);
  assert.equal((await request('/api/clientes?nombre=ana&domicilio=null')).data.length, 1);
  assert.equal((await request(path)).data.actividades.length, 0);
  assert.equal((await request(path, 'PATCH', { nombre: '  elENA ', email: ' NUEVA@EXAMPLE.COM ' })).data.nombre, 'Elena');
  const eliminado = await request(path, 'DELETE');
  assert.equal(eliminado.status, 204);
  assert.equal(eliminado.data, null);
  assert.equal((await request(path)).status, 404);
  assert.equal((await request(path, 'PATCH', { nombre: 'Ana' })).status, 404);
  assert.equal((await request(path, 'DELETE')).status, 404);
});

test('REST: actividades dentro de cada cliente y operación de completar', async (t) => {
  const request = await api(t);
  const { data: persona } = await request('/api/clientes', 'POST', cliente);
  const { data: otra } = await request('/api/clientes', 'POST', { ...cliente, email: 'otra@example.com' });
  const base = `/api/clientes/${persona.id}/actividades`;
  const creada = await request(base, 'POST', { descripcion: '  Enviar   propuesta ', fechaCompromiso: '2020-01-01' });
  assert.equal(creada.status, 201);
  const path = `${base}/${creada.data.id}`;
  assert.equal(creada.headers.get('location'), path);
  assert.equal((await request(path)).data.estado, 'vencida');
  assert.equal((await request(`${base}?estado=vencida`)).data.length, 1);
  assert.equal((await request(`${base}?descripcion=PROPUESTA`)).data.length, 1);
  assert.equal((await request(path, 'PATCH', { fechaCompromiso: null })).status, 200);
  assert.equal((await request(path)).data.estado, 'pendiente');
  const ajena = `/api/clientes/${otra.id}/actividades/${creada.data.id}`;
  assert.equal((await request(ajena)).status, 404);
  assert.equal((await request(ajena, 'PATCH', { descripcion: 'Ajena' })).status, 404);
  assert.equal((await request(ajena, 'DELETE')).status, 404);
  assert.equal((await request(`${ajena}/completar`, 'POST')).status, 404);
  const completa = await request(`${path}/completar`, 'POST', { fechaFinalizacion: '2026-10-16' });
  assert.equal(completa.status, 200);
  assert.equal(completa.data.fechaFinalizacion, '2026-10-16');
  assert.equal((await request(path)).data.estado, 'completada');
  assert.equal((await request(path, 'PATCH', { descripcion: 'Cambiar' })).status, 409);
  assert.equal((await request(path, 'PATCH', { fechaFinalizacion: null })).status, 409);
  assert.equal((await request(path, 'DELETE')).status, 409);
  assert.equal((await request(`${path}/completar`, 'POST')).status, 409);
  const { data: pendiente } = await request(base, 'POST', { descripcion: 'Pendiente' });
  assert.equal((await request(`${base}/${pendiente.id}/completar`, 'POST')).status, 200);
  const { data: borrable } = await request(base, 'POST', { descripcion: 'Descartar' });
  assert.equal((await request(`${base}/${borrable.id}`, 'DELETE')).status, 204);
  assert.equal((await request(`/api/clientes/${persona.id}`, 'DELETE')).status, 204);
  assert.equal((await request(base)).status, 404);
});

test('REST: valida cuerpo, parámetros y filtros sin exponer errores internos', async (t) => {
  const request = await api(t);
  for (const body of [[], null, {}, { ...cliente, email: null }, { ...cliente, nombre: 42 }, { ...cliente, id: 15 }, { ...cliente, inesperado: true }]) {
    const respuesta = await request('/api/clientes', 'POST', body);
    assert.equal(respuesta.status, 400);
    assert.equal(typeof respuesta.data.error, 'string');
  }
  for (const path of ['/api/clientes/cero', '/api/clientes/0', '/api/clientes/1.5', '/api/clientes?extra=1', '/api/clientes?q=ana&nombre=ana', '/api/clientes?q=a&q=b', '/api/clientes?id=abc']) {
    assert.equal((await request(path)).status, 400);
  }
  assert.equal((await request('/api/clientes/999/actividades', 'POST', { descripcion: 'Sin cliente' })).status, 404);
  const { data: persona } = await request('/api/clientes', 'POST', cliente);
  const base = `/api/clientes/${persona.id}/actividades`;
  assert.equal((await request(base, 'POST', { descripcion: 'Fecha inválida', fechaCompromiso: '2026-02-30' })).status, 400);
  assert.equal((await request(base, 'POST', { descripcion: 'Mover', clienteId: 999 })).status, 400);
  const { data: actividad } = await request(base, 'POST', { descripcion: 'Pendiente' });
  assert.equal((await request(`${base}/${actividad.id}/completar`, 'POST', { fechaFinalizacion: null })).status, 400);
  assert.equal((await request(`${base}/${actividad.id}/completar`, 'POST', { descripcion: 'Otra' })).status, 400);
  assert.equal((await request('/no-existe')).status, 404);
});

test('REST: JSON mal formado produce un error JSON con estado 400', async (t) => {
  const connection = connect({ url: ':memory:' });
  const server = crearApp(connection.db).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    connection.close();
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Sin dirección HTTP.');
  const response = await fetch(`http://127.0.0.1:${address.port}/api/clientes`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{mal formado',
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'JSON inválido.' });
});
