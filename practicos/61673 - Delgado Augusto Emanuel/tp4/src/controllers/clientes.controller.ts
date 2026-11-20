import { Request, Response } from 'express';
import { Clientes } from '../services/clientes.service';

export class ClientesController {
  /**
   * GET /api/clientes
   * Opcionalmente recibe query ?q= o ?buscar= para búsqueda flexible
   */
  static async listar(req: Request, res: Response): Promise<void> {
    try {
      const termino = (req.query.q as string) || (req.query.buscar as string) || '';
      const lista = await Clientes.listar(termino);
      res.json(lista);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener clientes' });
    }
  }

  /**
   * GET /api/clientes/buscar?q=...
   * Endpoint específico para búsqueda flexible
   */
  static async buscar(req: Request, res: Response): Promise<void> {
    try {
      const criterio = (req.query.q as string) || (req.query.termino as string) || '';
      const resultados = await Clientes.buscar(criterio);
      res.json(resultados);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error en la búsqueda de clientes' });
    }
  }

  /**
   * GET /api/clientes/:id
   */
  static async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de cliente inválido' });
        return;
      }

      const cliente = await Clientes.obtenerPorId(id);
      if (!cliente) {
        res.status(404).json({ error: 'Cliente no encontrado' });
        return;
      }

      res.json(cliente);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener el cliente' });
    }
  }

  /**
   * POST /api/clientes
   */
  static async crear(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, email, telefono, direccion, ciudad } = req.body;
      if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        res.status(400).json({ error: 'El nombre del cliente es obligatorio' });
        return;
      }

      const nuevoCliente = await Clientes.crear({
        nombre,
        email,
        telefono,
        direccion,
        ciudad,
      });

      res.status(201).json(nuevoCliente);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al crear cliente' });
    }
  }

  /**
   * PUT /api/clientes/:id
   */
  static async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de cliente inválido' });
        return;
      }

      const { nombre, email, telefono, direccion, ciudad } = req.body;
      const clienteActualizado = await Clientes.actualizar(id, {
        nombre,
        email,
        telefono,
        direccion,
        ciudad,
      });

      res.json(clienteActualizado);
    } catch (error: any) {
      const status = error.message?.includes('no encontrado') ? 404 : 400;
      res.status(status).json({ error: error.message || 'Error al actualizar cliente' });
    }
  }

  /**
   * DELETE /api/clientes/:id
   */
  static async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de cliente inválido' });
        return;
      }

      await Clientes.eliminar(id);
      res.json({ mensaje: 'Cliente eliminado correctamente', id });
    } catch (error: any) {
      const status = error.message?.includes('no encontrado') ? 404 : 400;
      res.status(status).json({ error: error.message || 'Error al eliminar cliente' });
    }
  }

  /**
   * GET /api/clientes/:id/actividades
   */
  static async listarActividades(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de cliente inválido' });
        return;
      }

      const actividades = await Clientes.obtenerActividades(id);
      res.json(actividades);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener actividades' });
    }
  }

  /**
   * POST /api/clientes/:id/actividades
   */
  static async agregarActividad(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de cliente inválido' });
        return;
      }

      const { descripcion, fecha } = req.body;
      if (!descripcion || typeof descripcion !== 'string' || descripcion.trim() === '') {
        res.status(400).json({ error: 'La descripción de la actividad es obligatoria' });
        return;
      }

      const nuevaActividad = await Clientes.agregarActividad(id, { descripcion, fecha });
      res.status(201).json(nuevaActividad);
    } catch (error: any) {
      const status = error.message?.includes('no existe') ? 404 : 400;
      res.status(status).json({ error: error.message || 'Error al agregar actividad' });
    }
  }
}
