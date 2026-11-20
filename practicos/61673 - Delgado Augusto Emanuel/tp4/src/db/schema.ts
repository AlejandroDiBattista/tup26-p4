import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

export const clientes = sqliteTable('clientes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  email: text('email'),
  telefono: text('telefono'),
  direccion: text('direccion'),
  ciudad: text('ciudad'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});

export const actividades = sqliteTable('actividades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clienteId: integer('cliente_id')
    .notNull()
    .references(() => clientes.id, { onDelete: 'cascade' }),
  descripcion: text('descripcion').notNull(),
  fecha: text('fecha'), // Formato YYYY-MM-DD o fecha textual
  completada: integer('completada').notNull().default(0), // 0: falso, 1: verdadero
  fechaCompletada: text('fecha_completada'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
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
