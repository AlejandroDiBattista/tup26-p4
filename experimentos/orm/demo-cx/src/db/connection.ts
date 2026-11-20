import { createClient, type Config } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.js';

export function connect(config: Config) {
  const client = createClient(config);
  const db = drizzle(client, { schema });
  return { db, close: () => client.close() };
}

export type Database = ReturnType<typeof connect>['db'];
