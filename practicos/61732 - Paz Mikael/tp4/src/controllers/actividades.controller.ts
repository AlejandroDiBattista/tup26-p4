import { Request, Response } from 'express'
import { Clientes } from '../services/clientes.service.js'

export class ActividadesController {
  static async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de actividad inválido' })
        return
      }

      const actualizada = await Clientes.actualizarActividad(id, req.body)
      res.json(actualizada)
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar actividad' })
    }
  }

  static async completar(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de actividad inválido' })
        return
      }

      const completada = await Clientes.completarActividad(id)
      res.json(completada)
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al completar actividad' })
    }
  }

  static async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de actividad inválido' })
        return
      }

      await Clientes.eliminarActividad(id)
      res.status(204).send()
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al eliminar actividad' })
    }
  }
}
