import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const clientes = sqliteTable('clientes', {
  id: integer().primaryKey(),
  nombre: text().notNull(),
  email: text().notNull().default(''),
  telefono: text().notNull().default(''),
  direccion: text().notNull().default(''),
});

export const actividades = sqliteTable('actividades', {
  id: integer().primaryKey(),
  clienteId: integer('cliente_id').notNull().references(() => clientes.id, { onDelete: 'cascade' }),
  descripcion: text().notNull(),
  fecha: text().notNull().default(''),
  completada: integer({ mode: 'boolean' }).notNull().default(false),
});
