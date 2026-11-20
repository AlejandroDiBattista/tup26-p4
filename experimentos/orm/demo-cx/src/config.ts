import 'dotenv/config';
import type { Config } from '@libsql/client';

export function databaseConfig(env = process.env): Config {
  if (env.NODE_ENV !== 'production') {
    return { url: 'file:local.db' };
  }

  const url = env.TURSO_DATABASE_URL?.trim();
  const authToken = env.TURSO_AUTH_TOKEN?.trim();

  if (!url?.startsWith('libsql://') || !authToken) {
    throw new Error('Producción requiere TURSO_DATABASE_URL (libsql://…) y TURSO_AUTH_TOKEN.');
  }

  return { url, authToken };
}
