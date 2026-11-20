import type { NextFunction, Request, Response } from "express";
import { Clientes, ErrorServicio } from "../services/Clientes.js";

type Handler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

function rutear(fn: Handler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}

function idDe(req: Request): number {
  return Number(req.params.id);
}

export const clientesController = {
  listar: rutear(async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const campo =
      typeof req.query.campo === "string" ? req.query.campo : undefined;
    res.json(await Clientes.buscar(q, campo));
  }),

  obtener: rutear(async (req, res) => {
    res.json(await Clientes.obtener(idDe(req)));
  }),

  crear: rutear(async (req, res) => {
    res.status(201).json(await Clientes.crear(req.body ?? {}));
  }),

  actualizar: rutear(async (req, res) => {
    res.json(await Clientes.actualizar(idDe(req), req.body ?? {}));
  }),

  eliminar: rutear(async (req, res) => {
    await Clientes.eliminar(idDe(req));
    res.status(204).end();
  }),

  agregarActividad: rutear(async (req, res) => {
    res.status(201).json(await Clientes.agregarActividad(idDe(req), req.body ?? {}));
  }),

  actualizarActividad: rutear(async (req, res) => {
    res.json(
      await Clientes.actualizarActividad(
        idDe(req),
        Number(req.params.actividadId),
        req.body ?? {}
      )
    );
  }),

  completarActividad: rutear(async (req, res) => {
    res.json(
      await Clientes.completarActividad(idDe(req), Number(req.params.actividadId))
    );
  }),

  eliminarActividad: rutear(async (req, res) => {
    await Clientes.eliminarActividad(idDe(req), Number(req.params.actividadId));
    res.status(204).end();
  }),
};

export function manejadorErrores(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ErrorServicio) {
    res.status(err.estado).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
}
