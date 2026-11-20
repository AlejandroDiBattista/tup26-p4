import express, { type ErrorRequestHandler } from 'express';
import { resolve } from 'node:path';
import { root } from './db/index.js';
import { router } from './routes/clientes.js';
import { ErrorHttp } from './services/clientes.js';

export const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use('/api/clientes', router);
app.get('/', (_req, res) => { res.redirect('/MiniCRM.html'); });
app.use(express.static(resolve(root, 'public')));
app.use((_req, res) => { res.status(404).json({ error: 'Ruta inexistente.' }); });
const errores: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = error instanceof ErrorHttp ? error.status :
    error.status === 400 ? 400 : error.status === 413 ? 413 : 500;
  if (status === 500) console.error(error);
  res.status(status).json({ error: error instanceof ErrorHttp ? error.message :
    status === 400 ? 'JSON inválido.' : status === 413 ? 'Solicitud demasiado grande.' : 'Error interno del servidor.' });
};
app.use(errores);
