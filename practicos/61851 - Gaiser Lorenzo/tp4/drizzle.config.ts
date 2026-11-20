import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'turso',
  schema: './src/db/esquema.ts',
  out: './drizzle',
  dbCredentials: { url: 'file:minicrm.db' },
});