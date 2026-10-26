import type { Request, Response } from "express";
import { Clientes, type CambiosActividad, type DatosActividad } from "../services/clientes.service";
import { cuerpo, idParam } from "./params";

export async function listar(req: Request, res: Response) {
  res.json(await Clientes.listarActividades(idParam(req, "clienteId")));
}

export async function crear(req: Request, res: Response) {
  const clienteId = idParam(req, "clienteId");
  const actividad = await Clientes.crearActividad(clienteId, cuerpo<DatosActividad>(req) as DatosActividad);
  res.status(201).location(`/api/clientes/${clienteId}/actividades/${actividad.id}`).json(actividad);
}

export async function actualizar(req: Request, res: Response) {
  const actividad = await Clientes.actualizarActividad(
    idParam(req, "clienteId"),
    idParam(req, "actividadId"),
    cuerpo<CambiosActividad>(req),
  );
  res.json(actividad);
}

/** PATCH .../completar  — cuerpo opcional { "fecha": "YYYY-MM-DD" } (por defecto hoy). */
export async function completar(req: Request, res: Response) {
  const { fecha } = cuerpo<{ fecha: string }>(req);
  res.json(await Clientes.completarActividad(idParam(req, "clienteId"), idParam(req, "actividadId"), fecha));
}

export async function eliminar(req: Request, res: Response) {
  await Clientes.eliminarActividad(idParam(req, "clienteId"), idParam(req, "actividadId"));
  res.status(204).end();
}
