// Conexión con la base de datos.
// - En desarrollo: DATABASE_URL="file:./local.db" (un archivo SQLite local).
// - En producción (Vercel): DATABASE_URL="libsql://....turso.io" y DATABASE_AUTH_TOKEN.
// La aplicación sabe cuál usar SOLO por las variables de entorno.
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as esquema from "./esquema";

const urlBaseDatos = process.env.DATABASE_URL ?? "file:./local.db";
const tokenBaseDatos = process.env.DATABASE_AUTH_TOKEN;

const clienteSql = createClient({
  url: urlBaseDatos,
  authToken: tokenBaseDatos || undefined,
});

// "db" es el objeto que usan todos los servicios para leer y escribir.
export const db = drizzle(clienteSql, { schema: esquema });

// Tipo de "db" o de una transacción: los servicios aceptan cualquiera de los dos.
export type BaseDatos = typeof db;
export type Transaccion = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type Conexion = BaseDatos | Transaccion;
