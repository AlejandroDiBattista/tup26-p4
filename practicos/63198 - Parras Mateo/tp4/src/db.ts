import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const sqlite = new Database("minicrm.db");
sqlite.pragma("foreign_keys = ON");

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
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    fecha TEXT,
    completada INTEGER NOT NULL DEFAULT 0,
    fecha_completada TEXT
    );
`);

export const db = drizzle(sqlite);