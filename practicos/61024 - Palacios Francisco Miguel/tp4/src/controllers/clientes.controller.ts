import type { Request, Response } from "express";
import { Actividades, Clientes } from "../services/Clientes.js";

const numero = (valor: string) => Number.isInteger(Number(valor)) && Number(valor) > 0 ? Number(valor) : null;

export const listarClientes = (req: Request, res: Response) => {
  res.json(Clientes.listar(String(req.query.q ?? "")));
};

export const obtenerCliente = (req: Request, res: Response) => {
  const id = numero(req.params.id);
  if (!id) return res.status(400).json({ error: "Identificador inválido" });
  const cliente = Clientes.obtener(id);
  return cliente ? res.json(cliente) : res.status(404).json({ error: "Cliente no encontrado" });
};

export const crearCliente = (req: Request, res: Response) => {
  const { nombre, email, telefono = "", direccion = "" } = req.body ?? {};
  if (typeof nombre !== "string" || !nombre.trim() || typeof email !== "string" || !email.trim())
    return res.status(400).json({ error: "Nombre y email son obligatorios" });
  return res.status(201).json(Clientes.crear({ nombre: nombre.trim(), email: email.trim(), telefono, direccion }));
};

export const actualizarCliente = (req: Request, res: Response) => {
  const id = numero(req.params.id);
  if (!id) return res.status(400).json({ error: "Identificador inválido" });
  const { nombre, email, telefono, direccion } = req.body ?? {};
  if (typeof nombre !== "string" || !nombre.trim() || typeof email !== "string" || !email.trim())
    return res.status(400).json({ error: "Nombre y email son obligatorios" });
  const cliente = Clientes.actualizar(id, { nombre: nombre.trim(), email: email.trim(), telefono, direccion });
  return cliente ? res.json(cliente) : res.status(404).json({ error: "Cliente no encontrado" });
};

export const eliminarCliente = (req: Request, res: Response) => {
  const id = numero(req.params.id);
  if (!id) return res.status(400).json({ error: "Identificador inválido" });
  return Clientes.eliminar(id) ? res.status(204).end() : res.status(404).json({ error: "Cliente no encontrado" });
};

export const crearActividad = (req: Request, res: Response) => {
  const clienteId = numero(req.params.id);
  const { descripcion, fecha } = req.body ?? {};
  if (!clienteId) return res.status(400).json({ error: "Identificador inválido" });
  if (!Clientes.obtener(clienteId)) return res.status(404).json({ error: "Cliente no encontrado" });
  if (typeof descripcion !== "string" || !descripcion.trim()) return res.status(400).json({ error: "La descripción es obligatoria" });
  return res.status(201).json(Actividades.crear(clienteId, descripcion.trim(), fecha));
};

export const actualizarActividad = (req: Request, res: Response) => {
  const clienteId = numero(req.params.id), actividadId = numero(req.params.actividadId);
  const { descripcion, fecha } = req.body ?? {};
  if (!clienteId || !actividadId) return res.status(400).json({ error: "Identificador inválido" });
  if (typeof descripcion !== "string" || !descripcion.trim()) return res.status(400).json({ error: "La descripción es obligatoria" });
  const actividad = Actividades.actualizar(actividadId, clienteId, descripcion.trim(), fecha);
  return actividad ? res.json(actividad) : res.status(404).json({ error: "Actividad editable no encontrada" });
};

export const completarActividad = (req: Request, res: Response) => {
  const clienteId = numero(req.params.id), actividadId = numero(req.params.actividadId);
  if (!clienteId || !actividadId) return res.status(400).json({ error: "Identificador inválido" });
  const actividad = Actividades.completar(actividadId, clienteId);
  return actividad ? res.json(actividad) : res.status(404).json({ error: "Actividad pendiente no encontrada" });
};

export const eliminarActividad = (req: Request, res: Response) => {
  const clienteId = numero(req.params.id), actividadId = numero(req.params.actividadId);
  if (!clienteId || !actividadId) return res.status(400).json({ error: "Identificador inválido" });
  return Actividades.eliminar(actividadId, clienteId) ? res.status(204).end() : res.status(404).json({ error: "Actividad pendiente no encontrada" });
};
