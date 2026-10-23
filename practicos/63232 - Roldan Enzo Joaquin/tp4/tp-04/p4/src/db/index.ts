import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { schema } from './schema';

export type BaseDatos = BetterSQLite3Database<typeof schema>;

export function crearBaseDatos(archivo = resolve(process.cwd(), 'data', 'minicrm.sqlite')) {
  if (archivo !== ':memory:') {
    mkdirSync(dirname(archivo), { recursive: true });
  }

  const sqlite = new Database(archivo);
  sqlite.pragma('foreign_keys = ON');
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      telefono TEXT NOT NULL DEFAULT '',
      empresa TEXT NOT NULL DEFAULT '',
      cargo TEXT NOT NULL DEFAULT '',
      notas TEXT NOT NULL DEFAULT '',
      creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS actividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
      titulo TEXT NOT NULL,
      descripcion TEXT NOT NULL DEFAULT '',
      fecha TEXT NOT NULL,
      completada INTEGER NOT NULL DEFAULT 0 CHECK (completada IN (0, 1)),
      creada_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completada_en TEXT
    );

    CREATE INDEX IF NOT EXISTS actividades_cliente_idx
      ON actividades(cliente_id, fecha, id);
  `);

  return {
    db: drizzle(sqlite, { schema }),
    cerrar: () => sqlite.close(),
  };
}
