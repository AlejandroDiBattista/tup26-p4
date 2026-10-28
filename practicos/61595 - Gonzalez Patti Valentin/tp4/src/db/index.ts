import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const databasePath = "./data/local.db";
mkdirSync(dirname(databasePath), { recursive: true });

const sqlite = new Database(databasePath);

export const db = drizzle(sqlite);
