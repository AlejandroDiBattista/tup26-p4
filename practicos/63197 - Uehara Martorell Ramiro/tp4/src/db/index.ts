import { mkdirSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const carpeta = join(import.meta.dirname, "../../data");
mkdirSync(carpeta, { recursive: true });

const sqlite = new Database(join(carpeta, "minicrm.db"));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Crea las tablas la primera vez, sin necesidad de migraciones.
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre    TEXT NOT NULL,
    email     TEXT NOT NULL DEFAULT '',
    telefono  TEXT NOT NULL DEFAULT '',
    direccion TEXT NOT NULL DEFAULT '',
    ciudad    TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS actividades (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id    INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    descripcion   TEXT NOT NULL,
    fecha         TEXT,
    completada    INTEGER NOT NULL DEFAULT 0,
    completada_en TEXT
  );
`);

export const db = drizzle(sqlite, { schema });
