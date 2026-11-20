import type { Request, Response } from 'express'
import { Actividades } from '../services/actividades.js'

export const actualizar = (req: Request, res: Response) => {
  try {
    const actividad = Actividades.actualizar(Number(req.params.id), req.body)
    if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada' })
    res.json(actividad)
  } catch (e) {
    res.status(409).json({ error: (e as Error).message })
  }
}

export const completar = (req: Request, res: Response) => {
  const actividad = Actividades.completar(Number(req.params.id))
  if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada' })
  res.json(actividad)
}

export const eliminar = (req: Request, res: Response) => {
  try {
    if (!Actividades.eliminar(Number(req.params.id))) {
      return res.status(404).json({ error: 'Actividad no encontrada' })
    }
    res.status(204).end()
  } catch (e) {
    res.status(409).json({ error: (e as Error).message })
  }
}
