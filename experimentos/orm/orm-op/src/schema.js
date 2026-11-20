import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// --- Clientes ---
export const clientes = sqliteTable('clientes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  telefono: text('telefono'),
  email: text('email').notNull().unique(),
})

// --- Actividades ---
// Cada actividad pertenece a un cliente (relación N:1)
// - fechaCompromiso: puede o no tener fecha (opcional)
// - completada: puede o no estar completa (opcional, default false)
export const actividades = sqliteTable('actividades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clienteId: integer('cliente_id')
    .notNull()
    .references(() => clientes.id),
  titulo: text('titulo').notNull(),
  fechaCompromiso: text('fecha_compromiso'), // opcional: fecha de compromiso
  completada: integer('completada', { mode: 'boolean' }).notNull().default(false), // opcional: está completa o no
})