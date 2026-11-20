import { Request, Response } from 'express';
import { Clientes } from '../services/clientes.service.js';

function parseId(val: string | string[] | undefined): number {
  if (!val) return NaN;
  const str = Array.isArray(val) ? val[0] : val;
  return parseInt(str, 10);
}

export class ClientesController {
  // GET /api/clientes?q=...
  public static async listar(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      const criterio = typeof q === 'string' ? q : undefined;
      const lista = await Clientes.listar(criterio);
      res.json(lista);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al listar clientes' });
    }
  }

  // GET /api/clientes/:id
  public static async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = parseId(req.params.id);
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
      res.status(500).json({ error: error.message || 'Error al obtener cliente' });
    }
  }

  // POST /api/clientes
  public static async crear(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, apellido, email, domicilio, localidad, telefono } = req.body;
      if (!nombre || !apellido || !email) {
        res.status(400).json({ error: 'Nombre, apellido y email son obligatorios.' });
        return;
      }

      const nuevo = await Clientes.crear({
        nombre,
        apellido,
        email,
        domicilio: domicilio || null,
        localidad: localidad || null,
        telefono: telefono || null,
      });

      res.status(201).json(nuevo);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al crear cliente' });
    }
  }

  // PUT /api/clientes/:id
  public static async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseId(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de cliente inválido' });
        return;
      }

      const { nombre, apellido, email, domicilio, localidad, telefono } = req.body;
      const actualizado = await Clientes.actualizar(id, {
        nombre,
        apellido,
        email,
        domicilio,
        localidad,
        telefono,
      });

      if (!actualizado) {
        res.status(404).json({ error: 'Cliente no encontrado' });
        return;
      }

      res.json(actualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar cliente' });
    }
  }

  // DELETE /api/clientes/:id
  public static async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseId(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de cliente inválido' });
        return;
      }

      const eliminado = await Clientes.eliminar(id);
      if (!eliminado) {
        res.status(404).json({ error: 'Cliente no encontrado' });
        return;
      }

      res.json({ message: 'Cliente y sus actividades eliminados correctamente', id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al eliminar cliente' });
    }
  }

  // GET /api/clientes/:clienteId/actividades
  public static async listarActividades(req: Request, res: Response): Promise<void> {
    try {
      const clienteId = parseId(req.params.clienteId);
      if (isNaN(clienteId)) {
        res.status(400).json({ error: 'ID de cliente inválido' });
        return;
      }

      const lista = await Clientes.listarActividades(clienteId);
      res.json(lista);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al listar actividades' });
    }
  }

  // POST /api/clientes/:clienteId/actividades
  public static async crearActividad(req: Request, res: Response): Promise<void> {
    try {
      const clienteId = parseId(req.params.clienteId);
      if (isNaN(clienteId)) {
        res.status(400).json({ error: 'ID de cliente inválido' });
        return;
      }

      const { descripcion, fechaCompromiso } = req.body;
      if (!descripcion) {
        res.status(400).json({ error: 'La descripción es obligatoria' });
        return;
      }

      const nueva = await Clientes.crearActividad(clienteId, {
        descripcion,
        fechaCompromiso: fechaCompromiso || null,
      });

      res.status(201).json(nueva);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al crear actividad' });
    }
  }

  // PUT /api/clientes/:clienteId/actividades/:actividadId
  public static async actualizarActividad(req: Request, res: Response): Promise<void> {
    try {
      const clienteId = parseId(req.params.clienteId);
      const actividadId = parseId(req.params.actividadId);
      if (isNaN(clienteId) || isNaN(actividadId)) {
        res.status(400).json({ error: 'IDs inválidos' });
        return;
      }

      const { descripcion, fechaCompromiso } = req.body;
      const actualizada = await Clientes.actualizarActividad(clienteId, actividadId, {
        descripcion,
        fechaCompromiso,
      });

      res.json(actualizada);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar actividad' });
    }
  }

  // DELETE /api/clientes/:clienteId/actividades/:actividadId
  public static async borrarActividad(req: Request, res: Response): Promise<void> {
    try {
      const clienteId = parseId(req.params.clienteId);
      const actividadId = parseId(req.params.actividadId);
      if (isNaN(clienteId) || isNaN(actividadId)) {
        res.status(400).json({ error: 'IDs inválidos' });
        return;
      }

      const eliminada = await Clientes.borrarActividad(clienteId, actividadId);
      if (!eliminada) {
        res.status(404).json({ error: 'Actividad no encontrada' });
        return;
      }

      res.json({ message: 'Actividad eliminada correctamente', id: actividadId });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al borrar actividad' });
    }
  }

  // POST o PUT /api/clientes/:clienteId/actividades/:actividadId/completar
  public static async completarActividad(req: Request, res: Response): Promise<void> {
    try {
      const clienteId = parseId(req.params.clienteId);
      const actividadId = parseId(req.params.actividadId);
      if (isNaN(clienteId) || isNaN(actividadId)) {
        res.status(400).json({ error: 'IDs inválidos' });
        return;
      }

      const completada = await Clientes.completarActividad(clienteId, actividadId);
      res.json(completada);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al completar actividad' });
    }
  }
}
