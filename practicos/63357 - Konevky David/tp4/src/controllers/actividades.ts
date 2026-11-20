import type { Request, Response } from 'express';
import { Clientes } from '../services/clientes.js';
import { id } from './clientes.js';

const ids = (req: Request) => [id(req.params.clienteId, 'clienteId'), id(req.params.id)] as const;

export class ActividadesController {
  static async listar(req: Request, res: Response) {
    res.json(await Clientes.listarActividades(id(req.params.clienteId, 'clienteId')));
  }

  static async crear(req: Request, res: Response) {
    res.status(201).json(await Clientes.agregarActividad(id(req.params.clienteId, 'clienteId'), req.body ?? {}));
  }

  static async actualizar(req: Request, res: Response) {
    const [clienteId, actividadId] = ids(req);
    res.json(await Clientes.actualizarActividad(clienteId, actividadId, req.body ?? {}));
  }

  // Body opcional: { fecha: 'YYYY-MM-DD' } (por defecto hoy).
  static async completar(req: Request, res: Response) {
    const [clienteId, actividadId] = ids(req);
    res.json(await Clientes.completarActividad(clienteId, actividadId, req.body?.fecha));
  }

  static async eliminar(req: Request, res: Response) {
    const [clienteId, actividadId] = ids(req);
    await Clientes.eliminarActividad(clienteId, actividadId);
    res.status(204).end();
  }
}
