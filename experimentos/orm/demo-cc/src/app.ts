import path from "node:path";
import express from "express";
import { clientesRouter } from "./clientes/clientes.routes.js";
import { mcpRouter } from "./mcp/mcp.routes.js";
import { manejarErrores, noEncontrado } from "./http/errores.js";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/clientes", clientesRouter);
  app.use("/mcp", mcpRouter);
  app.use(express.static(path.join(import.meta.dirname, "..", "public"), { extensions: ["html"] })); // /clientes -> clientes.html
  app.use(noEncontrado);
  app.use(manejarErrores);
  return app;
}
