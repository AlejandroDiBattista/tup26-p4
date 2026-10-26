import { Router } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { Database } from '../db/connection.js';
import { crearServidorMcp } from './server.js';

export function mcpRouter(db: Database) {
  const router = Router();
  router.post('/', async (req, res) => {
    // Cada petición tiene servidor y transporte propios; solo la base es compartida.
    const server = crearServidorMcp(db);
    const hosts = ['localhost', '127.0.0.1', '[::1]'].map((host) => `${host}:${req.socket.localPort}`);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
      enableDnsRebindingProtection: true,
      allowedHosts: process.env.MCP_ALLOWED_HOSTS?.split(',').map((host) => host.trim()) ?? hosts,
      allowedOrigins: process.env.MCP_ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()) ?? hosts.map((host) => `http://${host}`),
    });
    res.once('close', () => { void server.close().catch(console.error); });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error(error);
      await server.close();
      if (!res.headersSent) res.status(500).json({
        jsonrpc: '2.0', id: null, error: { code: -32603, message: 'No pudimos procesar la petición MCP.' },
      });
    }
  });
  router.all('/', (_req, res) => {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ jsonrpc: '2.0', id: null, error: {
      code: -32000, message: 'Usá POST con Streamable HTTP. Este servidor no mantiene sesiones ni un canal SSE por GET.',
    } });
  });
  return router;
}
