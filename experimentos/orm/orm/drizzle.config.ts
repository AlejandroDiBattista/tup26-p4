import { defineConfig } from "drizzle-kit";
import { obtenerUrlBase } from "./database-config.js";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/esquema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: obtenerUrlBase()
  }
});
