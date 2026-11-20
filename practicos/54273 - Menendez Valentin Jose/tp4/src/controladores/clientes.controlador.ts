import type { Request, Response } from 'express';
import { Clientes, ErrorNegocio } from '../servicios/clientes.servicio.js';

function manejarError(res: Response, error: unknown): void {
  if (error instanceof ErrorNegocio) {
    res.status(error.codigo).json({ error: error.message });
    return;
  }
  res.status(500).json({ error: 'Error interno del servidor' });
}

function parsearId(valor: string | undefined): number | null {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    return null;
  }
  return numero;
}

export class ClientesControlador {
  static listar(req: Request, res: Response): void {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : undefined;
      const resultado = Clientes.listar(q);
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  }

  static obtenerPorId(req: Request, res: Response): void {
    try {
      const id = parsearId(req.params.id);
      if (!id) {
        res.status(400).json({ error: 'ID de cliente inválido' });
        return;
      }

      const cliente = Clientes.obtenerPorId(id);
      if (!cliente) {
        res.status(404).json({ error: 'Cliente no encontrado' });
        return;
      }

      res.status(200).json(cliente);
    } catch (error) {
      manejarError(res, error);
    }
  }

  static crear(req: Request, res: Response): void {
    try {
      const nuevo = Clientes.crear(req.body);
      res.status(201).json(nuevo);
    } catch (error) {
      manejarError(res, error);
    }
  }

  static actualizar(req: Request, res: Response): void {
    try {
      const id = parsearId(req.params.id);
      if (!id) {
        res.status(400).json({ error: 'ID de cliente inválido' });
        return;
      }

      const actualizado = Clientes.actualizar(id, req.body);
      res.status(200).json(actualizado);
    } catch (error) {
      manejarError(res, error);
    }
  }

  static eliminar(req: Request, res: Response): void {
    try {
      const id = parsearId(req.params.id);
      if (!id) {
        res.status(400).json({ error: 'ID de cliente inválido' });
        return;
      }

      Clientes.eliminar(id);
      res.status(200).json({ mensaje: 'Cliente eliminado correctamente' });
    } catch (error) {
      manejarError(res, error);
    }
  }

  static agregarActividad(req: Request, res: Response): void {
    try {
      const clienteId = parsearId(req.params.id);
      if (!clienteId) {
        res.status(400).json({ error: 'ID de cliente inválido' });
        return;
      }

      const actividad = Clientes.agregarActividad(clienteId, req.body);
      res.status(201).json(actividad);
    } catch (error) {
      manejarError(res, error);
    }
  }

  static actualizarActividad(req: Request, res: Response): void {
    try {
      const clienteId = parsearId(req.params.id);
      const actividadId = parsearId(req.params.actividadId);
      if (!clienteId || !actividadId) {
        res.status(400).json({ error: 'Identificadores inválidos' });
        return;
      }

      const actividad = Clientes.actualizarActividad(clienteId, actividadId, req.body);
      res.status(200).json(actividad);
    } catch (error) {
      manejarError(res, error);
    }
  }

  static completarActividad(req: Request, res: Response): void {
    try {
      const clienteId = parsearId(req.params.id);
      const actividadId = parsearId(req.params.actividadId);
      if (!clienteId || !actividadId) {
        res.status(400).json({ error: 'Identificadores inválidos' });
        return;
      }

      const actividad = Clientes.completarActividad(clienteId, actividadId);
      res.status(200).json(actividad);
    } catch (error) {
      manejarError(res, error);
    }
  }

  static eliminarActividad(req: Request, res: Response): void {
    try {
      const clienteId = parsearId(req.params.id);
      const actividadId = parsearId(req.params.actividadId);
      if (!clienteId || !actividadId) {
        res.status(400).json({ error: 'Identificadores inválidos' });
        return;
      }

      Clientes.eliminarActividad(clienteId, actividadId);
      res.status(200).json({ mensaje: 'Actividad eliminada correctamente' });
    } catch (error) {
      manejarError(res, error);
    }
  }
}
