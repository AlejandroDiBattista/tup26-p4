import type { ErrorRequestHandler } from 'express';
import { ErrorServicio, codigoSql } from '../errores.js';
import { ErrorPeticion } from './peticion.js';

export const errores: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof ErrorServicio) {
    const status = { validacion: 400, no_encontrado: 404, conflicto: 409 }[error.codigo];
    res.status(status).json({ error: error.message });
  } else if (error instanceof ErrorPeticion) {
    res.status(error.status).json({ error: error.message });
  } else if (codigoSql(error)?.startsWith('SQLITE_CONSTRAINT_UNIQUE')) {
    res.status(409).json({ error: 'Ese email ya está en uso. Ingresá otro o editá el cliente existente.' });
  } else if (error && typeof error === 'object' && 'type' in error && error.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'JSON inválido.' });
  } else if (error && typeof error === 'object' && 'type' in error && error.type === 'entity.too.large') {
    res.status(413).json({ error: 'El cuerpo de la petición es demasiado grande.' });
  } else {
    console.error(error);
    res.status(500).json({ error: 'No pudimos completar la operación. Intentá de nuevo.' });
  }
};
