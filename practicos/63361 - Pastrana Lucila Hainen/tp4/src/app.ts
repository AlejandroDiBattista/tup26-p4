import express from "express";
import path from "node:path";
import { erroresMcp, mcpRouter } from "./mcp/router";
import { manejarErrores, rutaNoEncontrada } from "./middlewares/errores";
import { apiRouter } from "./routes";

export const app = express();

app.use(express.json());
app.use(express.static(path.join(import.meta.dirname, "..", "public")));

app.use("/api", apiRouter);
app.use("/api", rutaNoEncontrada);

app.use("/mcp", mcpRouter); // Servidor MCP: mismas operaciones del servicio Clientes
app.use("/mcp", erroresMcp);

app.use(manejarErrores);
