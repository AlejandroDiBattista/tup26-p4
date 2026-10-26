import type { Request, Response } from "express";
import { Actividades, Clientes } from "../services/Clientes.js";

type Objeto = Record<string, unknown>;

const cuerpo = (valor: unknown): Objeto =>
  valor !== null && typeof valor === "object" && !Array.isArray(valor)
    ? valor as Objeto
    : {};

const numero = (valor: string) =>
  Number.isInteger(Number(valor)) && Number(valor) > 0 ? Number(valor) : null;

const fechaValida = (valor: unknown): valor is string | null | undefined => {
  if (valor === undefined || valor === null || valor === "") return true;
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.valueOf()) && fecha.toISOString().slice(0, 10) === valor;
};

const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const listarClientes = (req: Request, res: Response) => {
  res.json(Clientes.listar(String(req.query.q ?? "")));
};

export const obtenerCliente = (req: Request, res: Response) => {
  const id = numero(req.params.id);
  if (!id) return res.status(400).json({ error: "Identificador invalido" });
  const cliente = Clientes.obtener(id);
  return cliente ? res.json(cliente) : res.status(404).json({ error: "Cliente no encontrado" });
};

export const crearCliente = (req: Request, res: Response) => {
  const body = cuerpo(req.body);
  const { nombre, email, telefono = "", direccion = "" } = body;
  if (typeof nombre !== "string" || !nombre.trim() || typeof email !== "string" || !email.trim())
    return res.status(400).json({ error: "Nombre y email son obligatorios" });
  if (!emailValido(email.trim())) return res.status(400).json({ error: "El email no tiene un formato valido" });
  if (nombre.trim().length > 120 || email.trim().length > 180)
    return res.status(400).json({ error: "Nombre o email demasiado largo" });
  if (typeof telefono !== "string" || typeof direccion !== "string" || telefono.length > 40 || direccion.length > 180)
    return res.status(400).json({ error: "Telefono o direccion no validos" });
  return res.status(201).json(Clientes.crear({ nombre: nombre.trim(), email: email.trim(), telefono, direccion }));
};

export const actualizarCliente = (req: Request, res: Response) => {
  const id = numero(req.params.id);
  if (!id) return res.status(400).json({ error: "Identificador invalido" });
  const body = cuerpo(req.body);
  const { nombre, email, telefono = "", direccion = "" } = body;
  if (typeof nombre !== "string" || !nombre.trim() || typeof email !== "string" || !email.trim())
    return res.status(400).json({ error: "Nombre y email son obligatorios" });
  if (!emailValido(email.trim())) return res.status(400).json({ error: "El email no tiene un formato valido" });
  if (nombre.trim().length > 120 || email.trim().length > 180)
    return res.status(400).json({ error: "Nombre o email demasiado largo" });
  if (typeof telefono !== "string" || typeof direccion !== "string" || telefono.length > 40 || direccion.length > 180)
    return res.status(400).json({ error: "Telefono o direccion no validos" });
  const cliente = Clientes.actualizar(id, { nombre: nombre.trim(), email: email.trim(), telefono, direccion });
  return cliente ? res.json(cliente) : res.status(404).json({ error: "Cliente no encontrado" });
};

export const eliminarCliente = (req: Request, res: Response) => {
  const id = numero(req.params.id);
  if (!id) return res.status(400).json({ error: "Identificador invalido" });
  return Clientes.eliminar(id) ? res.status(204).end() : res.status(404).json({ error: "Cliente no encontrado" });
};

export const crearActividad = (req: Request, res: Response) => {
  const clienteId = numero(req.params.id);
  const { descripcion, fecha } = cuerpo(req.body);
  if (!clienteId) return res.status(400).json({ error: "Identificador invalido" });
  if (!Clientes.obtener(clienteId)) return res.status(404).json({ error: "Cliente no encontrado" });
  if (typeof descripcion !== "string" || !descripcion.trim())
    return res.status(400).json({ error: "La descripcion es obligatoria" });
  if (descripcion.trim().length > 240 || !fechaValida(fecha))
    return res.status(400).json({ error: "Descripcion o fecha no validas" });
  return res.status(201).json(Actividades.crear(clienteId, descripcion.trim(), fecha || undefined));
};

export const actualizarActividad = (req: Request, res: Response) => {
  const clienteId = numero(req.params.id), actividadId = numero(req.params.actividadId);
  const { descripcion, fecha } = cuerpo(req.body);
  if (!clienteId || !actividadId) return res.status(400).json({ error: "Identificador invalido" });
  if (typeof descripcion !== "string" || !descripcion.trim())
    return res.status(400).json({ error: "La descripcion es obligatoria" });
  if (descripcion.trim().length > 240 || !fechaValida(fecha))
    return res.status(400).json({ error: "Descripcion o fecha no validas" });
  const actividad = Actividades.actualizar(actividadId, clienteId, descripcion.trim(), fecha || undefined);
  return actividad ? res.json(actividad) : res.status(404).json({ error: "Actividad editable no encontrada" });
};

export const completarActividad = (req: Request, res: Response) => {
  const clienteId = numero(req.params.id), actividadId = numero(req.params.actividadId);
  if (!clienteId || !actividadId) return res.status(400).json({ error: "Identificador invalido" });
  const actividad = Actividades.completar(actividadId, clienteId);
  return actividad ? res.json(actividad) : res.status(404).json({ error: "Actividad pendiente no encontrada" });
};

export const eliminarActividad = (req: Request, res: Response) => {
  const clienteId = numero(req.params.id), actividadId = numero(req.params.actividadId);
  if (!clienteId || !actividadId) return res.status(400).json({ error: "Identificador invalido" });
  return Actividades.eliminar(actividadId, clienteId) ? res.status(204).end() : res.status(404).json({ error: "Actividad pendiente no encontrada" });
};
