import { defineConfig } from 'drizzle-kit';
import { configuracion } from './src/configuracion';

export default defineConfig({
  dialect: 'turso',
  schema: './src/db/esquema.ts',
  out: './drizzle',
  dbCredentials: configuracion.baseDeDatos,
});
