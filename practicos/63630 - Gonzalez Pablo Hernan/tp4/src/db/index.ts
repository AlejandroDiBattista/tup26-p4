import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.ts';

const client = createClient({ url: process.env.DB_URL ?? 'file:minicrm.db' });
export const db = drizzle(client, { schema });

// Crea las tablas si no existen (evita depender de drizzle-kit para correr el TP).
export async function iniciarDB() {
  await client.execute('PRAGMA foreign_keys = ON');
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      telefono TEXT NOT NULL DEFAULT '',
      direccion TEXT NOT NULL DEFAULT '',
      ciudad TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS actividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
      descripcion TEXT NOT NULL,
      fecha TEXT,
      completada INTEGER NOT NULL DEFAULT 0,
      completada_el TEXT
    );
  `);

  const [{ n }] = (await client.execute('SELECT COUNT(*) AS n FROM clientes')).rows as any;
  if (Number(n) === 0) await sembrar();
}

async function sembrar() {
  const ejemplos = [
    ['Ana García', 'ana.garcia@example.com', '381 555 0123', 'San Martín 450', 'Yerba Buena'],
    ['Bruno López', 'bruno.lopez@example.com', '381 555 0456', 'Mate de Luna 1200', 'San Miguel de Tucumán'],
    ['Carla Pérez', 'carla.perez@example.com', '381 555 0789', 'Aconquija 800', 'Yerba Buena'],
    ['Diego Ruiz', 'diego.ruiz@example.com', '381 555 1011', 'Belgrano 300', 'Tafí Viejo'],
    ['Elena Torres', 'elena.torres@example.com', '381 555 1213', 'Rivadavia 50', 'Banda del Río Salí'],
  ];
  const insertados = await db.insert(schema.clientes)
    .values(ejemplos.map(([nombre, email, telefono, direccion, ciudad]) => ({ nombre, email, telefono, direccion, ciudad })))
    .returning();
  await db.insert(schema.actividades).values([
    { clienteId: insertados[0].id, descripcion: 'Llamar para seguimiento', fecha: '2026-10-28' },
    { clienteId: insertados[0].id, descripcion: 'Enviar presupuesto', fecha: '2026-10-16' },
    { clienteId: insertados[0].id, descripcion: 'Primera reunión', completada: true, completadaEl: '2026-10-12' },
    { clienteId: insertados[1].id, descripcion: 'Consultar nuevas necesidades' },
  ]);
}
