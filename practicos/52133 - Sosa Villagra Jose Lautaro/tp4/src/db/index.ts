import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const rutaBaseDeDatos = process.env.DB_FILE ?? 'minicrm.db';

/** Conexión SQLite de bajo nivel (necesaria para PRAGMA y creación de tablas). */
export const sqlite = new Database(rutaBaseDeDatos);

sqlite.pragma('journal_mode = WAL');
// Sin esta opción SQLite ignora ON DELETE CASCADE.
sqlite.pragma('foreign_keys = ON');

/** Cliente Drizzle usado por los servicios. */
export const db = drizzle(sqlite, { schema });

/**
 * Crea las tablas si no existen para que el proyecto funcione
 * con solo ejecutar `npm run dev` (no requiere migraciones previas).
 */
export function inicializarBaseDeDatos(): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre     TEXT    NOT NULL,
      email      TEXT    NOT NULL,
      telefono   TEXT,
      direccion  TEXT,
      ciudad     TEXT,
      created_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS actividades (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id       INTEGER NOT NULL,
      descripcion      TEXT    NOT NULL,
      fecha            TEXT,
      completada       INTEGER NOT NULL DEFAULT 0,
      fecha_completada TEXT,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_actividades_cliente
      ON actividades (cliente_id);
  `);
}

inicializarBaseDeDatos();
