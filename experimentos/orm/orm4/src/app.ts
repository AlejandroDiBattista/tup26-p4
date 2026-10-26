import express, { type ErrorRequestHandler } from 'express';
import { join } from 'node:path';
import { actividadesRouter } from './routers/actividades.js';
import { clientesRouter } from './routers/clientes.js';

export const app = express();

app.use(express.json());
app.get('/api', (_req, res) => res.json({ mensaje: 'API del minicrm' }));
app.use('/api/clientes', clientesRouter);
app.use('/api/actividades', actividadesRouter);
app.use(express.static(join(process.cwd(), 'public')));

const manejarError: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  res.status(400).json({ error: 'No se pudo procesar la solicitud.' });
};

app.use(manejarError);
