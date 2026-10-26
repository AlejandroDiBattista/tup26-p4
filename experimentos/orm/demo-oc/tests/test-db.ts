import { createDb, runMigrations, type Db } from "../src/db/client.js";

/** Base SQLite en memoria con las migraciones aplicadas. */
export function nuevaDb(): Db {
  const db = createDb(":memory:");
  runMigrations(db);
  return db;
}
