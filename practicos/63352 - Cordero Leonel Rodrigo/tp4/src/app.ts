import express from "express";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { manejarErrores, noEncontrado } from "./controladores/http.js";
import { rutasActividades } from "./rutas/actividades.js";
import { rutasClientes } from "./rutas/clientes.js";

export function crearApp() {
  const app = express();
  const publica = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));
  app.use("/api/clientes", rutasClientes);
  app.use("/api/actividades", rutasActividades);
  app.get("/", (_req, res) => res.sendFile(join(publica, "MiniCRM.html")));
  app.use(express.static(publica));
  app.use(noEncontrado);
  app.use(manejarErrores);
  return app;
}
