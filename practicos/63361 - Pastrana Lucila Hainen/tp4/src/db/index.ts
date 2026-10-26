import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Sin TURSO_DATABASE_URL se usa el archivo SQLite local; con ella, Turso.
const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:minicrm.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export { schema };
