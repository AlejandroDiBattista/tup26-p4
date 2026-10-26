import { sqliteTable, integer, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core'

// nombre, apellido y email son obligatorios; el resto puede quedar en null.
export const clientes = sqliteTable('clientes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  email: text('email').notNull().unique(),
  telefono: text('telefono'),
  domicilio: text('domicilio'),
  localidad: text('localidad'),
})

// Las fechas se guardan como texto ISO (aaaa-mm-dd): es lo que entrega y espera
// un <input type="date">, y ordena bien alfabeticamente sin lidiar con husos horarios.
//
//   fechaCompromiso   null = la actividad no tiene fecha acordada
//   fechaFinalizacion null mientras esta pendiente; se llena al completarla
export const actividades = sqliteTable(
  'actividades',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    clienteId: integer('cliente_id')
      .notNull()
      .references(() => clientes.id, { onDelete: 'cascade' }),
    descripcion: text('descripcion').notNull(),
    fechaCompromiso: text('fecha_compromiso'),
    fechaFinalizacion: text('fecha_finalizacion'),
  },
  (tabla) => [index('idx_actividades_cliente').on(tabla.clienteId)],
)

export type Cliente = typeof clientes.$inferSelect
export type ClienteNuevo = typeof clientes.$inferInsert
export type Actividad = typeof actividades.$inferSelect
export type ActividadNueva = typeof actividades.$inferInsert
