import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Router, type RequestHandler } from "express";
import { createMcpServer } from "./server.js";

// Modo sin estado: cada petición POST crea su propio servidor y transporte.
const atender: RequestHandler = async (req, res) => {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on("close", () => {
    void transport.close();
    void server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
};

const noPermitido: RequestHandler = (_req, res) => {
  res.status(405).set("Allow", "POST").json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Método no permitido: este servidor MCP no usa sesiones, solo POST" },
    id: null,
  });
};

export const mcpRouter = Router();
mcpRouter.post("/", atender);
mcpRouter.get("/", noPermitido);
mcpRouter.delete("/", noPermitido);
