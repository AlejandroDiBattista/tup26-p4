import Sqlite from 'better-sqlite3'
import {drizzle} from 'drizzle-orm/better-sqlite3'
import {sqliteTable,integer,text} from 'drizzle-orm/sqlite-core'

const archivo=new Sqlite('clientes.db')
archivo.pragma('foreign_keys = ON')
archivo.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, correo TEXT NOT NULL, telefono TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS actividades (
    id INTEGER PRIMARY KEY, cliente INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    detalle TEXT NOT NULL, fecha TEXT NOT NULL, completa INTEGER NOT NULL DEFAULT 0
  );
`)
export const base=drizzle(archivo)
export const clientes=sqliteTable('clientes',{
  id:integer().primaryKey(), nombre:text().notNull(), correo:text().notNull(), telefono:text().notNull()
})
export const actividades=sqliteTable('actividades',{
  id:integer().primaryKey(), cliente:integer().notNull(), detalle:text().notNull(),
  fecha:text().notNull(), completa:integer({mode:'boolean'}).notNull().default(false)
})
