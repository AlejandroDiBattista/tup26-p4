import type { Request, Response } from 'express';
import { Clientes } from '../repositorios/clientes.js';

function numero(valor: string | string[]) {
  if (Array.isArray(valor)) return null;
  const resultado = Number(valor);
  return Number.isInteger(resultado) && resultado > 0 ? resultado : null;
}

function responderError(res: Response, error: unknown) {
  const mensaje = error instanceof Error ? error.message : 'Error interno.';
  const estado = /obligatorio|teléfono/i.test(mensaje) ? 400 : 500;
  res.status(estado).json({ error: mensaje });
}

export async function listarClientes(_req: Request, res: Response) {
  try { res.json(await Clientes.listar()); }
  catch (error) { responderError(res, error); }
}

export async function buscarClientes(req: Request, res: Response) {
  try { res.json(await Clientes.buscar(String(req.query.texto ?? ''))); }
  catch (error) { responderError(res, error); }
}

export async function obtenerCliente(req: Request, res: Response) {
  const id = numero(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un entero positivo.' });
  try {
    const cliente = await Clientes.obtener(id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json(cliente);
  } catch (error) { responderError(res, error); }
}

export async function crearCliente(req: Request, res: Response) {
  try { res.status(201).json(await Clientes.crear(req.body)); }
  catch (error) { responderError(res, error); }
}

export async function actualizarCliente(req: Request, res: Response) {
  const id = numero(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un entero positivo.' });
  try {
    const cliente = await Clientes.actualizar(id, req.body);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json(cliente);
  } catch (error) { responderError(res, error); }
}

export async function eliminarCliente(req: Request, res: Response) {
  const id = numero(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un entero positivo.' });
  try {
    if (!await Clientes.eliminar(id)) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.status(204).end();
  } catch (error) { responderError(res, error); }
}

function idsActividad(req: Request) {
  const clienteId = numero(req.params.clienteId);
  const actividadId = numero(req.params.actividadId);
  return clienteId && actividadId ? { clienteId, actividadId } : null;
}

export async function listarActividades(req: Request, res: Response) {
  const clienteId = numero(req.params.clienteId);
  if (!clienteId) return res.status(400).json({ error: 'El clienteId debe ser un entero positivo.' });
  try {
    if (!await Clientes.obtener(clienteId)) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json(await Clientes.listarActividades(clienteId));
  } catch (error) { responderError(res, error); }
}

export async function listarActividadesPendientes(req: Request, res: Response) {
  const clienteId = numero(req.params.clienteId);
  if (!clienteId) return res.status(400).json({ error: 'El clienteId debe ser un entero positivo.' });
  try {
    if (!await Clientes.obtener(clienteId)) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json(await Clientes.listarActividadesPendientes(clienteId));
  } catch (error) { responderError(res, error); }
}

export async function listarActividadesVencidas(req: Request, res: Response) {
  const clienteId = numero(req.params.clienteId);
  if (!clienteId) return res.status(400).json({ error: 'El clienteId debe ser un entero positivo.' });
  try {
    if (!await Clientes.obtener(clienteId)) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json(await Clientes.listarActividadesVencidas(clienteId));
  } catch (error) { responderError(res, error); }
}

export async function listarActividadesSinCompromiso(req: Request, res: Response) {
  const clienteId = numero(req.params.clienteId);
  if (!clienteId) return res.status(400).json({ error: 'El clienteId debe ser un entero positivo.' });
  try {
    if (!await Clientes.obtener(clienteId)) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json(await Clientes.listarActividadesSinCompromiso(clienteId));
  } catch (error) { responderError(res, error); }
}

export async function obtenerActividad(req: Request, res: Response) {
  const ids = idsActividad(req);
  if (!ids) return res.status(400).json({ error: 'Los ids deben ser enteros positivos.' });
  try {
    const actividad = await Clientes.obtenerActividad(ids.clienteId, ids.actividadId);
    if (!actividad) return res.status(404).json({ error: 'Actividad o cliente no encontrado.' });
    res.json(actividad);
  } catch (error) { responderError(res, error); }
}

export async function crearActividad(req: Request, res: Response) {
  const clienteId = numero(req.params.clienteId);
  if (!clienteId) return res.status(400).json({ error: 'El clienteId debe ser un entero positivo.' });
  try {
    if (!await Clientes.obtener(clienteId)) return res.status(404).json({ error: 'Cliente no encontrado.' });
    const { clienteId: _clienteId, ...datos } = req.body;
    res.status(201).json(await Clientes.crearActividad(clienteId, datos));
  } catch (error) { responderError(res, error); }
}

export async function actualizarActividad(req: Request, res: Response) {
  const ids = idsActividad(req);
  if (!ids) return res.status(400).json({ error: 'Los ids deben ser enteros positivos.' });
  try {
    const { clienteId: _clienteId, ...datos } = req.body;
    const actividad = await Clientes.actualizarActividad(ids.clienteId, ids.actividadId, datos);
    if (!actividad) return res.status(404).json({ error: 'Actividad o cliente no encontrado.' });
    res.json(actividad);
  } catch (error) { responderError(res, error); }
}

export async function completarActividad(req: Request, res: Response) {
  const ids = idsActividad(req);
  if (!ids) return res.status(400).json({ error: 'Los ids deben ser enteros positivos.' });
  try {
    const actividad = await Clientes.completarActividad(ids.clienteId, ids.actividadId);
    if (!actividad) return res.status(404).json({ error: 'Actividad o cliente no encontrado.' });
    res.json(actividad);
  } catch (error) { responderError(res, error); }
}

export async function eliminarActividad(req: Request, res: Response) {
  const ids = idsActividad(req);
  if (!ids) return res.status(400).json({ error: 'Los ids deben ser enteros positivos.' });
  try {
    if (!await Clientes.eliminarActividad(ids.clienteId, ids.actividadId)) {
      return res.status(404).json({ error: 'Actividad o cliente no encontrado.' });
    }
    res.status(204).end();
  } catch (error) { responderError(res, error); }
}
