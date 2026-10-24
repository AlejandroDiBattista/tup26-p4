import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const clientes = sqliteTable('clientes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  email: text('email').notNull(),
  telefono: text('telefono').notNull(),
  direccion: text('direccion').notNull(),
  ciudad: text('ciudad').notNull(),
  creadoEn: text('creado_en').notNull()
})

export const actividades = sqliteTable('actividades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clienteId: integer('cliente_id')
    .notNull()
    .references(() => clientes.id, { onDelete: 'cascade' }),
  descripcion: text('descripcion').notNull(),
  fecha: text('fecha'),
  completada: integer('completada', { mode: 'boolean' }).notNull().default(false),
  fechaCompletada: text('fecha_completada')
})

export type Cliente = typeof clientes.$inferSelect
export type NuevoCliente = typeof clientes.$inferInsert
export type Actividad = typeof actividades.$inferSelect
export type NuevaActividad = typeof actividades.$inferInsert
