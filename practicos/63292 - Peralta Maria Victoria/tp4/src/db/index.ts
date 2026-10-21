import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema.js";

const client = createClient({ url: "file:minicrm.db" });

export const db = drizzle(client, { schema });

export async function inicializar(): Promise<void> {
  await client.batch(
    [
      `CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL DEFAULT '',
        telefono TEXT NOT NULL DEFAULT '',
        direccion TEXT NOT NULL DEFAULT ''
      )`,
      `CREATE TABLE IF NOT EXISTS actividades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
        descripcion TEXT NOT NULL,
        fecha TEXT,
        completada INTEGER NOT NULL DEFAULT 0,
        completada_en TEXT
      )`,
    ],
    "write"
  );
}
