import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const cliente = createClient({ url: 'file:minicrm.db' });

// SQLite trae las claves foráneas apagadas: sin esto, onDelete 'cascade' no hace nada
await cliente.execute('PRAGMA foreign_keys = ON');

export const db = drizzle(cliente);
