import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Router, type RequestHandler } from "express";
import { crearServidorMcp } from "./servidor.js";

// Streamable HTTP en modo sin estado: cada POST crea su servidor y su transporte, sin sesiones.
// Es suficiente porque las herramientas no guardan estado entre llamadas (todo vive en la base).
const atender: RequestHandler = async (req, res) => {
  const servidor = crearServidorMcp();
  const transporte = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true, // responde JSON directo en lugar de un stream SSE
  });
  res.on("close", () => {
    void transporte.close();
    void servidor.close();
  });
  await servidor.connect(transporte);
  await transporte.handleRequest(req, res, req.body);
};

/** Sin sesiones no hay stream de notificaciones (GET) ni cierre de sesión (DELETE). */
const metodoNoPermitido: RequestHandler = (_req, res) => {
  res.status(405).set("Allow", "POST").json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Método no permitido: este servidor MCP no usa sesiones; use POST" },
    id: null,
  });
};

export const mcpRouter = Router();

mcpRouter.post("/", atender);
mcpRouter.get("/", metodoNoPermitido);
mcpRouter.delete("/", metodoNoPermitido);
