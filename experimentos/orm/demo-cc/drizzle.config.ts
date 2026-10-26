import { defineConfig } from "drizzle-kit";
import { config } from "./src/config.js";

export default defineConfig({
  dialect: "turso",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: config.databaseUrl, authToken: config.authToken },
});
