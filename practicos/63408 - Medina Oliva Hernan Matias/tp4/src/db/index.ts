import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import * as schema from './schema.js';
mkdirSync('data', {recursive:true});
export const client = createClient({url:process.env.DATABASE_URL ?? 'file:'+resolve('data/minicrm.db').replaceAll('\\','/')});
export const db = drizzle(client,{schema});
export async function prepararBase() {
 await client.execute('PRAGMA foreign_keys = ON');
 await client.executeMultiple(`CREATE TABLE IF NOT EXISTS clientes (
 id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, email TEXT NOT NULL, telefono TEXT NOT NULL, direccion TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS actividades (id INTEGER PRIMARY KEY AUTOINCREMENT,
 cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
 descripcion TEXT NOT NULL, fecha TEXT, completada INTEGER NOT NULL DEFAULT 0 CHECK(completada IN (0,1)), completada_en TEXT);
 CREATE INDEX IF NOT EXISTS actividades_cliente ON actividades(cliente_id);`);
}
