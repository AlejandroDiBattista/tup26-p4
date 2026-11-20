// ══════════════════════════════════════════════════════════════════
// index.ts — Conexión a la base de datos SQLite
// ══════════════════════════════════════════════════════════════════
// Este archivo crea la conexión a SQLite y la envuelve con Drizzle.
// Exporta una única instancia "bd" que se usa en toda la aplicación
// (patrón Singleton: una sola conexión compartida).
// ══════════════════════════════════════════════════════════════════

// better-sqlite3: librería nativa que nos da acceso directo a SQLite
import Database from "better-sqlite3";

// drizzle: el ORM que nos permite hacer consultas con TypeScript
import { drizzle } from "drizzle-orm/better-sqlite3";

// Importamos la ruta de la base de datos desde nuestra configuración
import { RUTA_BD } from "./config";

// Importamos el esquema para que Drizzle conozca la estructura de tablas
import * as esquema from "./schema";

// Creamos la conexión nativa a SQLite
const sqlite = new Database(RUTA_BD);

// Configuramos pragmas de SQLite:
// - WAL (Write-Ahead Logging): mejora el rendimiento de escrituras concurrentes
// - foreign_keys ON: activa la verificación de claves foráneas (para ON DELETE CASCADE)
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Creamos y exportamos la instancia de Drizzle ORM
// Le pasamos la conexión nativa y el esquema para que pueda
// mapear las consultas TypeScript a tablas reales
export const bd = drizzle(sqlite, { schema: esquema });
