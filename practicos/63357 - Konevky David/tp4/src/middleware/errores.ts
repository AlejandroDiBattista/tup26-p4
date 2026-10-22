import type { ErrorRequestHandler } from 'express';
import { ErrorServicio } from '../services/clientes.js';

const estados = { invalido: 400, no_encontrado: 404, conflicto: 409 };

export const manejarErrores: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ErrorServicio) {
    res.status(estados[err.codigo]).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno' });
};
