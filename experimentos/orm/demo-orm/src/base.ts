import 'dotenv/config';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as esquema from './esquema.js';

export const conexion = createClient({
  url: process.env.DATABASE_URL || 'file:./minicrm.db',
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
});
await conexion.execute('PRAGMA foreign_keys = ON');
export const db = drizzle(conexion, { schema: esquema });
