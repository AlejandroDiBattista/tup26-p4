import { Request, Response } from "express";
import { Clientes } from "../services/Clientes.js";

const numero = (valor: string) => Number.parseInt(valor, 10);
const identificadorValido = (id: number) => Number.isInteger(id) && id > 0;

const clienteValido = (body: any) => typeof body?.nombre === "string" && body.nombre.trim() &&
  typeof body?.email === "string" && body.email.trim();

export function listar(req: Request, res: Response) {
  res.json(Clientes.listar(String(req.query.q ?? "")));
}

export function obtener(req: Request, res: Response) {
  const id = numero(String(req.params.id));
  if (!identificadorValido(id)) return res.status(400).json({ error: "El ID del cliente no es valido" });
  const cliente = Clientes.obtener(id);
  if (!cliente) return res.status(404).json({ error: "No encontramos ese cliente" });
  res.json(cliente);
}

export function crear(req: Request, res: Response) {
  if (!clienteValido(req.body)) return res.status(400).json({ error: "El nombre y el email son obligatorios" });
  res.status(201).json(Clientes.crear(req.body));
}

export function actualizar(req: Request, res: Response) {
  if (!clienteValido(req.body)) return res.status(400).json({ error: "El nombre y el email son obligatorios" });
  const id = numero(String(req.params.id));
  if (!identificadorValido(id)) return res.status(400).json({ error: "El ID del cliente no es valido" });
  const cliente = Clientes.actualizar(id, req.body);
  if (!cliente) return res.status(404).json({ error: "No encontramos ese cliente" });
  res.json(cliente);
}

export function eliminar(req: Request, res: Response) {
  const id = numero(String(req.params.id));
  if (!identificadorValido(id)) return res.status(400).json({ error: "El ID del cliente no es valido" });
  if (!Clientes.eliminar(id)) return res.status(404).json({ error: "No encontramos ese cliente" });
  res.status(204).send();
}

export function agregarActividad(req: Request, res: Response) {
  const id = numero(String(req.params.id));
  if (!identificadorValido(id)) return res.status(400).json({ error: "El ID del cliente no es valido" });
  const cliente = Clientes.obtener(id);
  if (!cliente) return res.status(404).json({ error: "No encontramos ese cliente" });
  if (typeof req.body?.descripcion !== "string" || !req.body.descripcion.trim()) {
    return res.status(400).json({ error: "La descripcion es obligatoria" });
  }
  res.status(201).json(Clientes.agregarActividad(cliente.id, req.body));
}

export function actualizarActividad(req: Request, res: Response) {
  if (typeof req.body?.descripcion !== "string" || !req.body.descripcion.trim()) {
    return res.status(400).json({ error: "La descripcion es obligatoria" });
  }
  const id = numero(String(req.params.actividadId));
  if (!identificadorValido(id)) return res.status(400).json({ error: "El ID de la actividad no es valido" });
  const actividad = Clientes.actualizarActividad(id, req.body);
  if (!actividad) return res.status(404).json({ error: "La actividad no existe o ya fue completada" });
  res.json(actividad);
}

export function completarActividad(req: Request, res: Response) {
  const id = numero(String(req.params.actividadId));
  if (!identificadorValido(id)) return res.status(400).json({ error: "El ID de la actividad no es valido" });
  const actividad = Clientes.completarActividad(id);
  if (!actividad) return res.status(404).json({ error: "La actividad no existe o ya fue completada" });
  res.json(actividad);
}

export function eliminarActividad(req: Request, res: Response) {
  const id = numero(String(req.params.actividadId));
  if (!identificadorValido(id)) return res.status(400).json({ error: "El ID de la actividad no es valido" });
  if (!Clientes.eliminarActividad(id)) {
    return res.status(404).json({ error: "La actividad no existe o ya fue completada" });
  }
  res.status(204).send();
}
