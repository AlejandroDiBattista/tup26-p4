import { migrate } from 'drizzle-orm/libsql/migrator';
import { databaseConfig } from '../config.js';
import { connect } from './connection.js';

const connection = connect(databaseConfig());

try {
  await migrate(connection.db, { migrationsFolder: 'drizzle' });
  console.log('Migraciones aplicadas.');
} finally {
  connection.close();
}
