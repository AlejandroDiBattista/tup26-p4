import type { NextFunction, Request, Response } from 'express';
import { Clientes } from '../services/clientes.js';

function idDesdeParametros(valor: string | string[] | undefined): number {
  if (Array.isArray(valor)) throw new Error('El id no es válido.');
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new Error('El id no es válido.');
  return id;
}

function datosDeActividad(body: Record<string, unknown>) {
  return {
    descripcion: String(body.descripcion ?? '').trim(),
    fecha: body.fecha ? String(body.fecha) : null,
  };
}

export function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const clienteId = idDesdeParametros(req.params.clienteId);
    const datos = datosDeActividad(req.body);
    if (!datos.descripcion) throw new Error('La descripción es obligatoria.');

    res.status(201).json(Clientes.crearActividad(clienteId, datos));
  } catch (error) {
    next(error);
  }
}

export function actualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const datos = datosDeActividad(req.body);
    if (!datos.descripcion) throw new Error('La descripción es obligatoria.');

    const actividad = Clientes.actualizarActividad(idDesdeParametros(req.params.id), datos);
    if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada.' });

    res.json(actividad);
  } catch (error) {
    next(error);
  }
}

export function completar(req: Request, res: Response, next: NextFunction) {
  try {
    const actividad = Clientes.completarActividad(idDesdeParametros(req.params.id));
    if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada.' });

    res.json(actividad);
  } catch (error) {
    next(error);
  }
}

export function eliminar(req: Request, res: Response, next: NextFunction) {
  try {
    const eliminada = Clientes.eliminarActividad(idDesdeParametros(req.params.id));
    if (!eliminada) return res.status(404).json({ error: 'Actividad no encontrada.' });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
