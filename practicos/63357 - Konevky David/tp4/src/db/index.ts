import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.js';

// Desarrollo: archivo SQLite local. Producción: Turso (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN).
const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? 'file:minicrm.sqlite',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
