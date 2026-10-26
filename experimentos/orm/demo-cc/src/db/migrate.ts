import { migrate } from "drizzle-orm/libsql/migrator";
import { config } from "../config.js";
import { createDb, type Db } from "./client.js";

export function runMigrations(db: Db) {
  return migrate(db, { migrationsFolder: "drizzle" });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await runMigrations(createDb(config.databaseUrl, config.authToken));
  console.log("Migraciones aplicadas");
}
