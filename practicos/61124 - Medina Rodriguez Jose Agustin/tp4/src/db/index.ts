import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const conexion = createClient({ url: 'file:minicrm.db' });

await conexion.execute('PRAGMA foreign_keys = ON');

export const db = drizzle(conexion);