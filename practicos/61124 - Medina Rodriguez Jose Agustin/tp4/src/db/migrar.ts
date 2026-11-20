import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './index.ts';

await migrate(db, { migrationsFolder: './drizzle' });

console.log('Migraciones aplicadas.');