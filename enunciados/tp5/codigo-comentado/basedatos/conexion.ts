// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: basedatos/conexion.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================
//
// [DEFENSA PARCIAL] ¿Dónde se conecta con la base de datos? En este archivo.
// [DEFENSA PARCIAL] ¿Cómo sabe si usar la base local o Turso? Revisa la variable TURSO_DATABASE_URL.
// Si existe y empieza con 'libsql:', usa Turso en la nube. Si no, usa SQLite local en 'file:./local.db'.
//

// Conexión con la base de datos.
// - En desarrollo: DATABASE_URL="file:./local.db" (un archivo SQLite local).
// - En producción (Vercel): DATABASE_URL="libsql://....turso.io" y DATABASE_AUTH_TOKEN.
// La aplicación sabe cuál usar SOLO por las variables de entorno.
// Acá importamos funciones y operadores de Drizzle ORM para interactuar con la base de datos
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
