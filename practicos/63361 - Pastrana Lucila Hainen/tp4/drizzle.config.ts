import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Local: archivo SQLite (minicrm.db). Producción: definir TURSO_DATABASE_URL y TURSO_AUTH_TOKEN.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? "file:minicrm.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
