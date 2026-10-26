import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

// Archivo de la base de datos en la raíz de tp4
const sqlite = new Database('minicrm.sqlite');

// Asegurar que las tablas existan al iniciar
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    direccion TEXT,
    ciudad TEXT
  );

  CREATE TABLE IF NOT EXISTS actividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    fecha_limite TEXT,
    completada BOOLEAN NOT NULL DEFAULT 0
  );
`);

export const db = drizzle(sqlite, { schema });