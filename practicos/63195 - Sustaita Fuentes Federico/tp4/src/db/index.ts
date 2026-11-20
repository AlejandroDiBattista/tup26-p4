import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

const sqlite = new Database(process.env.DB_FILE ?? 'minicrm.sqlite');
sqlite.pragma('foreign_keys = ON');

// Quita acentos y pasa a minúsculas: permite buscar "garcia" y encontrar "García".
sqlite.function('normalizar', { deterministic: true }, (valor: unknown) =>
  String(valor ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(),
);

export const db = drizzle(sqlite, { schema });

migrate(db, { migrationsFolder: 'drizzle' });
