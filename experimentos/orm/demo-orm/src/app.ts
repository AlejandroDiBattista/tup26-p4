import express, { type ErrorRequestHandler } from 'express';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { fileURLToPath } from 'node:url';
import { describirError } from './errores.js';
import { atenderMcp } from './mcp.js';
import { rutasClientes } from './rutas.js';

export const app = createMcpExpressApp({ host: process.env.HOST || '127.0.0.1' });
app.disable('x-powered-by');
app.use('/api/clientes', rutasClientes);
app.post('/mcp', atenderMcp);
app.all('/mcp', (_req, res) => {
  res.set('Allow', 'POST').status(405).json({ jsonrpc: '2.0', id: null, error: { code: -32000, message: 'Usa POST: transporte MCP sin sesiones ni canal SSE persistente.' } });
});
app.get('/', (_req, res) => res.redirect('/clientes.html'));
app.use(express.static(fileURLToPath(new URL('../public', import.meta.url))));
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
const errores: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ error: 'El cuerpo debe ser JSON válido.' });
    return;
  }
  const detalle = describirError(error);
  res.status(detalle.estado).json({ error: detalle.error });
};
app.use(errores);
