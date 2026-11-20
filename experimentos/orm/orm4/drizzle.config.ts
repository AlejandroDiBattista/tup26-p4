import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL ?? 'file:local.db';
const esTurso = url.startsWith('libsql://') || url.startsWith('https://');

export default defineConfig({
  schema: './src/db/schema.ts',
  dialect: esTurso ? 'turso' : 'sqlite',
  dbCredentials: esTurso
    ? { url, authToken: process.env.TURSO_AUTH_TOKEN }
    : { url: url.replace(/^file:/, '') },
});
