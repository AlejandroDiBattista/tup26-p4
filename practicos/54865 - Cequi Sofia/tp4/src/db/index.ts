import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
import path from "node:path";

const dbPath = path.resolve(process.cwd(), "data.db");
const sqlite = new Database(dbPath);

// Activar soporte para claves foráneas en SQLite
sqlite.pragma("foreign_keys = ON");

// Inicialización de tablas si no existen para una ejecución rápida y confiable
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    domicilio TEXT,
    localidad TEXT
  );

  CREATE TABLE IF NOT EXISTS actividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    fecha_compromiso TEXT,
    fecha_finalizacion TEXT
  );
`);

export const db = drizzle(sqlite, { schema });

