import { existsSync } from 'node:fs';

// Carga .env si existe; sin él se usa la base local.
if (existsSync('.env')) process.loadEnvFile('.env');

export const configuracion = {
  puerto: Number(process.env.PORT) || 3000,
  baseDeDatos: {
    url: process.env.TURSO_DATABASE_URL || 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  },
};
