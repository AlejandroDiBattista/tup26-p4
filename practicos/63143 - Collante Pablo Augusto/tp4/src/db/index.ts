import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const sqlite = new Database(process.env.DB_FILE ?? 'minicrm.sqlite');
sqlite.pragma('foreign_keys = ON');
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    telefono TEXT NOT NULL DEFAULT '',
    direccion TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS actividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    fecha TEXT,
    completada INTEGER NOT NULL DEFAULT 0,
    completada_en TEXT
  );
  CREATE INDEX IF NOT EXISTS actividades_cliente_id_idx ON actividades(cliente_id);
`);

export const db = drizzle(sqlite);
