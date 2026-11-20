import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { projectRoot } from '../paths.js';
import * as schema from './schema.js';

const archivo = process.env.DB_FILE === ':memory:'
  ? ':memory:'
  : resolve(projectRoot, process.env.DB_FILE ?? 'data/minicrm.db');
if (archivo !== ':memory:') mkdirSync(dirname(archivo), { recursive: true });

export const sqlite = new Database(archivo);
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('journal_mode = WAL');
export const db = drizzle(sqlite, { schema });
migrate(db, { migrationsFolder: resolve(projectRoot, 'drizzle') });
