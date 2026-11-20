import assert from 'node:assert/strict';
import { test } from 'node:test';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq } from 'drizzle-orm';
import { databaseConfig } from '../src/config.js';
import { connect } from '../src/db/connection.js';
import { Clientes } from '../src/clientes.js';
import { actividades, clientes } from '../src/db/schema.js';
import { sembrar } from '../src/db/seed.js';

test('carga repetible: 10 clientes, 40 actividades y fechas opcionales', async () => {
  const connection = connect({ url: ':memory:' });
  try {
    await migrate(connection.db, { migrationsFolder: 'drizzle' });
    await migrate(connection.db, { migrationsFolder: 'drizzle' });
    await sembrar(connection.db);
    const primeraCarga = await Clientes.buscar(connection.db);
    await sembrar(connection.db);
    assert.deepEqual(await Clientes.buscar(connection.db), primeraCarga);
    assert.equal(primeraCarga.length, 10);
    for (const cliente of primeraCarga) {
      assert.equal(cliente.actividades.length, 4);
      assert.equal(cliente.actividades.filter((a) => a.fechaFinalizacion !== null).length, 2);
      assert.equal(cliente.actividades.filter((a) => a.fechaFinalizacion === null).length, 2);
      assert.equal(cliente.actividades.filter((a) => a.fechaCompromiso === null).length, 2);
    }

    // Repetir la carga conserva las ediciones del usuario.
    const actividad = primeraCarga[0].actividades[2];
    await connection.db.update(actividades).set({ fechaFinalizacion: '2026-10-16' })
      .where(eq(actividades.id, actividad.id));
    await sembrar(connection.db);
    const [actualizada] = await connection.db.select().from(actividades).where(eq(actividades.id, actividad.id));
    assert.equal(actualizada.fechaFinalizacion, '2026-10-16');

    await assert.rejects(connection.db.insert(clientes).values({
      nombre: 'Otra', apellido: 'Persona', email: primeraCarga[0].email,
    }));
    await assert.rejects(connection.db.insert(actividades).values({ clienteId: -1, descripcion: 'Huérfana' }));
    await connection.db.delete(clientes).where(eq(clientes.id, primeraCarga[0].id));
    assert.equal((await connection.db.select().from(actividades)).length, 36);
  } finally {
    connection.close();
  }
});

test('desarrollo usa SQLite local', () => {
  assert.deepEqual(databaseConfig({ NODE_ENV: 'development' }), { url: 'file:local.db' });
});

test('producción requiere configuración remota completa', () => {
  assert.throws(() => databaseConfig({ NODE_ENV: 'production' }), /Producción requiere/);
  assert.throws(() => databaseConfig({
    NODE_ENV: 'production', TURSO_DATABASE_URL: 'file:local.db', TURSO_AUTH_TOKEN: 'token',
  }));
  assert.deepEqual(databaseConfig({
    NODE_ENV: 'production', TURSO_DATABASE_URL: 'libsql://demo.turso.io', TURSO_AUTH_TOKEN: 'token',
  }), { url: 'libsql://demo.turso.io', authToken: 'token' });
});
