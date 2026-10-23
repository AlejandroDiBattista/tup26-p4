import express, { type ErrorRequestHandler } from 'express';
import { resolve } from 'node:path';
import type { BaseDatos } from './db';
import { ErrorHttp } from './errors';
import { crearRutasClientes } from './routes/clientes.routes';

export function crearApp(db: BaseDatos) {
  const app = express();
  const publicDirectory = resolve(process.cwd(), 'public');

  app.use(express.json({ limit: '32kb' }));
  app.use('/api/clientes', crearRutasClientes(db));
  app.use(express.static(publicDirectory));
  app.get('/', (_req, res) => res.sendFile(resolve(publicDirectory, 'MiniCRM.html')));
  app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

  const manejarErrores: ErrorRequestHandler = (error: unknown, _req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    if (error instanceof ErrorHttp) {
      res.status(error.estado).json({ error: error.message });
      return;
    }
    if (error instanceof SyntaxError && 'body' in error) {
      res.status(400).json({ error: 'El cuerpo de la solicitud no contiene JSON válido.' });
      return;
    }

    console.error('Error inesperado al procesar la solicitud:', error);
    res.status(500).json({ error: 'Ocurrió un error interno.' });
  };
  app.use(manejarErrores);

  return app;
}
