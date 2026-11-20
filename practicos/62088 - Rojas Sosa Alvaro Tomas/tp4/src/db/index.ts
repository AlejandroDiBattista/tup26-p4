import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as schema from './schema.js'

const aqui = dirname(fileURLToPath(import.meta.url))
export const ARCHIVO_DB = join(aqui, '..', '..', 'minicrm.db')

const sqlite = new Database(ARCHIVO_DB)
sqlite.pragma('journal_mode = DELETE')
sqlite.pragma('foreign_keys = ON')

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre    TEXT NOT NULL,
    apellido  TEXT NOT NULL,
    email     TEXT NOT NULL UNIQUE,
    telefono  TEXT,
    domicilio TEXT,
    localidad TEXT
  );

  CREATE TABLE IF NOT EXISTS actividades (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id        INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    descripcion       TEXT NOT NULL,
    fecha_compromiso  TEXT,
    fecha_finalizacion TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_actividades_cliente ON actividades(cliente_id);
`)

// Funcion propia de SQLite: pasa a minusculas y saca las tildes, para que la
// busqueda encuentre "Garcia" escribiendo "garcia" y viceversa.
sqlite.function('sin_acentos', (texto: unknown) => {
  if (typeof texto !== 'string') return null
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
})

export const db = drizzle(sqlite, { schema })
export { schema }
