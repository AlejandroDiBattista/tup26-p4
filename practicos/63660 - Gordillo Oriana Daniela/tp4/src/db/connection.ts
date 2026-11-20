import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.TURSO_DATABASE_URL || `file:${path.resolve(__dirname, '../../minicrm.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

export const client = createClient({
  url: dbUrl,
  authToken: authToken,
});

export const db = drizzle(client, { schema });

/**
 * Inicializa las tablas SQLite automáticamente si no existen
 */
export async function initDb() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      email TEXT NOT NULL,
      domicilio TEXT,
      localidad TEXT,
      telefono TEXT
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS actividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      descripcion TEXT NOT NULL,
      fecha_compromiso TEXT,
      fecha_finalizacion TEXT,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    );
  `);

  await client.execute(`PRAGMA foreign_keys = ON;`);
}
