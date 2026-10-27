import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const clientes = sqliteTable('clientes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  email: text('email').notNull().default(''),
  telefono: text('telefono').notNull().default(''),
  direccion: text('direccion').notNull().default('')
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
export type Actividad = typeof actividades.$inferSelect
