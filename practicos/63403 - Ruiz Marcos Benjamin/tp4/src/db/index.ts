import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({ url: 'file:minicrm.db' });

export const db = drizzle(client, { schema });

// SQLite necesita activar las claves foráneas para que funcione el borrado en cascada
await db.run('PRAGMA foreign_keys = ON');
