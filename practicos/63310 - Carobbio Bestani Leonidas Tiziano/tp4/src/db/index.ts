import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const sqlite = new Database("minicrm.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite);

// Para que el proyecto funcione sin pasos de migración adicionales en la primera ejecución.
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    telefono TEXT NOT NULL DEFAULT '',
    empresa TEXT NOT NULL DEFAULT '',
    notas TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS actividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL DEFAULT '',
    fecha TEXT NOT NULL DEFAULT '',
    completada INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
  );
`);
