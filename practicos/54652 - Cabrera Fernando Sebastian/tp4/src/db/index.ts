import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("minicrm.db");
// SQLite no aplica las claves foráneas (ni el borrado en cascada) si no se lo pide.
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
