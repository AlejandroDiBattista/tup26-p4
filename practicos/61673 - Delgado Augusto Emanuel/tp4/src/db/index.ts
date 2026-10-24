import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'minicrm.db');
const sqlite = new Database(dbPath);

// Habilitar foreign keys para soportar eliminación en cascada
sqlite.pragma('foreign_keys = ON');

// Crear tablas si no existen
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    direccion TEXT,
    ciudad TEXT,
    created_at TEXT DEFAULT (CURRENT_TIMESTAMP)
  );

  CREATE TABLE IF NOT EXISTS actividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    fecha TEXT,
    completada INTEGER NOT NULL DEFAULT 0,
    fecha_completada TEXT,
    created_at TEXT DEFAULT (CURRENT_TIMESTAMP)
  );
`);

export const db = drizzle(sqlite, { schema });
export { sqlite };
