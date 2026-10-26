import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const clientes = sqliteTable('clientes', {
  id: integer('id').primaryKey(),
  nombre: text('nombre').notNull(),
  email: text('email').notNull(),
  telefono: text('telefono'),
  direccion: text('direccion'),
  ciudad: text('ciudad'),
});

export const actividades = sqliteTable('actividades', {
  id: integer('id').primaryKey(),
  clienteId: integer('cliente_id')
    .notNull()
    .references(() => clientes.id, { onDelete: 'cascade' }),
  descripcion: text('descripcion').notNull(),
  fecha: text('fecha'),
  completada: integer('completada', { mode: 'boolean' }).notNull().default(false),
  completadaEl: text('completada_el'),
});