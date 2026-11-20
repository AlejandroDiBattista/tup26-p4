import { drizzle } from 'drizzle-orm/libsql';
import { configuracion } from '../configuracion';

export const db = drizzle({ connection: configuracion.baseDeDatos });
