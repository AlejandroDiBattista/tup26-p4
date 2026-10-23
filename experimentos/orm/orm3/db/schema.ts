// Schema flexible: SQLite local para desarrollo, Turso para producción
// Basado en DATABASE_URL: ./archivo.sqlite -> local, libsql:// -> Turso

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite';
import { drizzle } from 'drizzle-orm/libsql';  // ← Ruta correcta!
import { createClient } from '@libsql/client';
import { sqlite } from 'drizzle-orm/sqlite';  // Para el driver SQLite nativo

// Detectar modo basado en DATABASE_URL
// Si empieza con 'libsql://' -> Turso (producción)
// De otra manera -> SQLite local (desarrollo)
const isTurso = process.env.DATABASE_URL?.startsWith('libsql://');

// Configurar según el modo
let db;

// Modo Producción: Turso (libSQL)
// Pasamos el client creado a drizzle
if (isTurso) {
  const url = process.env.DATABASE_URL!;
  const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;
  
  const client = createClient({
    url,
    authToken,
  });
  
  // drizzle(client) - accepta un client de libsql
  db = drizzle(client);
} else {
  // Modo Desarrollo: SQLite local nativo
  // drizzle({ driver: sqlite() }) - usa driver sqlite nativo
  db = drizzle({ driver: sqlite() });
}

// Exportar para usar en todo el proyecto
export { db };

// Tabla de usuarios - misma definición para ambos modos
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  createdAt: integer('created_at').defaultNow(),
});

// Helpers para la clase (mostrar modo en consola)
export const isDevelopment = !isTurso;
export const isProduction = isTurso;