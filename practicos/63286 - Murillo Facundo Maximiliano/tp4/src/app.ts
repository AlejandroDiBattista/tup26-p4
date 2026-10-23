import express from "express";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { errorHttp } from "./controllers/respuestas.js";
import { rutasActividades } from "./routes/actividades.js";
import { rutasClientes } from "./routes/clientes.js";

export function crearApp() {
  const app = express();
  const carpetaPublica = resolve(dirname(fileURLToPath(import.meta.url)), "../public");

  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));
  app.use("/api/clientes", rutasClientes);
  app.use("/api/actividades", rutasActividades);
  app.get("/api/health", (_req, res) => {
    res.json({ data: { status: "ok" }, error: null });
  });
  app.get("/", (_req, res) => res.sendFile(resolve(carpetaPublica, "MiniCRM.html")));
  app.use(express.static(carpetaPublica));
  app.use((_req, res) => {
    res.status(404).json({ data: null, error: { code: "RUTA_NO_ENCONTRADA", message: "No existe ese endpoint." } });
  });
  app.use(errorHttp);

  return app;
}
