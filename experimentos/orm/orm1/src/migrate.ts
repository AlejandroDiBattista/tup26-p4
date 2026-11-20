import "dotenv/config";
import { createClient } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator";
import { drizzle } from "drizzle-orm/libsql";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

try {
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  console.log("Migraciones aplicadas correctamente.");
} finally {
  client.close();
}
