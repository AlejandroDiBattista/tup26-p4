import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema.js";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, "../../minicrm.db");

export const client = createClient({
  url: `file:${dbPath}`,
});

export const db = drizzle(client, { schema });

/**
 * Inicializa las tablas necesarias en SQLite mediante libSQL si no existen aún.
 */
export async function inicializarBaseDeDatos() {
  await client.executeMultiple(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL,
      telefono TEXT NOT NULL DEFAULT '',
      domicilio TEXT NOT NULL DEFAULT '',
      creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS actividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
      descripcion TEXT NOT NULL,
      fecha TEXT,
      completada INTEGER NOT NULL DEFAULT 0,
      fecha_completada TEXT,
      creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
