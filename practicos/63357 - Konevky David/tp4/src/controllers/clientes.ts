import type { Request, Response } from 'express';
import { Clientes, ErrorServicio } from '../services/clientes.js';

export const id = (valor: unknown, nombre = 'id') => {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) throw new ErrorServicio('invalido', `${nombre} inválido`);
  return n;
};

export class ClientesController {
  // ?q=texto busca en cualquier campo; ?apellido=...&localidad=... filtra por campos.
  static async listar(req: Request, res: Response) {
    const { q, ...campos } = req.query as Record<string, string>;
    res.json(await Clientes.buscar(q ?? campos));
  }

  static async obtener(req: Request, res: Response) {
    res.json(await Clientes.obtener(id(req.params.id)));
  }

  static async crear(req: Request, res: Response) {
    res.status(201).json(await Clientes.crear(req.body ?? {}));
  }

  static async actualizar(req: Request, res: Response) {
    res.json(await Clientes.actualizar(id(req.params.id), req.body ?? {}));
  }

  static async eliminar(req: Request, res: Response) {
    await Clientes.eliminar(id(req.params.id));
    res.status(204).end();
  }
}
