import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const clientes = sqliteTable('clientes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  email: text('email').notNull().unique(),
  telefono: text('telefono'),
});

export const actividades = sqliteTable('actividades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clienteId: integer('cliente_id').notNull().references(() => clientes.id, { onDelete: 'cascade' }),
  descripcion: text('descripcion').notNull(),
  fecha: text('fecha'),
  fechaCompromiso: text('fecha_compromiso'),
  fechaFinalizacion: text('fecha_finalizacion'),
}, tabla => [index('actividades_cliente_idx').on(tabla.clienteId)]);

export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = Omit<typeof clientes.$inferInsert, 'id'>;
export type Actividad = typeof actividades.$inferSelect;
export type NuevaActividad = Omit<typeof actividades.$inferInsert, 'id' | 'clienteId' | 'fechaFinalizacion'>;
