import type { Request, Response } from "express";
import { Clientes } from "../servicios/clientes.ts";

function idDe(valor: string | undefined) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw Object.assign(new Error("Id inválido"), { status: 400 });
  }
  return id;
}

export async function crear(req: Request, res: Response) {
  const descripcion = req.body?.descripcion;
  if (!descripcion?.trim()) {
    return res.status(400).json({ error: "La descripción es obligatoria" });
  }
  const fila = await Clientes.agregarActividad(idDe(req.params.id), req.body);
  res.status(201).json(fila);
}

export async function actualizar(req: Request, res: Response) {
  const descripcion = req.body?.descripcion;
  if (!descripcion?.trim()) {
    return res.status(400).json({ error: "La descripción es obligatoria" });
  }
  const fila = await Clientes.editarActividad(idDe(req.params.actId), req.body);
  res.json(fila);
}

export async function completar(req: Request, res: Response) {
  res.json(await Clientes.completarActividad(idDe(req.params.actId)));
}

export async function eliminar(req: Request, res: Response) {
  await Clientes.borrarActividad(idDe(req.params.actId));
  res.status(204).end();
}
