import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile();
} catch {
  // Sin .env: se usan los valores por defecto
}

const tursoUrl = process.env.TURSO_DATABASE_URL;

export default tursoUrl
  ? defineConfig({
      dialect: "turso",
      schema: "./src/db/schema.ts",
      out: "./drizzle",
      dbCredentials: {
        url: tursoUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
      },
    })
  : defineConfig({
      dialect: "sqlite",
      schema: "./src/db/schema.ts",
      out: "./drizzle",
      dbCredentials: {
        url: process.env.DB_FILE ?? "./data/minicrm.db",
      },
    });
