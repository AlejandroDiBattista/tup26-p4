import type { Request, Response } from 'express';
import { Clientes } from './clientes.service.js';

const fail = (res: Response, err: unknown, status = 400) => {
  const msg = err instanceof Error ? err.message : 'Error en la solicitud';
  const statusCode = msg.includes('no encontrada') || msg.includes('no encontrado') ? 404
    : msg.includes('no se puede') ? 409
    : status;
  return res.status(statusCode).json({ error: msg });
};

export const clientesController = {
  listar: (req: Request, res: Response) => {
    try {
      const q = String(req.query.q ?? '');
      res.json(Clientes.listar(q));
    } catch (e) {
      fail(res, e);
    }
  },

  obtener: (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const cliente = Clientes.obtener(id);
      if (!cliente) {
        res.status(404).json({ error: 'Cliente no encontrado' });
        return;
      }
      res.json(cliente);
    } catch (e) {
      fail(res, e);
    }
  },

  crear: (req: Request, res: Response) => {
    try {
      const nuevo = Clientes.crear(req.body);
      res.status(201).json(nuevo);
    } catch (e) {
      fail(res, e);
    }
  },

  actualizar: (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const actualizado = Clientes.actualizar(id, req.body);
      res.json(actualizado);
    } catch (e) {
      fail(res, e);
    }
  },

  eliminar: (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      Clientes.eliminar(id);
      res.sendStatus(204);
    } catch (e) {
      fail(res, e);
    }
  },
};

export const actividadesController = {
  listar: (req: Request, res: Response) => {
    try {
      const clienteId = Number(req.params.clienteId);
      res.json(Clientes.actividades(clienteId));
    } catch (e) {
      fail(res, e);
    }
  },

  crear: (req: Request, res: Response) => {
    try {
      const clienteId = Number(req.params.clienteId);
      const nueva = Clientes.crearActividad(clienteId, req.body);
      res.status(201).json(nueva);
    } catch (e) {
      fail(res, e);
    }
  },

  editar: (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const editada = Clientes.editarActividad(id, req.body);
      res.json(editada);
    } catch (e) {
      fail(res, e);
    }
  },

  completar: (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const completada = Clientes.completarActividad(id);
      res.json(completada);
    } catch (e) {
      fail(res, e);
    }
  },

  eliminar: (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      Clientes.eliminarActividad(id);
      res.sendStatus(204);
    } catch (e) {
      fail(res, e);
    }
  },
};
