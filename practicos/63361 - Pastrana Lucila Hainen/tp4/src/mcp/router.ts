import { Router, type NextFunction, type Request, type Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { crearServidorMcp } from "./server";

/**
 * Endpoint MCP con transporte Streamable HTTP en modo sin estado (stateless):
 * cada POST crea su propio servidor y transporte, así no hay sesiones que guardar
 * y funciona igual con varios clientes a la vez. Los datos viven en la base, no en memoria.
 */
export const mcpRouter = Router();

mcpRouter.post("/", async (req: Request, res: Response) => {
  const server = crearServidorMcp();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // sin sesiones
    enableJsonResponse: true, // respuestas JSON simples (además de SSE si el cliente lo pide)
  });
  res.on("close", () => {
    void transport.close();
    void server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (e) {
    console.error("Error MCP:", e);
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Error interno del servidor" }, id: null });
    }
  }
});

// Sin sesiones no hay stream de notificaciones (GET) ni cierre de sesión (DELETE).
const noPermitido = (_req: Request, res: Response) => {
  res
    .status(405)
    .set("Allow", "POST")
    .json({ jsonrpc: "2.0", error: { code: -32000, message: "Método no permitido: usar POST" }, id: null });
};
mcpRouter.get("/", noPermitido);
mcpRouter.delete("/", noPermitido);

/** JSON mal formado en /mcp -> error JSON-RPC "Parse error" (-32700), como pide el protocolo. */
export function erroresMcp(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof SyntaxError && (err as { type?: string }).type === "entity.parse.failed") {
    res.status(400).json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error: JSON inválido" }, id: null });
    return;
  }
  next(err);
}
