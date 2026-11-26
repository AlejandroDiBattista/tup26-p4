import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Tabla de clientes.
 */
export const clientes = sqliteTable('clientes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  email: text('email').notNull(),
  telefono: text('telefono'),
  direccion: text('direccion'),
  ciudad: text('ciudad'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Tabla de actividades (compromisos) de cada cliente.
 * La clave foránea elimina en cascada al borrar el cliente.
 */
export const actividades = sqliteTable('actividades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clienteId: integer('cliente_id')
    .notNull()
    .references(() => clientes.id, { onDelete: 'cascade' }),
  descripcion: text('descripcion').notNull(),
  fecha: text('fecha'),
  completada: integer('completada', { mode: 'boolean' }).notNull().default(false),
  fechaCompletada: text('fecha_completada'),
});

export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = typeof clientes.$inferInsert;
export type Actividad = typeof actividades.$inferSelect;
export type NuevaActividad = typeof actividades.$inferInsert;
