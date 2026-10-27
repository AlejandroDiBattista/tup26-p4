// ══════════════════════════════════════════════════════════════════
// server.ts — Punto de entrada de la aplicación
// ══════════════════════════════════════════════════════════════════
// Este archivo:
// 1. Crea las tablas en SQLite si no existen (inicialización)
// 2. Configura Express (middlewares, archivos estáticos, API)
// 3. Levanta el servidor HTTP en el puerto 3000
//
// Es lo primero que se ejecuta cuando corremos "npm run dev"
// ══════════════════════════════════════════════════════════════════

import express from "express";
import path from "path";

// Importamos el enrutador de clientes (todas las rutas de la API)
import enrutadorClientes from "./routes/clientes";

// Importamos la conexión a la base de datos
import { bd } from "./db";
import { sql } from "drizzle-orm";

// ── Paso 1: Crear las tablas si no existen ─────────────────────────
// Usamos SQL puro con "CREATE TABLE IF NOT EXISTS" para asegurarnos
// de que las tablas existan cuando arranca el servidor.
// Esto evita errores si es la primera vez que se ejecuta.

// Tabla de clientes
bd.run(sql`CREATE TABLE IF NOT EXISTS clientes (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre    TEXT NOT NULL,
    email     TEXT NOT NULL DEFAULT '',
    telefono  TEXT NOT NULL DEFAULT '',
    direccion TEXT NOT NULL DEFAULT '',
    ciudad    TEXT NOT NULL DEFAULT ''
)`);

// Tabla de actividades (con clave foránea a clientes)
bd.run(sql`CREATE TABLE IF NOT EXISTS actividades (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id    INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    descripcion   TEXT NOT NULL,
    fecha         TEXT,
    completada_el TEXT
)`);

// ── Paso 2: Configurar Express ─────────────────────────────────────

// Creamos la aplicación Express
const aplicacion = express();

// Definimos el puerto (usa variable de entorno o 3000 por defecto)
const PUERTO = process.env.PORT || 3000;

// Middleware: express.json() permite recibir JSON en el body de las solicitudes.
// Sin esto, req.body sería undefined al recibir datos POST/PUT.
aplicacion.use(express.json());

// Middleware: express.static() sirve archivos estáticos (HTML, CSS, JS, imágenes)
// desde la carpeta "public". Cuando el navegador pide /MiniCRM.html,
// Express busca el archivo en public/MiniCRM.html
aplicacion.use(express.static(path.join(__dirname, "..", "public")));

// ── Paso 3: Montar las rutas de la API ─────────────────────────────
// Todas las rutas del enrutador se prefijan con "/api/clientes".
// Ej: router.get("/") se convierte en GET /api/clientes
aplicacion.use("/api/clientes", enrutadorClientes);

// ── Paso 4: Fallback para SPA ──────────────────────────────────────
// Si ninguna ruta anterior coincide, servimos el HTML principal.
// Esto es necesario para que la aplicación React funcione correctamente
// (Single Page Application - SPA).
aplicacion.get("*", (_solicitud, respuesta) => {
    respuesta.sendFile(path.join(__dirname, "..", "public", "MiniCRM.html"));
});

// ── Paso 5: Iniciar el servidor ────────────────────────────────────
// listen() abre el puerto y empieza a escuchar solicitudes HTTP.
aplicacion.listen(PUERTO, () => {
    console.log(`✓ MiniCRM corriendo en http://localhost:${PUERTO}`);
});
