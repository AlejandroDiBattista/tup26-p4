import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { relations, count } from 'drizzle-orm';

// --- Tablas y Esquema ---

export const clientes = sqliteTable('clientes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  email: text('email').notNull().default(''),
  telefono: text('telefono').notNull().default(''),
  direccion: text('direccion').notNull().default(''),
});

export const actividades = sqliteTable('actividades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clienteId: integer('cliente_id')
    .notNull()
    .references(() => clientes.id, { onDelete: 'cascade' }),
  descripcion: text('descripcion').notNull(),
  fecha: text('fecha'), // 'YYYY-MM-DD' o null
  completada: integer('completada', { mode: 'boolean' }).notNull().default(false),
  fechaCompletada: text('fecha_completada'), // 'YYYY-MM-DD'
});

export const clientesRelations = relations(clientes, ({ many }) => ({
  actividades: many(actividades),
}));

export const actividadesRelations = relations(actividades, ({ one }) => ({
  cliente: one(clientes, {
    fields: [actividades.clienteId],
    references: [clientes.id],
  }),
}));

export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = typeof clientes.$inferInsert;
export type Actividad = typeof actividades.$inferSelect;
export type NuevaActividad = typeof actividades.$inferInsert;

export const schema = {
  clientes,
  actividades,
  clientesRelations,
  actividadesRelations,
};

// --- Conexión SQLite ---

export const client = createClient({
  url: 'file:minicrm.db',
});

export const db = drizzle(client, { schema });

// --- Inicialización y Seed ---

export async function initDb(): Promise<void> {
  // Habilitar claves foráneas para que ON DELETE CASCADE funcione en SQLite
  await client.execute('PRAGMA foreign_keys = ON;');

  // Crear tablas si no existen
  await client.execute(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      telefono TEXT NOT NULL DEFAULT '',
      direccion TEXT NOT NULL DEFAULT ''
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS actividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
      descripcion TEXT NOT NULL,
      fecha TEXT,
      completada INTEGER NOT NULL DEFAULT 0,
      fecha_completada TEXT
    );
  `);

  // Semilla de datos si la base está vacía
  const [{ total }] = await db.select({ total: count() }).from(clientes);

  if (total === 0) {
    const [ana] = await db.insert(clientes).values({
      nombre: 'Ana García',
      email: 'ana.garcia@example.com',
      telefono: '381 555 0123',
      direccion: 'San Martín 450, Yerba Buena',
    }).returning();

    await db.insert(clientes).values([
      {
        nombre: 'Bruno López',
        email: 'bruno.lopez@example.com',
        telefono: '381 555 0456',
        direccion: 'Av. Aconquija 1200, Yerba Buena',
      },
      {
        nombre: 'Carla Pérez',
        email: 'carla.perez@example.com',
        telefono: '381 555 0789',
        direccion: '25 de Mayo 320, San Miguel de Tucumán',
      },
      {
        nombre: 'Diego Ruiz',
        email: 'diego.ruiz@example.com',
        telefono: '381 555 0321',
        direccion: 'Laprida 150, San Miguel de Tucumán',
      },
      {
        nombre: 'Elena Torres',
        email: 'elena.torres@example.com',
        telefono: '381 555 0654',
        direccion: 'Muñecas 820, San Miguel de Tucumán',
      },
      {
        nombre: 'Federico Díaz',
        email: 'federico.diaz@example.com',
        telefono: '381 555 0987',
        direccion: 'Corrientes 430, San Miguel de Tucumán',
      },
      {
        nombre: 'Gabriela Sosa',
        email: 'gabriela.sosa@example.com',
        telefono: '381 555 0147',
        direccion: 'San Juan 610, San Miguel de Tucumán',
      },
    ]);

    // Actividades para Ana García
    if (ana) {
      await db.insert(actividades).values([
        {
          clienteId: ana.id,
          descripcion: 'Consultar nuevas necesidades',
          fecha: null,
          completada: false,
        },
        {
          clienteId: ana.id,
          descripcion: 'Enviar presupuesto',
          fecha: '2026-10-16',
          completada: false,
        },
        {
          clienteId: ana.id,
          descripcion: 'Llamar para seguimiento',
          fecha: '2026-10-22',
          completada: false,
        },
        {
          clienteId: ana.id,
          descripcion: 'Enviar presentación',
          fecha: '2026-10-15',
          completada: true,
          fechaCompletada: '2026-10-15',
        },
        {
          clienteId: ana.id,
          descripcion: 'Primera reunión',
          fecha: '2026-10-12',
          completada: true,
          fechaCompletada: '2026-10-12',
        },
      ]);
    }
  }
}
