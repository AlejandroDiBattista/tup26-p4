import { Router } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { crearServidorMcp } from "./server.js";
import { mcpPublicOrigin } from "../config.js";

export const mcpRouter = Router();

mcpRouter.use((req, res, next) => {
  const origin = req.get("origin");
  const allowedOrigin = mcpPublicOrigin ?? `${req.protocol}://${req.get("host")}`;
  if (origin && origin !== allowedOrigin) {
    res.status(403).json({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32000, message: "Origen no permitido para MCP." },
    });
    return;
  }
  next();
});

mcpRouter.post("/", async (req, res, next) => {
  // Sin sesiones persistidas: cada petición tiene su transporte y servidor.
  // Los datos de negocio permanecen en la base compartida con REST.
  const server = crearServidorMcp();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  res.on("close", () => {
    void server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    await server.close();
    if (!res.headersSent) next(error);
  }
});

mcpRouter.all("/", (_req, res) => {
  res
    .set("Allow", "POST")
    .status(405)
    .json({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32000,
        message:
          "Método no permitido. Utilizá POST con Streamable HTTP; no se mantienen sesiones ni un canal SSE GET.",
      },
    });
});
