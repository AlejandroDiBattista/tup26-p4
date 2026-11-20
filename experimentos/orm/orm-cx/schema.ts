import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const clientes = sqliteTable('clientes', {
  id:       integer('id').primaryKey({ autoIncrement: true }),
  nombre:   text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  telefono: text('telefono'),
  email:    text('email').notNull().unique(),
});

export const actividades = sqliteTable('actividades', {
  id:              integer('id').primaryKey({ autoIncrement: true }),
  clienteId:       integer('cliente_id').notNull().references(() => clientes.id, { onDelete: 'cascade' }),
  descripcion:     text('descripcion').notNull(),
  fecha:           text('fecha'),
  fechaCompromiso: text('fecha_compromiso'),
  completadaEn:    integer('completada_en', { mode: 'timestamp_ms' }),
});
