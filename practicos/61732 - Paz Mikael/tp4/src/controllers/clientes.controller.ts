import { Request, Response } from 'express'
import { Clientes } from '../services/clientes.service.js'

export class ClientesController {
  static async listar(req: Request, res: Response): Promise<void> {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : undefined
      const lista = await Clientes.listar(q)
      res.json(lista)
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al listar clientes' })
    }
  }

  static async obtener(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de cliente inválido' })
        return
      }

      const cliente = await Clientes.obtenerPorId(id)
      if (!cliente) {
        res.status(404).json({ error: 'Cliente no encontrado' })
        return
      }

      res.json(cliente)
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener cliente' })
    }
  }

  static async crear(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, email, telefono, direccion, ciudad } = req.body
      if (!nombre || !email) {
        res.status(400).json({ error: 'El nombre y el email son obligatorios' })
        return
      }

      const nuevo = await Clientes.crear({
        nombre,
        email,
        telefono: telefono || '',
        direccion: direccion || '',
        ciudad: ciudad || ''
      })

      res.status(201).json(nuevo)
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al crear cliente' })
    }
  }

  static async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de cliente inválido' })
        return
      }

      const actualizado = await Clientes.actualizar(id, req.body)
      res.json(actualizado)
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar cliente' })
    }
  }

  static async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de cliente inválido' })
        return
      }

      await Clientes.eliminar(id)
      res.status(204).send()
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al eliminar cliente' })
    }
  }

  static async agregarActividad(req: Request, res: Response): Promise<void> {
    try {
      const clienteId = Number(req.params.id)
      if (isNaN(clienteId)) {
        res.status(400).json({ error: 'ID de cliente inválido' })
        return
      }

      const { descripcion, fecha } = req.body
      if (!descripcion) {
        res.status(400).json({ error: 'La descripción es obligatoria' })
        return
      }

      const actividad = await Clientes.agregarActividad(clienteId, {
        descripcion,
        fecha: fecha || null
      })

      res.status(201).json(actividad)
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al agregar actividad' })
    }
  }
}
