import { test, before } from 'node:test';
import assert from 'node:assert/strict';

process.env.TURSO_DATABASE_URL = 'file:test.sqlite';

const { db } = await import('../src/db/index.js');
const { clientes, actividades } = await import('../src/db/schema.js');
const { Clientes } = await import('../src/services/clientes.js');
const { pushSQLiteSchema } = await import('drizzle-kit/api');

before(async () => {
  await (await pushSQLiteSchema({ clientes, actividades }, db as any)).apply();
  await db.delete(actividades);
  await db.delete(clientes);
});

test('normaliza y valida al crear', async () => {
  const c = await Clientes.crear({ nombre: '  aNA maría ', apellido: 'PAZ', email: ' ANA@Example.COM ', telefono: '(381) 400-1001' });
  assert.deepEqual([c.nombre, c.apellido, c.email, c.telefono], ['Ana María', 'Paz', 'ana@example.com', '3814001001']);
  await assert.rejects(Clientes.crear({ nombre: 'X', apellido: 'Y', email: 'ana@example.com' }), { codigo: 'conflicto' });
  await assert.rejects(Clientes.crear({ nombre: 'X', apellido: 'Y', email: 'malo' }), { codigo: 'invalido' });
});

test('busca por cualquier campo', async () => {
  await Clientes.crear({ nombre: 'Luis', apellido: 'Gómez', email: 'luis@example.com', localidad: 'salta' });
  assert.equal((await Clientes.buscar('salta')).length, 1);
  assert.equal((await Clientes.buscar('example')).length, 2);
  assert.equal((await Clientes.buscar({ apellido: 'paz' })).length, 1);
  assert.equal((await Clientes.buscar()).length, 2);
});

test('actividades: estados y restricciones de las completadas', async () => {
  const [c] = await Clientes.buscar('luis');
  const vencida = await Clientes.agregarActividad(c.id, { descripcion: 'Llamar', fechaCompromiso: '2000-01-01' });
  const sinFecha = await Clientes.agregarActividad(c.id, { descripcion: 'Pensar' });
  assert.equal(vencida.estado, 'vencida');
  assert.equal(sinFecha.estado, 'pendiente');

  const hecha = await Clientes.completarActividad(c.id, vencida.id, '2026-10-01');
  assert.equal(hecha.estado, 'completada');
  await assert.rejects(Clientes.actualizarActividad(c.id, hecha.id, { descripcion: 'x' }), { codigo: 'conflicto' });
  await assert.rejects(Clientes.eliminarActividad(c.id, hecha.id), { codigo: 'conflicto' });

  await assert.rejects(Clientes.eliminarActividad(c.id + 999, sinFecha.id), { codigo: 'no_encontrado' });
  await Clientes.eliminarActividad(c.id, sinFecha.id);
  assert.equal((await Clientes.obtener(c.id)).actividades.length, 1);
});

test('eliminar cliente borra sus actividades', async () => {
  const [c] = await Clientes.buscar('luis');
  await Clientes.eliminar(c.id);
  await assert.rejects(Clientes.obtener(c.id), { codigo: 'no_encontrado' });
  assert.equal((await db.select().from(actividades)).length, 0);
});
