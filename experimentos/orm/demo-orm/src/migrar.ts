import { migrate } from 'drizzle-orm/libsql/migrator';
import { conexion, db } from './base.js';

try {
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migraciones aplicadas.');
} finally {
  conexion.close();
}
