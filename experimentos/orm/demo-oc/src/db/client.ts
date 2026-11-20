import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.js";

export const DEFAULT_DB_PATH = "./data/app.db";
const MIGRATIONS_FOLDER = "./drizzle";

/**
 * Abre (o crea) una base SQLite y devuelve el cliente Drizzle.
 * Pasa ":memory:" para una base efímera, ideal en tests.
 */
export function createDb(path = process.env.DATABASE_URL ?? DEFAULT_DB_PATH) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });

  const sqlite = new Database(path);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  return drizzle(sqlite, { schema });
}

/** Cliente Drizzle listo para usar. */
export type Db = ReturnType<typeof createDb>;

/** Aplica las migraciones pendientes de ./drizzle. */
export function runMigrations(db: Db) {
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
}
