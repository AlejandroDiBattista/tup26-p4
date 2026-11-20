import 'dotenv/config';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

export const cliente = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:clase.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

export const db = drizzle(cliente);
