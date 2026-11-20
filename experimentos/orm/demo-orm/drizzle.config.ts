import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/esquema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./minicrm.db',
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  },
});
