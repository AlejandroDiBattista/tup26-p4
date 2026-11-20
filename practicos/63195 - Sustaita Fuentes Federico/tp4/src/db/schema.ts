import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const clientes = sqliteTable('clientes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  email: text('email').notNull().unique(),
  telefono: text('telefono').notNull().default(''),
  direccion: text('direccion').notNull().default(''),
  ciudad: text('ciudad').notNull().default(''),
});

export const actividades = sqliteTable('actividades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clienteId: integer('cliente_id')
    .notNull()
    .references(() => clientes.id, { onDelete: 'cascade' }),
  descripcion: text('descripcion').notNull(),
  fecha: text('fecha'), // YYYY-MM-DD, opcional
  completada: integer('completada', { mode: 'boolean' }).notNull().default(false),
  completadaEl: text('completada_el'), // YYYY-MM-DD
});

export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = typeof clientes.$inferInsert;
export type Actividad = typeof actividades.$inferSelect;
