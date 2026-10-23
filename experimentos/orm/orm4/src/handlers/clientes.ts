import type { Request, Response, NextFunction } from 'express';
import type { Cliente, NuevoCliente } from '../db/schema.js';
import { Clientes } from '../repositorios/Clientes.js';

function leerId(valor: string | string[]) {
  if (Array.isArray(valor)) return null;
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export class ClientesHandler {
  static async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const texto = String(req.query.q ?? '').trim();
      const resultado = texto ? await Clientes.buscar(texto) : await Clientes.obtenerTodos();
      res.json(resultado);
    } catch (error) { next(error); }
  }

  static async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const id = leerId(req.params.id);
      if (!id) return res.status(400).json({ error: 'El id debe ser un número positivo.' });
      const cliente = await Clientes.obtenerPorId(id);
      if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado.' });
      res.json(cliente);
    } catch (error) { next(error); }
  }

  static async crear(req: Request<Record<string, never>, unknown, NuevoCliente>, res: Response, next: NextFunction) {
    try {
      const datos = req.body;
      if (!datos.nombre || !datos.apellido || !datos.email) {
        return res.status(400).json({ error: 'nombre, apellido y email son obligatorios.' });
      }
      const cliente: Cliente = await Clientes.crear(datos);
      res.status(201).json(cliente);
    } catch (error) { next(error); }
  }

  static async actualizar(req: Request<{ id: string }, unknown, Partial<NuevoCliente>>, res: Response, next: NextFunction) {
    try {
      const id = leerId(req.params.id);
      if (!id) return res.status(400).json({ error: 'El id debe ser un número positivo.' });
      const cliente: Cliente | undefined = await Clientes.actualizar(id, req.body);
      if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado.' });
      res.json(cliente);
    } catch (error) { next(error); }
  }

  static async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = leerId(req.params.id);
      if (!id) return res.status(400).json({ error: 'El id debe ser un número positivo.' });
      const cliente = await Clientes.eliminar(id);
      if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado.' });
      res.json(cliente);
    } catch (error) { next(error); }
  }
}
