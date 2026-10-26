import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as schema from './schema.js';

export const root = fileURLToPath(new URL('../../', import.meta.url));
const path = process.env.DATABASE_PATH ?? resolve(root, 'data/minicrm.sqlite');
if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
export const sqlite = new Database(path);
sqlite.pragma('foreign_keys = ON');
export const db = drizzle(sqlite, { schema });
