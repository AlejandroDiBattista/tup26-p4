import { localhostHostValidation } from '@modelcontextprotocol/sdk/server/middleware/hostHeaderValidation.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Router } from 'express';
import { crearServidorMcp } from './herramientas';

export const rutasMcp = Router();

// Solo acepta peticiones dirigidas a localhost (protección contra DNS rebinding).
rutasMcp.use(localhostHostValidation());

// Modo sin estado: cada petición usa un servidor y un transporte nuevos.
// Las respuestas se envían como JSON en lugar de un flujo SSE.
rutasMcp.post('/', async (req, res) => {
  const servidor = crearServidorMcp();
  const transporte = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on('close', () => {
    transporte.close();
    servidor.close();
  });
  await servidor.connect(transporte);
  await transporte.handleRequest(req, res, req.body);
});

// Sin sesiones no hay flujo de notificaciones (GET) ni cierre de sesión (DELETE).
rutasMcp.all('/', (_req, res) => {
  res.status(405).set('Allow', 'POST').json({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Método no permitido: usar POST.' },
    id: null,
  });
});
