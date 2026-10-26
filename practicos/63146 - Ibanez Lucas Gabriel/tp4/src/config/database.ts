import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import * as schema from "../db/schema.js";
import { env } from "./env.js";

// Ambos drivers comparten la API de Drizzle; los servicios usan siempre `await`.
export type DB = BaseSQLiteDatabase<"sync" | "async", unknown, typeof schema>;

function crearConexion(): { db: DB; motor: string } {
  if (env.tursoUrl) {
    const client = createClient({ url: env.tursoUrl, authToken: env.tursoToken });
    return { db: drizzleLibsql(client, { schema }), motor: `Turso (${env.tursoUrl})` };
  }

  mkdirSync(dirname(env.dbFile), { recursive: true });
  const sqlite = new Database(env.dbFile);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return { db: drizzleSqlite(sqlite, { schema }), motor: `SQLite (${env.dbFile})` };
}

export const { db, motor } = crearConexion();
