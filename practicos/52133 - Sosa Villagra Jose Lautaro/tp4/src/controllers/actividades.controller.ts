import type { Request, Response } from 'express';
import { Clientes } from '../services/clientes.service';
import { HttpError, leerId, manejar } from '../services/errors';

/** Controladores HTTP de actividades. */
export class ActividadesController {
  static listar = manejar(async (req: Request, res: Response) => {
    const clienteId = Number(req.query.clienteId);
    if (!Number.isInteger(clienteId) || clienteId <= 0) {
      throw new HttpError(400, 'El parámetro clienteId es obligatorio');
    }
    const lista = await Clientes.listarActividades(clienteId);
    res.json(lista);
  });

  static crear = manejar(async (req: Request, res: Response) => {
    const clienteId = Number(req.body?.clienteId);
    if (!Number.isInteger(clienteId) || clienteId <= 0) {
      throw new HttpError(400, 'El clienteId es obligatorio');
    }
    const actividad = await Clientes.agregarActividad(clienteId, req.body ?? {});
    res.status(201).json(actividad);
  });

  static actualizar = manejar(async (req: Request, res: Response) => {
    const actividad = await Clientes.actualizarActividad(
      leerId(req.params.id),
      req.body ?? {},
    );
    res.json(actividad);
  });

  static completar = manejar(async (req: Request, res: Response) => {
    const actividad = await Clientes.completarActividad(leerId(req.params.id));
    res.json(actividad);
  });

  static reabrir = manejar(async (req: Request, res: Response) => {
    const actividad = await Clientes.reabrirActividad(leerId(req.params.id));
    res.json(actividad);
  });

  static eliminar = manejar(async (req: Request, res: Response) => {
    await Clientes.eliminarActividad(leerId(req.params.id));
    res.status(204).send();
  });
}
