import express from 'express';
import { fileURLToPath } from 'node:url';
import type { Database } from './db/connection.js';
import { clientesRouter } from './routes/clientes.js';
import { mcpRouter } from './mcp/router.js';
import { errores } from './http/errores.js';

export function crearApp(db: Database) {
  const app = express();
  app.disable('x-powered-by');
  app.set('query parser', 'simple');
  app.use(express.json({ limit: '100kb' }));
  app.use('/api/clientes', clientesRouter(db));
  app.use('/mcp', mcpRouter(db));
  app.get('/', (_req, res) => { res.redirect('/microcrm.html'); });
  app.use(express.static(fileURLToPath(new URL('../public/', import.meta.url))));
  app.use((_req, res) => { res.status(404).json({ error: 'Ruta inexistente.' }); });
  app.use(errores);
  return app;
}
