import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/esquema.ts',
  dbCredentials:
    process.env.TURSO_DATABASE_URL &&
    !process.env.TURSO_DATABASE_URL.startsWith('file:')
      ? {
          url: process.env.TURSO_DATABASE_URL,
          authToken: process.env.TURSO_AUTH_TOKEN,
        }
      : { url: process.env.TURSO_DATABASE_URL || 'file:local.db' },
});
