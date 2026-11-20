import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const clientes = sqliteTable('clientes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  email: text('email').notNull().default(''),
  telefono: text('telefono').notNull().default(''),
  empresa: text('empresa').notNull().default(''),
  cargo: text('cargo').notNull().default(''),
  notas: text('notas').notNull().default(''),
  creadoEn: text('creado_en').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const actividades = sqliteTable('actividades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clienteId: integer('cliente_id')
    .notNull()
    .references(() => clientes.id, { onDelete: 'cascade' }),
  titulo: text('titulo').notNull(),
  descripcion: text('descripcion').notNull().default(''),
  fecha: text('fecha').notNull(),
  completada: integer('completada', { mode: 'boolean' }).notNull().default(false),
  creadaEn: text('creada_en').notNull().default(sql`CURRENT_TIMESTAMP`),
  completadaEn: text('completada_en'),
});

export const schema = { clientes, actividades };

export type Cliente = typeof clientes.$inferSelect;
export type NuevaCliente = typeof clientes.$inferInsert;
export type Actividad = typeof actividades.$inferSelect;
export type NuevaActividad = typeof actividades.$inferInsert;
