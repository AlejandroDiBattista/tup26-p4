import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { resolve } from 'node:path';
import { db, root, sqlite } from './index.js';

try {
  migrate(db, { migrationsFolder: resolve(root, 'drizzle') });
  console.log('Migraciones aplicadas.');
} finally {
  sqlite.close();
}
