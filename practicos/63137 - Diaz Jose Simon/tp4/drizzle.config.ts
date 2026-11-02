import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/esquema.ts',
  dialect: 'sqlite',
  dbCredentials: { url: 'file:minicrm.db' },
});
