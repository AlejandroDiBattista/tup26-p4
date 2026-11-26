import type { Request, Response } from 'express';
import { Clientes } from '../services/clientes.service';
import { leerId, manejar } from '../services/errors';

/**
 * Controladores HTTP de clientes: solo reciben la petición, llaman al servicio
 * y responden. Las reglas de negocio viven en Clientes.
 */
export class ClientesController {
  static listar = manejar(async (req: Request, res: Response) => {
    const busqueda =
      typeof req.query.busqueda === 'string' ? req.query.busqueda : undefined;
    const lista = await Clientes.listar(busqueda);
    res.json(lista);
  });

  static obtener = manejar(async (req: Request, res: Response) => {
    const cliente = await Clientes.obtenerPorId(leerId(req.params.id));
    res.json(cliente);
  });

  static crear = manejar(async (req: Request, res: Response) => {
    const cliente = await Clientes.crear(req.body ?? {});
    res.status(201).json(cliente);
  });

  static actualizar = manejar(async (req: Request, res: Response) => {
    const cliente = await Clientes.actualizar(leerId(req.params.id), req.body ?? {});
    res.json(cliente);
  });

  static eliminar = manejar(async (req: Request, res: Response) => {
    await Clientes.eliminar(leerId(req.params.id));
    res.status(204).send();
  });
}
