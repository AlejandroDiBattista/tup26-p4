// Importamos el cliente oficial de SQLite (LibSQL) que no requiere compilación nativa en Windows
import { createClient } from "@libsql/client";

// Importamos el adaptador de Drizzle para LibSQL
import { drizzle } from "drizzle-orm/libsql";

// Importamos los esquemas de tablas definidos previamente
import * as schema from "./schema.js";

// Creamos la conexión con el archivo de base de datos local 'local.db'
export const client = createClient({
  url: process.env.DATABASE_URL || "file:local.db",
});

// Inicializamos la instancia de Drizzle pasando el cliente y el esquema
export const db = drizzle(client, { schema });

// Función para inicializar la base de datos y crear las tablas si todavía no existen
export async function initDb() {
  // Ejecutamos la sentencia SQL para crear la tabla de clientes si no existe
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

  // Ejecutamos la sentencia SQL para crear la tabla de actividades si no existe
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
