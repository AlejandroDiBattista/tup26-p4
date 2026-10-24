import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const clientes = sqliteTable('clientes', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  nombre:    text('nombre').notNull(),
  email:     text('email').notNull().unique(),
  telefono:  text('telefono').notNull(),
  direccion: text('direccion').notNull(),
})

export const actividades = sqliteTable('actividades', {
  id:            integer('id').primaryKey({ autoIncrement: true }),
  clienteId:     integer('cliente_id').notNull().references(() => clientes.id, { onDelete: 'cascade' }),
  fecha:         text('fecha'),
  descripcion:   text('descripcion').notNull(),
  completada:    integer('completada', { mode: 'boolean' }).notNull().default(false),
  fechaCompletada: text('fecha_completada'),
})