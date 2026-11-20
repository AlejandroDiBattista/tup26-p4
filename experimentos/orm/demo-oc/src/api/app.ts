import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import express, { type Express } from "express";
import { manejarErrores, noEncontrado } from "./errores.js";
import { clientesRouter } from "./routers/clientes.js";

/** Carpeta con la interfaz (public/), resuelta desde este archivo. */
const PUBLICO = join(dirname(fileURLToPath(import.meta.url)), "../../public");

/**
 * Aplicación Express. El `listen` vive en `src/server.ts`, así los tests
 * pueden ejercitarla sin abrir un puerto.
 */
export function crearApp(): Express {
  const app = express();

  app.use(express.json());

  // La interfaz se sirve desde el mismo origen que la API: sin CORS.
  app.use(express.static(PUBLICO));
  app.get("/", (_req, res) => res.redirect("/MiniCRM.html"));

  app.use("/api/clientes", clientesRouter);
  app.use(noEncontrado);
  app.use(manejarErrores);

  return app;
}
