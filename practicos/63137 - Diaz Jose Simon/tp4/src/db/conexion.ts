import { drizzle } from 'drizzle-orm/libsql';

const URL_BASE_DE_DATOS = 'file:minicrm.db';

export const baseDeDatos = drizzle({ connection: { url: URL_BASE_DE_DATOS } });

await baseDeDatos.run('PRAGMA foreign_keys = ON');
