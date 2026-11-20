import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import * as schema from "./schema.js";

if (config.databaseUrl !== ":memory:") {
  fs.mkdirSync(path.dirname(config.databaseUrl), { recursive: true });
}

const sqlite = new Database(config.databaseUrl);
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { sqlite };
