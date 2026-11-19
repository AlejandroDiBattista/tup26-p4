// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Conexión con la base de datos.
// - En desarrollo: DATABASE_URL="file:./local.db" (un archivo SQLite local).
// - En producción (Vercel): DATABASE_URL="libsql://....turso.io" y DATABASE_AUTH_TOKEN.
// La aplicación sabe cuál usar SOLO por las variables de entorno.
// [Línea 5] Importa elementos desde 'drizzle-orm/libsql'.
import { drizzle } from "drizzle-orm/libsql";
// [Línea 6] Importa elementos desde '@libsql/client'.
import { createClient } from "@libsql/client";
// [Línea 7] Importa elementos desde './esquema'.
import * as esquema from "./esquema";

// [Línea 9] Declara 'urlBaseDatos' y le asigna el valor resultante.
const urlBaseDatos = process.env.DATABASE_URL ?? "file:./local.db";
// [Línea 10] Declara 'tokenBaseDatos' y le asigna el valor resultante.
const tokenBaseDatos = process.env.DATABASE_AUTH_TOKEN;

// [Línea 12] Declara 'clienteSql' y le asigna el valor resultante.
const clienteSql = createClient({
  // [Línea 13] Define o asigna el campo/parámetro 'url'.
  url: urlBaseDatos,
  // [Línea 14] Define o asigna el campo/parámetro 'authToken'.
  authToken: tokenBaseDatos || undefined,
// [Línea 15] Cierra el bloque o estructura (});).
});

// "db" es el objeto que usan todos los servicios para leer y escribir.
// [Línea 18] Declara y exporta la constante 'db'.
export const db = drizzle(clienteSql, { schema: esquema });

// Tipo de "db" o de una transacción: los servicios aceptan cualquiera de los dos.
// [Línea 21] Define el tipo de datos 'BaseDatos' en TypeScript.
export type BaseDatos = typeof db;
// [Línea 22] Define el tipo de datos 'Transaccion' en TypeScript.
export type Transaccion = Parameters<Parameters<typeof db.transaction>[0]>[0];
// [Línea 23] Define el tipo de datos 'Conexion' en TypeScript.
export type Conexion = BaseDatos | Transaccion;
