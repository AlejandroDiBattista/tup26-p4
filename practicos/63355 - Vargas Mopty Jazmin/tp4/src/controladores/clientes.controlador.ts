import type { NextFunction, Request, Response } from 'express';
import { Clientes, type Resultado } from '../servicios/clientes.servicio.js';

function responder<T extends object>(res: Response, resultado: Resultado<T>, estado = 200) {
  if ('error' in resultado) {
    res.status(resultado.estado).json({ error: resultado.error });
    return;
  }

  res.status(estado).json(resultado);
}

export function validarId(_req: Request, res: Response, next: NextFunction, valor: string) {
  if (!/^[1-9]\d*$/.test(valor) || !Number.isSafeInteger(Number(valor))) {
    res.status(400).json({ error: 'El identificador debe ser un entero positivo.' });
    return;
  }

  next();
}

export function listar(req: Request, res: Response) {
  const busqueda = req.query.q;
  if (busqueda !== undefined && typeof busqueda !== 'string') {
    res.status(400).json({ error: 'La búsqueda debe ser texto.' });
    return;
  }

  res.json(Clientes.listar(busqueda));
}

export function obtenerPorId(req: Request, res: Response) {
  const cliente = Clientes.obtenerPorId(Number(req.params.id));
  if (!cliente) {
    res.status(404).json({ error: 'Cliente no encontrado.' });
    return;
  }

  res.json(cliente);
}

export function crear(req: Request, res: Response) {
  responder(res, Clientes.crear(req.body), 201);
}

export function actualizar(req: Request, res: Response) {
  responder(res, Clientes.actualizar(Number(req.params.id), req.body));
}

export function eliminar(req: Request, res: Response) {
  responder(res, Clientes.eliminar(Number(req.params.id)));
}

export function agregarActividad(req: Request, res: Response) {
  responder(res, Clientes.agregarActividad(Number(req.params.id), req.body), 201);
}

export function actualizarActividad(req: Request, res: Response) {
  responder(res, Clientes.actualizarActividad(
    Number(req.params.id), Number(req.params.actividadId), req.body,
  ));
}

export function completarActividad(req: Request, res: Response) {
  responder(res, Clientes.completarActividad(
    Number(req.params.id), Number(req.params.actividadId),
  ));
}

export function eliminarActividad(req: Request, res: Response) {
  responder(res, Clientes.eliminarActividad(
    Number(req.params.id), Number(req.params.actividadId),
  ));
}
