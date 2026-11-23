// Configuración de drizzle-kit: de dónde lee el esquema y dónde deja las migraciones.
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const urlBaseDatos =
  process.env.DATABASE_URL ||
  process.env.TURSO_DATABASE_URL ||
  "file:./local.db";

const tokenBaseDatos =
  process.env.DATABASE_AUTH_TOKEN ||
  process.env.TURSO_AUTH_TOKEN;

const esTurso = urlBaseDatos.startsWith("libsql://");

export default defineConfig({
  schema: "./basedatos/esquema.ts",
  out: "./basedatos/migraciones",
  dialect: esTurso ? "turso" : "sqlite",
  dbCredentials: esTurso
    ? { url: urlBaseDatos, authToken: tokenBaseDatos }
    : { url: urlBaseDatos },
});
