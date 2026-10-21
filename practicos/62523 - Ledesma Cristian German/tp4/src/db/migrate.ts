import { mkdirSync } from 'node:fs';
import { sql } from 'drizzle-orm';
import { db } from './client.js';

mkdirSync('data', { recursive: true });

db.run(sql`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT NOT NULL,
    direccion TEXT NOT NULL
  )
`);

db.run(sql`
  CREATE TABLE IF NOT EXISTS actividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    descripcion TEXT NOT NULL,
    fecha TEXT,
    completada INTEGER NOT NULL DEFAULT 0,
    fecha_completada TEXT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
  )
`);

console.log('Base de datos lista.');
