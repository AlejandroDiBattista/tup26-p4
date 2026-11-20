import type { Request, Response } from 'express';
import { Clientes } from '../../servicios/clientes';
import { leerCuerpo, leerId } from '../peticion';

/** GET /api/clientes, con búsqueda opcional: ?q=texto o ?email=dirección */
export async function listar(req: Request, res: Response) {
  const { q, email } = req.query;
  if (typeof email === 'string') {
    const cliente = await Clientes.buscarPorEmail(email);
    return res.json(cliente ? [cliente] : []);
  }
  res.json(typeof q === 'string' ? await Clientes.buscar(q) : await Clientes.listar());
}

export async function obtener(req: Request, res: Response) {
  res.json(await Clientes.obtener(leerId(req, 'clienteId')));
}

export async function crear(req: Request, res: Response) {
  const cliente = await Clientes.crear(leerCuerpo(req));
  res.status(201).location(`/api/clientes/${cliente.id}`).json(cliente);
}

export async function actualizar(req: Request, res: Response) {
  res.json(await Clientes.actualizar(leerId(req, 'clienteId'), leerCuerpo(req)));
}

export async function eliminar(req: Request, res: Response) {
  await Clientes.eliminar(leerId(req, 'clienteId'));
  res.status(204).end();
}
