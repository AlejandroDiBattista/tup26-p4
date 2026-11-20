import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { once } from 'node:events';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

test('MiniCRM: API, validaciones, historial y persistencia', async t => {
  const carpeta = mkdtempSync(join(tmpdir(), 'minicrm-'));
  const archivo = join(carpeta, 'test.sqlite');
  process.env.DATABASE_PATH = archivo;
  const { db, sqlite, root } = await import('../src/db/index.js');
  migrate(db, { migrationsFolder: resolve(root, 'drizzle') });
  const { app } = await import('../src/app.js');
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const base = `http://127.0.0.1:${address.port}`;
  t.after(async () => {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    sqlite.close();
    rmSync(carpeta, { recursive: true, force: true });
  });
  async function request(path: string, method = 'GET', body?: unknown, status = 200) {
    const response = await fetch(base + '/api/clientes' + path, {
      method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body),
    });
    const result = response.status === 204 ? null : await response.json();
    assert.equal(response.status, status, JSON.stringify(result));
    return result;
  }

  await t.test('página, rutas y JSON inválido', async () => {
    const pagina = await fetch(base + '/');
    assert.match(pagina.url, /MiniCRM.html$/);
    assert.match(await pagina.text(), /ReactDOM.createRoot/);
    assert.equal((await fetch(base + '/api/inexistente')).status, 404);
    assert.equal((await fetch(base + '/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400);
    await request('/0', 'GET', undefined, 400);
    await request('/1.5', 'GET', undefined, 400);
    await request('/999999999999999999999', 'GET', undefined, 400);
    await request('/9999', 'GET', undefined, 404);
    await request('?q=hola&q=otro', 'GET', undefined, 400);
    assert.deepEqual(await request(''), []);
  });

  const datos = { nombre: 'Ana García', email: 'ana@example.com', telefono: '3815550123', direccion: 'San Martín 450', ciudad: 'Yerba Buena' };
  const cliente = await request('', 'POST', datos, 201);
  const otro = await request('', 'POST', { nombre: 'Bruno' }, 201);
  const path = '/' + cliente.id;
  await t.test('CRUD y búsqueda por todos los campos', async () => {
    for (const valor of [cliente.id, ...Object.values(datos), 'GARCÍA']) {
      const lista = await request('?q=' + encodeURIComponent(String(valor)));
      assert.ok(lista.some((c: { id: number }) => c.id === cliente.id));
    }
    assert.equal((await request('?q=')).length, 2);
    assert.deepEqual(await request('?q=no-existe'), []);
    assert.equal((await request(path)).nombre, datos.nombre);
    assert.equal((await request(path, 'PUT', { ...datos, telefono: '123456' })).telefono, '123456');
    const conexion = new Database(archivo, { readonly: true });
    try { assert.equal((conexion.prepare('SELECT nombre FROM clientes WHERE id = ?').get(cliente.id) as { nombre: string }).nombre, datos.nombre); }
    finally { conexion.close(); }
  });
  await t.test('rechaza campos inválidos sin modificar datos', async () => {
    for (const body of [{}, null, [], { nombre: ' ' }, { nombre: 42 }, { nombre: 'Ana', email: 'mal' }, { nombre: 'Ana', telefono: 123 }, { nombre: 'Ana', id: 45 }]) {
      await request('', 'POST', body, 400);
    }
    await request(path, 'PUT', { nombre: '' }, 400);
    assert.equal((await request(path)).nombre, datos.nombre);
  });
  await t.test('actividades, pertenencia y protección de completadas', async () => {
    const activityPath = path + '/actividades';
    for (const body of [{ descripcion: '' }, { descripcion: 'A', fecha: '2026-02-30' }, { descripcion: 'A', fecha: '2026-13-01' }, { descripcion: 'A', fecha: 42 }, { descripcion: 'A', completadaEn: 'hoy' }]) {
      await request(activityPath, 'POST', body, 400);
    }
    await request('/9999/actividades', 'POST', { descripcion: 'A' }, 404);
    const actividad = await request(activityPath, 'POST', { descripcion: 'Llamar', fecha: '2026-10-24' }, 201);
    const ap = activityPath + '/' + actividad.id;
    assert.equal((await request(ap, 'PUT', { descripcion: 'Enviar presupuesto', fecha: null })).fecha, null);
    const ajeno = '/' + otro.id + '/actividades/' + actividad.id;
    await request(ajeno, 'PUT', { descripcion: 'Ajena' }, 404);
    await request(ajeno + '/completar', 'PATCH', undefined, 404);
    await request(ajeno, 'DELETE', undefined, 404);
    const completada = await request(ap + '/completar', 'PATCH');
    assert.ok(completada.completadaEn);
    assert.equal((await request(ap + '/completar', 'PATCH')).completadaEn, completada.completadaEn);
    await request(ap, 'PUT', { descripcion: 'Cambio' }, 409);
    await request(ap, 'DELETE', undefined, 409);
    await request(ap + '/completar', 'PATCH', { completadaEn: null }, 400);
    const pendiente = await request(activityPath, 'POST', { descripcion: 'Borrar' }, 201);
    await request(activityPath + '/' + pendiente.id, 'DELETE', undefined, 204);
    assert.equal((await request(path)).actividades.length, 1);
  });
  await t.test('eliminar cliente borra sus actividades y conserva otros clientes', async () => {
    await request(path, 'DELETE', undefined, 204);
    await request(path, 'GET', undefined, 404);
    assert.equal((sqlite.prepare('SELECT count(*) AS cantidad FROM actividades WHERE cliente_id = ?').get(cliente.id) as { cantidad: number }).cantidad, 0);
    assert.equal((await request('/' + otro.id)).nombre, 'Bruno');
    await request(path, 'DELETE', undefined, 404);
  });
});
