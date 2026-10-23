import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const clientes = sqliteTable('clientes', {
  id: integer().primaryKey({ autoIncrement: true }),
  nombre: text().notNull(),
  apellido: text().notNull(),
  email: text().notNull().unique(),
  telefono: text(),
});

// Cada actividad pertenece a un cliente y se borra junto con él.
// fecha y compromiso son fechas de calendario (AAAA-MM-DD).
// finalizacion es fecha y hora: si es null, la actividad está pendiente.
export const actividades = sqliteTable('actividades', {
  id: integer().primaryKey({ autoIncrement: true }),
  clienteId: integer('cliente_id')
    .notNull()
    .references(() => clientes.id, { onDelete: 'cascade' }),
  descripcion: text().notNull(),
  fecha: text(),
  compromiso: text(),
  finalizacion: integer({ mode: 'timestamp' }),
});

export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = typeof clientes.$inferInsert;
export type Actividad = typeof actividades.$inferSelect;
export type NuevaActividad = typeof actividades.$inferInsert;
