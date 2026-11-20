import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

// Una base temporal real: nunca se toca la base usada por la aplicación.
const directory = mkdtempSync(join(tmpdir(), 'minicrm-test-'));
process.env.DB_FILE = join(directory, 'test.db');
const { app } = await import('../src/app.js');
const { sqlite } = await import('../src/db/index.js');
const server = app.listen(0, '127.0.0.1');
let base: string;
before(async () => {
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  base = `http://127.0.0.1:${address.port}`;
});
after(async () => {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  sqlite.close();
  rmSync(directory, { recursive: true, force: true });
});

async function request(path: string, method = 'GET', body?: unknown) {
  const response = await fetch(base + '/api/clientes' + path, {
    method, headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: response.status === 204 ? null : await response.json() };
}

test('CRUD de clientes, normalización y búsqueda por todos los campos sin tildes', async () => {
  const created = await request('', 'POST', {
    nombre: '  María   José ', apellido: 'Pérez', email: '  MARIA@EXAMPLE.COM ',
    telefono: '+54 (381) 555-0123', domicilio: '  San Martín 450 ', localidad: 'Yerba Buena',
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.nombre, 'María José');
  assert.equal(created.body.email, 'maria@example.com');
  assert.equal(created.body.telefono, '+543815550123');
  const id = created.body.id;
  for (const query of ['maria', 'PEREZ', 'MARIA@EXAMPLE', '543815550123', 'san martin', 'yerba', String(id), 'maria buena']) {
    const result = await request('?q=' + encodeURIComponent(query));
    assert.ok(result.body.some((c: { id: number }) => c.id === id), query);
  }
  assert.deepEqual((await request('?q=inexistente')).body, []);
  const updated = await request(`/${id}`, 'PATCH', { localidad: 'Tafí Viejo', telefono: '' });
  assert.equal(updated.body.localidad, 'Tafí Viejo');
  assert.equal(updated.body.telefono, null);
  assert.equal(updated.body.nombre, 'María José');
  assert.deepEqual((await request(`/${id}`)).body.actividades, []);
  assert.equal((await request(`/${id}`, 'DELETE')).status, 204);
  assert.equal((await request(`/${id}`)).status, 404);
});

test('validaciones del servidor y errores JSON controlados', async () => {
  for (const body of [null, [], {}, { nombre: ' ', apellido: 'X', email: 'a@b.com' },
    { nombre: 'Ana', apellido: 'X', email: 'incorrecto' },
    { nombre: 'Ana', apellido: 'X', email: 'a@b.com', telefono: 'abc' },
    { nombre: 3, apellido: 'X', email: 'a@b.com' }]) {
    assert.equal((await request('', 'POST', body)).status, 400);
  }
  for (const id of ['0', '-1', '1.5', 'abc', '9007199254740993']) assert.equal((await request('/' + id)).status, 400);
  assert.equal((await request('/999999')).status, 404);
  assert.equal((await request('?q=uno&q=dos')).status, 400);
  const invalidJson = await fetch(base + '/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(invalidJson.status, 400);
  assert.match((await invalidJson.json()).error, /JSON/);
});

test('actividades: orden, fechas, pertenencia, edición, completar y protección del historial', async () => {
  const first = (await request('', 'POST', { nombre: 'Ana', apellido: 'García', email: 'ana@example.com' })).body;
  const second = (await request('', 'POST', { nombre: 'Bruno', apellido: 'López', email: 'bruno@example.com' })).body;
  const path = `/${first.id}/actividades`;
  const future = (await request(path, 'POST', { descripcion: 'Llamar', fechaCompromiso: '2099-12-31' })).body;
  const past = (await request(path, 'POST', { descripcion: 'Presupuesto', fechaCompromiso: '2000-01-01' })).body;
  const undated = (await request(path, 'POST', { descripcion: '  Consultar   necesidades  ' })).body;
  assert.equal(undated.descripcion, 'Consultar necesidades');
  assert.equal(undated.fechaCompromiso, null);
  assert.deepEqual((await request(path)).body.map((a: { id: number }) => a.id), [undated.id, past.id, future.id]);
  for (const date of ['2026-02-30', '2026-13-01', '2026-1-01', '0000-01-01', 123]) {
    assert.equal((await request(path, 'POST', { descripcion: 'X', fechaCompromiso: date })).status, 400);
  }
  assert.equal((await request(path, 'POST', { descripcion: ' ' })).status, 400);
  assert.equal((await request(path, 'POST', { descripcion: 'X', fechaFinalizacion: '2026-01-01' })).status, 400);
  assert.equal((await request(path, 'POST', { descripcion: 'Bisiesto', fechaCompromiso: '2028-02-29' })).status, 201);
  const foreignPath = `/${second.id}/actividades/${past.id}`;
  for (const method of ['GET', 'PUT', 'DELETE']) assert.equal((await request(foreignPath, method, method === 'PUT' ? { descripcion: 'Ajena' } : undefined)).status, 404);
  assert.equal((await request(foreignPath + '/completar', 'PATCH')).status, 404);
  const edited = await request(`${path}/${past.id}`, 'PUT', { descripcion: 'Presupuesto actualizado', fechaCompromiso: null });
  assert.equal(edited.body.descripcion, 'Presupuesto actualizado');
  assert.equal(edited.body.fechaCompromiso, null);
  const completed = (await request(`${path}/${past.id}/completar`, 'PATCH')).body;
  assert.ok(completed.fechaFinalizacion);
  assert.deepEqual((await request(`${path}/${past.id}/completar`, 'PATCH')).body, completed);
  assert.equal((await request(`${path}/${past.id}`, 'PUT', { descripcion: 'Alterada' })).status, 409);
  assert.equal((await request(`${path}/${past.id}`, 'PATCH', { fechaFinalizacion: null })).status, 409);
  assert.equal((await request(`${path}/${past.id}`, 'DELETE')).status, 409);
  assert.equal((await request(path)).body.at(-1).id, past.id);
  assert.equal((await request(`${path}/${future.id}`, 'DELETE')).status, 204);
  assert.equal((await request(`/${first.id}`, 'DELETE')).status, 204);
  assert.equal((sqlite.prepare('SELECT count(*) AS cantidad FROM actividades WHERE cliente_id = ?').get(first.id) as { cantidad: number }).cantidad, 0);
  await request(`/${second.id}`, 'DELETE');
});

test('la carga de ejemplos es repetible y los datos persisten entre procesos', () => {
  const seed = () => execFileSync(process.execPath, ['--import', 'tsx', 'src/db/seed.ts'], { env: process.env, encoding: 'utf8' });
  assert.match(seed(), /10 clientes agregados/);
  assert.match(seed(), /0 clientes agregados/);
  assert.equal((sqlite.prepare('SELECT count(*) AS n FROM clientes').get() as { n: number }).n, 10);
  assert.equal((sqlite.prepare('SELECT count(*) AS n FROM actividades').get() as { n: number }).n, 40);
});

test('Express sirve la interfaz y devuelve 404 para rutas desconocidas', async () => {
  const page = await fetch(base + '/');
  assert.equal(page.status, 200);
  assert.match(page.url, /MiniCRM\.html$/);
  const html = await page.text();
  assert.match(html, /react@18\.3\.1/);
  assert.match(html, /runtime: 'classic'/);
  assert.equal((await fetch(base + '/api/inexistente')).status, 404);
});
