import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './schema.ts',
  tablesFilter: ['clientes', 'actividades'],
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL || 'file:clase.db',
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  },
});
