// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: drizzle.config.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Configuración de drizzle-kit: de dónde lee el esquema y dónde deja las migraciones.
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const urlBaseDatos = process.env.DATABASE_URL ?? "file:./local.db";
const esTurso = urlBaseDatos.startsWith("libsql://");

export default defineConfig({
  schema: "./basedatos/esquema.ts",
  out: "./basedatos/migraciones",
  dialect: esTurso ? "turso" : "sqlite",
  dbCredentials: esTurso
    ? { url: urlBaseDatos, authToken: process.env.DATABASE_AUTH_TOKEN }
    : { url: urlBaseDatos },
});
