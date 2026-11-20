import type { Request, Response } from "express";
import { Clientes, type CambiosActividad, type DatosActividad } from "../servicios/clientes.js";

type ParamsCliente = { clienteId: string };
type ParamsActividad = ParamsCliente & { id: string };
type CuerpoCompletar = { fechaFinalizacion?: string | null } | undefined;

/** GET /api/clientes/:clienteId/actividades */
async function listar(req: Request<ParamsCliente>, res: Response): Promise<void> {
  res.json(await Clientes.listarActividades(req.params.clienteId));
}

/** GET /api/clientes/:clienteId/actividades/:id */
async function obtener(req: Request<ParamsActividad>, res: Response): Promise<void> {
  res.json(await Clientes.obtenerActividad(req.params.clienteId, req.params.id));
}

/** POST /api/clientes/:clienteId/actividades */
async function crear(req: Request<ParamsCliente, unknown, DatosActividad>, res: Response): Promise<void> {
  const actividad = await Clientes.agregarActividad(req.params.clienteId, req.body);
  res.status(201).location(`${req.baseUrl}/${actividad.id}`).json(actividad);
}

/** PUT | PATCH /api/clientes/:clienteId/actividades/:id — solo actividades pendientes. */
async function actualizar(req: Request<ParamsActividad, unknown, CambiosActividad>, res: Response): Promise<void> {
  res.json(await Clientes.actualizarActividad(req.params.clienteId, req.params.id, req.body));
}

/** POST /api/clientes/:clienteId/actividades/:id/completar — body opcional { fechaFinalizacion }. */
async function completar(req: Request<ParamsActividad, unknown, CuerpoCompletar>, res: Response): Promise<void> {
  const fecha = req.body?.fechaFinalizacion;
  res.json(await Clientes.completarActividad(req.params.clienteId, req.params.id, fecha));
}

/** DELETE /api/clientes/:clienteId/actividades/:id — solo actividades pendientes. */
async function eliminar(req: Request<ParamsActividad>, res: Response): Promise<void> {
  await Clientes.eliminarActividad(req.params.clienteId, req.params.id);
  res.status(204).end();
}

export const actividadesController = { listar, obtener, crear, actualizar, completar, eliminar };
