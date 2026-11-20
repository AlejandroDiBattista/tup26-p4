import { defineConfig } from "drizzle-kit";

process.loadEnvFile();

export default defineConfig({
  dialect: "turso",
  schema: "./schema.ts",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
