import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as esquema from './esquema.js'

const archivo = process.env.DB_FILE ?? 'minicrm.sqlite'

const sqlite = new Database(archivo)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

// Crea las tablas si todavía no existen (migración inicial).
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    domicilio TEXT,
    localidad TEXT,
    telefono TEXT
  );
  CREATE TABLE IF NOT EXISTS actividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    fecha_compromiso TEXT,
    fecha_finalizacion TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_actividades_cliente ON actividades(cliente_id);
`)

export const db = drizzle(sqlite, { schema: esquema })
