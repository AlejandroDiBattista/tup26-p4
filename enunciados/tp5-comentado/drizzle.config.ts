// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Configuración de drizzle-kit: de dónde lee el esquema y dónde deja las migraciones.
// [Línea 2] Inicia un bloque de importación de dependencias.
import "dotenv/config";
// [Línea 3] Importa elementos desde 'drizzle-kit'.
import { defineConfig } from "drizzle-kit";

// [Línea 5] Declara 'urlBaseDatos' y le asigna el valor resultante.
const urlBaseDatos = process.env.DATABASE_URL ?? "file:./local.db";
// [Línea 6] Declara 'esTurso' y le asigna el valor resultante.
const esTurso = urlBaseDatos.startsWith("libsql://");

// [Línea 8] Ejecuta o evalúa: export default defineConfig({
export default defineConfig({
  // [Línea 9] Define o asigna el campo/parámetro 'schema'.
  schema: "./basedatos/esquema.ts",
  // [Línea 10] Define o asigna el campo/parámetro 'out'.
  out: "./basedatos/migraciones",
  // [Línea 11] Define o asigna el campo/parámetro 'dialect'.
  dialect: esTurso ? "turso" : "sqlite",
  // [Línea 12] Define o asigna el campo/parámetro 'dbCredentials'.
  dbCredentials: esTurso
    // [Línea 13] Ejecuta o evalúa: ? { url: urlBaseDatos, authToken: process.env.DATABASE_AUTH_TOKEN }
    ? { url: urlBaseDatos, authToken: process.env.DATABASE_AUTH_TOKEN }
    // [Línea 14] Ejecuta o evalúa: : { url: urlBaseDatos },
    : { url: urlBaseDatos },
// [Línea 15] Cierra el bloque o estructura (});).
});
