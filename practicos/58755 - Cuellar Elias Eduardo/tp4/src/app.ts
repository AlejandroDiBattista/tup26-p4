import express, { type Express } from "express";
import { fileURLToPath } from "node:url";
import { apiRouter } from "./api/index.js";
import { manejarErrores, rutaNoEncontrada } from "./api/errores.js";

// Resuelto respecto de este archivo: funciona igual desde src/ (tsx) que desde dist/ (build).
const DIRECTORIO_PUBLICO = fileURLToPath(new URL("../public", import.meta.url));

export function crearApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));

  app.use("/api", apiRouter);
  app.use(express.static(DIRECTORIO_PUBLICO, { index: "MiniCRM.html" }));

  app.use(rutaNoEncontrada);
  app.use(manejarErrores);

  return app;
}
