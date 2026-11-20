// ══════════════════════════════════════════════════════════════════
// config.ts — Configuración de la base de datos
// ══════════════════════════════════════════════════════════════════
// Este archivo define dos cosas:
// 1. La ruta donde se guarda el archivo SQLite (minicrm.db)
// 2. La configuración de Drizzle Kit (herramienta de migraciones)
// ══════════════════════════════════════════════════════════════════

import { defineConfig } from "drizzle-kit";
import path from "path";

// Construimos la ruta absoluta al archivo de base de datos.
// path.join une las partes del camino de forma segura para cualquier SO.
// __dirname es la carpeta actual (src/db/), subimos dos niveles (.., ..)
// para llegar a la raíz del proyecto donde guardamos minicrm.db
export const RUTA_BD = path.join(__dirname, "..", "..", "minicrm.db");

// Configuración para Drizzle Kit (usada por drizzle-kit generate/push).
// Le decimos:
// - schema: dónde está nuestro archivo de esquema
// - out: dónde guardar las migraciones generadas
// - dialect: qué base de datos usamos (sqlite)
// - dbCredentials.url: la ruta al archivo .db
export const configuracionDrizzle = defineConfig({
    schema: "./src/db/schema.ts",
    out:    "./drizzle",
    dialect: "sqlite",
    dbCredentials: {
        url: RUTA_BD,
    },
});
