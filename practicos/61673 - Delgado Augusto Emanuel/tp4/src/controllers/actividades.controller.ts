import { Request, Response } from 'express';
import { Clientes } from '../services/clientes.service';

export class ActividadesController {
  /**
   * PUT /api/actividades/:id
   * Actualiza una actividad si no está completada
   */
  static async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de actividad inválido' });
        return;
      }

      const { descripcion, fecha } = req.body;
      const actividadActualizada = await Clientes.actualizarActividad(id, {
        descripcion,
        fecha,
      });

      res.json(actividadActualizada);
    } catch (error: any) {
      if (error.message?.includes('no se pueden editar')) {
        res.status(400).json({ error: error.message });
        return;
      }
      const status = error.message?.includes('no encontrada') ? 404 : 400;
      res.status(status).json({ error: error.message || 'Error al actualizar actividad' });
    }
  }

  /**
   * PATCH /api/actividades/:id/completar
   * Marca una actividad como completada
   */
  static async completar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de actividad inválido' });
        return;
      }

      const actividadCompletada = await Clientes.completarActividad(id);
      res.json(actividadCompletada);
    } catch (error: any) {
      const status = error.message?.includes('no encontrada') ? 404 : 400;
      res.status(status).json({ error: error.message || 'Error al completar actividad' });
    }
  }

  /**
   * DELETE /api/actividades/:id
   * Elimina una actividad si no está completada
   */
  static async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de actividad inválido' });
        return;
      }

      await Clientes.eliminarActividad(id);
      res.json({ mensaje: 'Actividad eliminada correctamente', id });
    } catch (error: any) {
      if (error.message?.includes('no se pueden editar ni borrar')) {
        res.status(400).json({ error: error.message });
        return;
      }
      const status = error.message?.includes('no encontrada') ? 404 : 400;
      res.status(status).json({ error: error.message || 'Error al eliminar actividad' });
    }
  }
}
