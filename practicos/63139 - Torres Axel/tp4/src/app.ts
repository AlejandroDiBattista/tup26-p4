import express, { type ErrorRequestHandler } from 'express';
import { resolve } from 'node:path';
import { projectRoot } from './paths.js';
import { clientesRouter } from './routes/clientes.js';
import { ErrorServicio } from './services/validacion.js';

export const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use('/api/clientes', clientesRouter);
app.get('/', (_req, res) => res.redirect('/MiniCRM.html'));
app.use(express.static(resolve(projectRoot, 'public')));
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

const manejarError: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ErrorServicio) {
    res.status(error.status).json({ error: error.message });
  } else if (error.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'El JSON enviado no es válido.' });
  } else if (error.type === 'entity.too.large') {
    res.status(413).json({ error: 'El contenido enviado es demasiado grande.' });
  } else {
    console.error(error);
    res.status(500).json({ error: 'No se pudo completar la operación.' });
  }
};
app.use(manejarError);
