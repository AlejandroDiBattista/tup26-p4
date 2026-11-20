import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { actividades, clientes } from "./schema.js";

const directorio = path.dirname(fileURLToPath(import.meta.url));
const rutaBase = process.env.MINICRM_DATABASE_FILE || path.resolve(directorio, "../../minicrm.db");
const sqlite = new Database(rutaBase);
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT NOT NULL DEFAULT '',
    direccion TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS actividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    fecha TEXT,
    completada INTEGER NOT NULL DEFAULT 0,
    completada_en TEXT
  );
`);

const columnasActividad = sqlite.pragma("table_info(actividades)") as Array<{ name: string }>;
if (!columnasActividad.some(columna => columna.name === "completada_en")) {
  sqlite.exec("ALTER TABLE actividades ADD COLUMN completada_en TEXT");
}

export { actividades, clientes };
