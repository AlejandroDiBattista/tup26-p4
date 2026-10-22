import { Router } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { crearServidorMcp } from "./server.js";

export const mcpRouter = Router();

mcpRouter.post("/", async (req, res, next) => {
  const origin = req.get("origin");
  if (origin && origin !== `${req.protocol}://${req.get("host")}`) {
    res.status(403).json({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32000, message: "Origen no permitido para MCP." },
    });
    return;
  }
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
