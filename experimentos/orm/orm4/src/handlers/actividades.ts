import type { Request, Response, NextFunction } from 'express';
import type { Actividad, NuevaActividad } from '../db/schema.js';
import { Actividades } from '../repositorios/Actividades.js';

function leerId(valor: string | string[]) {
  if (Array.isArray(valor)) return null;
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export class ActividadesHandler {
  static async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const estado = req.query.estado;
      if (estado === 'pendientes') return res.json(await Actividades.obtenerPendientes());
      if (estado === 'vencidas')   return res.json(await Actividades.obtenerVencidas());
      if (estado === 'sin-plazo')  return res.json(await Actividades.obtenerSinPlazo());
      if (estado) return res.status(400).json({ error: 'estado debe ser pendientes, vencidas o sin-plazo.' });
      res.json(await Actividades.obtenerTodas());
    } catch (error) { next(error); }
  }

  static async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const id = leerId(req.params.id);
      if (!id) return res.status(400).json({ error: 'El id debe ser un número positivo.' });
      const actividad = await Actividades.obtenerPorId(id);
      if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada.' });
      res.json(actividad);
    } catch (error) { next(error); }
  }

  static async crear(req: Request<Record<string, never>, unknown, NuevaActividad>, res: Response, next: NextFunction) {
    try {
      const datos = req.body;
      if (!datos.clienteId || !datos.descripcion) {
        return res.status(400).json({ error: 'clienteId y descripcion son obligatorios.' });
      }
      const actividad: Actividad = await Actividades.crear({
        ...datos,
        fechaComprometida: datos.fechaComprometida
          ? new Date(String(datos.fechaComprometida))
          : null,
      });
      res.status(201).json(actividad);
    } catch (error) { next(error); }
  }

  static async actualizar(req: Request<{ id: string }, unknown, Partial<NuevaActividad>>, res: Response, next: NextFunction) {
    try {
      const id = leerId(req.params.id);
      if (!id) return res.status(400).json({ error: 'El id debe ser un número positivo.' });
      const actividad: Actividad | undefined = await Actividades.actualizar(id, req.body);
      if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada.' });
      res.json(actividad);
    } catch (error) { next(error); }
  }

  static async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = leerId(req.params.id);
      if (!id) return res.status(400).json({ error: 'El id debe ser un número positivo.' });
      const actividad = await Actividades.eliminar(id);
      if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada.' });
      res.json(actividad);
    } catch (error) { next(error); }
  }
}
