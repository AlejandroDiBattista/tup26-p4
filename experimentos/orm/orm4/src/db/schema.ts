import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const clientes = sqliteTable('clientes', {
  id:                  integer('id').primaryKey({ autoIncrement: true }),
  nombre:              text('nombre').notNull(),
  apellido:            text('apellido').notNull(),
  telefono:            text('telefono'),
  email:               text('email').notNull().unique(),
});

export const actividades = sqliteTable('actividades', {
  id:                  integer('id').primaryKey({ autoIncrement: true }),
  clienteId:           integer('cliente_id').notNull().references(() => clientes.id),
  descripcion:         text('descripcion').notNull(),
  completa:            integer('completa', { mode: 'boolean' }).notNull().default(false),
  fechaRealizacion:    integer('fecha_realizacion', { mode: 'timestamp' }),
  fechaComprometida:   integer('fecha_comprometida', { mode: 'timestamp' }),
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
