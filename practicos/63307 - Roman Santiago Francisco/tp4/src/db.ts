import Database from 'better-sqlite3';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const sqlite = new Database('minicrm.db');
export const db = drizzle(sqlite);

export const clientes = sqliteTable('clientes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  email: text('email').notNull(),
  telefono: text('telefono'),
  direccion: text('direccion')
});

export const actividades = sqliteTable('actividades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clienteId: integer('cliente_id').notNull(),
  descripcion: text('descripcion').notNull(),
  fecha: text('fecha'),
  completada: integer('completada', { mode: 'boolean' }).notNull().default(false)
});

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    direccion TEXT
  );
  CREATE TABLE IF NOT EXISTS actividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    descripcion TEXT NOT NULL,
    fecha TEXT,
    completada INTEGER DEFAULT 0,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
  );
`);