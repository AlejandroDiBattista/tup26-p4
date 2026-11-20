import type { Request, Response } from "express";
import { Clientes, type CambiosCliente, type CampoCliente, type DatosCliente, type FiltroCliente } from "../services/clientes.service";
import { cuerpo, idParam } from "./params";

const campos: CampoCliente[] = ["nombre", "apellido", "email", "domicilio", "localidad", "telefono"];

/**
 * GET /api/clientes
 * ?q=texto        -> busca en todos los campos
 * ?localidad=...  -> filtra por campo (combinables)
 */
export async function listar(req: Request, res: Response) {
  const { q } = req.query;
  if (typeof q === "string") {
    res.json(await Clientes.buscar(q));
    return;
  }
  const filtro: FiltroCliente = {};
  for (const campo of campos) {
    const valor = req.query[campo];
    if (typeof valor === "string") filtro[campo] = valor;
  }
  res.json(await Clientes.buscar(filtro));
}

export async function obtener(req: Request, res: Response) {
  res.json(await Clientes.obtener(idParam(req, "id")));
}

export async function crear(req: Request, res: Response) {
  const cliente = await Clientes.crear(cuerpo<DatosCliente>(req) as DatosCliente);
  res.status(201).location(`/api/clientes/${cliente.id}`).json(cliente);
}

export async function actualizar(req: Request, res: Response) {
  res.json(await Clientes.actualizar(idParam(req, "id"), cuerpo<CambiosCliente>(req)));
}

export async function eliminar(req: Request, res: Response) {
  await Clientes.eliminar(idParam(req, "id"));
  res.status(204).end();
}
