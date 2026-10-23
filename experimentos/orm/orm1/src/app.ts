import express, { type ErrorRequestHandler } from "express";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { rutasActividades } from "./rutas/actividades.js";
import { rutasClientes } from "./rutas/clientes.js";

export const app = express();

app.use(express.json());
const especificacionOpenApi = readFileSync(
  fileURLToPath(new URL("../openapi.yaml", import.meta.url)),
  "utf8",
);
app.get("/openapi.yaml", (_req, res) => {
  res.type("text/yaml").send(especificacionOpenApi);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(undefined, { swaggerUrl: "/openapi.yaml" }));
app.use(express.static(fileURLToPath(new URL("../public", import.meta.url))));
app.use("/api/clientes", rutasClientes);
app.use("/api/actividades", rutasActividades);

app.use(((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Error interno del servidor." });
}) satisfies ErrorRequestHandler);
