import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema.js";

export const client = createClient({
  url: process.env.DATABASE_URL || "file:local.db",
});

export const db = drizzle(client, { schema });

export async function initDb() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      domicilio TEXT,
      localidad TEXT,
      telefono TEXT
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS actividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
      descripcion TEXT NOT NULL,
      fecha_compromiso TEXT,
      fecha_finalizacion TEXT
    );
  `);
}
