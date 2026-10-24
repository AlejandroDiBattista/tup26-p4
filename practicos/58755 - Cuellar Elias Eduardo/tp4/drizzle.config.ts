import { defineConfig } from "drizzle-kit";
import { config } from "./src/config.js";

// El dialecto "turso" sirve tanto para archivos locales (file:) como para Turso (libsql://).
export default defineConfig({
  dialect: "turso",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: config.databaseUrl,
    ...(config.authToken ? { authToken: config.authToken } : {}),
  },
  strict: true,
  verbose: true,
});
