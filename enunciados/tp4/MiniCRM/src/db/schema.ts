import {
    integer,
    sqliteTable,
    text,
} from 'drizzle-orm/sqlite-core';

import { sql } from 'drizzle-orm';

export const clientes = sqliteTable('clientes', {
    id: integer('id').primaryKey({ autoIncrement: true }),

    nombre: text('nombre').notNull(),

    apellido: text('apellido').notNull(),

    email: text('email').notNull(),

    telefono: text('telefono'),

    empresa: text('empresa'),

    notas: text('notas'),

    createdAt: text('created_at')
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
});


export const actividades = sqliteTable('actividades', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    clienteId: integer('cliente_id')
     .notNull()
     .references(() => clientes.id, {
        onDelete:'cascade',
    }),

    titulo: text('titulo').notNull(),
    descripcion: text('descripcion'),
    fecha: text('fecha'),
    completada: integer('completada', {
        mode: 'boolean',
    }).default(false).notNull(),

    createdAt: text('created_at')
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
});