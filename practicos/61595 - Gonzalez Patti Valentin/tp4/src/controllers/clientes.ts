import type { Request, Response } from "express";
import { Clientes, type CambiosActividad, type CambiosCliente, type DatosActividad, type DatosCliente } from "../services/clientes.js";
import { ErrorServicio } from "../services/error.js";

type ParametrosCliente = { clienteId: string };
type ParametrosActividad = ParametrosCliente & { actividadId: string };

function leerId(valor: string, nombre: string): number {
  const id = Number(valor);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new ErrorServicio(`${nombre} debe ser un entero positivo.`);
  }
  return id;
}

function leerObjetoBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ErrorServicio("El cuerpo debe ser un objeto JSON.");
  }
  return body as Record<string, unknown>;
}

export function listarClientes(
  req: Request<{}, unknown, unknown, { q?: string }>,
  res: Response,
): void {
  res.json(Clientes.listar(req.query.q ?? ""));
}

export function obtenerCliente(req: Request<ParametrosCliente>, res: Response): void {
  res.json(Clientes.obtener(leerId(req.params.clienteId, "clienteId")));
}

export function crearCliente(req: Request, res: Response): void {
  const datos = leerObjetoBody(req.body) as unknown as DatosCliente;
  res.status(201).json(Clientes.crear(datos));
}

export function actualizarCliente(req: Request<ParametrosCliente>, res: Response): void {
  const id = leerId(req.params.clienteId, "clienteId");
  const cambios = leerObjetoBody(req.body) as unknown as CambiosCliente;
  res.json(Clientes.actualizar(id, cambios));
}

export function eliminarCliente(req: Request<ParametrosCliente>, res: Response): void {
  Clientes.eliminar(leerId(req.params.clienteId, "clienteId"));
  res.status(204).end();
}

export function listarActividades(req: Request<ParametrosCliente>, res: Response): void {
  const clienteId = leerId(req.params.clienteId, "clienteId");
  res.json(Clientes.listarActividades(clienteId));
}

export function obtenerActividad(req: Request<ParametrosActividad>, res: Response): void {
  const clienteId = leerId(req.params.clienteId, "clienteId");
  const actividadId = leerId(req.params.actividadId, "actividadId");
  res.json(Clientes.obtenerActividad(clienteId, actividadId));
}

export function crearActividad(req: Request<ParametrosCliente>, res: Response): void {
  const clienteId = leerId(req.params.clienteId, "clienteId");
  const datos = leerObjetoBody(req.body) as unknown as DatosActividad;
  res.status(201).json(Clientes.crearActividad(clienteId, datos));
}

export function actualizarActividad(req: Request<ParametrosActividad>, res: Response): void {
  const clienteId = leerId(req.params.clienteId, "clienteId");
  const actividadId = leerId(req.params.actividadId, "actividadId");
  const cambios = leerObjetoBody(req.body) as unknown as CambiosActividad;
  res.json(Clientes.actualizarActividad(clienteId, actividadId, cambios));
}

export function completarActividad(req: Request<ParametrosActividad>, res: Response): void {
  const clienteId = leerId(req.params.clienteId, "clienteId");
  const actividadId = leerId(req.params.actividadId, "actividadId");
  const body = req.body === undefined ? {} : leerObjetoBody(req.body);
  const fechaEjecucion = body.fechaEjecucion;
  if (fechaEjecucion !== undefined && typeof fechaEjecucion !== "string") {
    throw new ErrorServicio("fechaEjecucion debe ser una fecha con formato AAAA-MM-DD.");
  }
  res.json(Clientes.completarActividad(clienteId, actividadId, fechaEjecucion));
}

export function eliminarActividad(req: Request<ParametrosActividad>, res: Response): void {
  const clienteId = leerId(req.params.clienteId, "clienteId");
  const actividadId = leerId(req.params.actividadId, "actividadId");
  Clientes.eliminarActividad(clienteId, actividadId);
  res.status(204).end();
}
