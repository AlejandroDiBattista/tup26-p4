import type { Request, Response } from "express";
import { Clientes, type CambiosCliente, type DatosCliente } from "../servicios/clientes.js";

// Los controladores solo traducen HTTP <-> servicio. Las validaciones y reglas viven en Clientes.
// Express 5 propaga los rechazos de funciones async al middleware de errores.

type ParamsCliente = { clienteId: string };

/** GET /api/clientes?q=texto */
async function listar(req: Request, res: Response): Promise<void> {
  const busqueda = typeof req.query.q === "string" ? req.query.q : "";
  res.json(await Clientes.listar(busqueda));
}

/** GET /api/clientes/:clienteId — ficha con actividades. */
async function obtener(req: Request<ParamsCliente>, res: Response): Promise<void> {
  res.json(await Clientes.obtener(req.params.clienteId));
}

/** POST /api/clientes */
async function crear(req: Request<object, unknown, DatosCliente>, res: Response): Promise<void> {
  const cliente = await Clientes.crear(req.body);
  res.status(201).location(`${req.baseUrl}/${cliente.id}`).json(cliente);
}

/** PUT | PATCH /api/clientes/:clienteId — actualiza solo los campos enviados. */
async function actualizar(req: Request<ParamsCliente, unknown, CambiosCliente>, res: Response): Promise<void> {
  res.json(await Clientes.actualizar(req.params.clienteId, req.body));
}

/** DELETE /api/clientes/:clienteId — también borra sus actividades. */
async function eliminar(req: Request<ParamsCliente>, res: Response): Promise<void> {
  await Clientes.eliminar(req.params.clienteId);
  res.status(204).end();
}

export const clientesController = { listar, obtener, crear, actualizar, eliminar };
