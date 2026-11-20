import type { Request, Response } from 'express';
import { Clientes } from './clientes.service.js';

export async function listar(req: Request, res: Response): Promise<void> {
  try {
    const q =
      typeof req.query.q === 'string'
        ? req.query.q
        : typeof req.query.buscar === 'string'
        ? req.query.buscar
        : undefined;

    const lista = await Clientes.listar(q);
    res.json(lista);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al listar clientes';
    res.status(500).json({ error: mensaje });
  }
}

export async function obtenerPorId(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'ID de cliente inválido' });
    return;
  }

  try {
    const cliente = await Clientes.obtenerPorId(id);
    if (!cliente) {
      res.status(404).json({ error: `Cliente con id ${id} no encontrado` });
      return;
    }
    res.json(cliente);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al obtener cliente';
    res.status(500).json({ error: mensaje });
  }
}

export async function crear(req: Request, res: Response): Promise<void> {
  try {
    const nuevo = await Clientes.crear(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al crear cliente';
    res.status(400).json({ error: mensaje });
  }
}

export async function actualizar(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'ID de cliente inválido' });
    return;
  }

  try {
    const actualizado = await Clientes.actualizar(id, req.body);
    res.json(actualizado);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al actualizar cliente';
    const status = mensaje.includes('no encontrado') ? 404 : 400;
    res.status(status).json({ error: mensaje });
  }
}

export async function eliminar(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'ID de cliente inválido' });
    return;
  }

  try {
    await Clientes.eliminar(id);
    res.status(204).send();
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al eliminar cliente';
    const status = mensaje.includes('no encontrado') ? 404 : 400;
    res.status(status).json({ error: mensaje });
  }
}

export async function agregarActividad(req: Request, res: Response): Promise<void> {
  const clienteId = Number(req.params.id);
  if (Number.isNaN(clienteId)) {
    res.status(400).json({ error: 'ID de cliente inválido' });
    return;
  }

  try {
    const actividad = await Clientes.agregarActividad(clienteId, req.body);
    res.status(201).json(actividad);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al agregar actividad';
    const status = mensaje.includes('no encontrado') ? 404 : 400;
    res.status(status).json({ error: mensaje });
  }
}

export async function actualizarActividad(req: Request, res: Response): Promise<void> {
  const clienteId = Number(req.params.id);
  const actividadId = Number(req.params.actId);

  if (Number.isNaN(clienteId) || Number.isNaN(actividadId)) {
    res.status(400).json({ error: 'IDs inválidos' });
    return;
  }

  try {
    const actualizada = await Clientes.actualizarActividad(clienteId, actividadId, req.body);
    res.json(actualizada);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al actualizar actividad';
    const status = mensaje.includes('no encontrada') ? 404 : 400;
    res.status(status).json({ error: mensaje });
  }
}

export async function completarActividad(req: Request, res: Response): Promise<void> {
  const clienteId = Number(req.params.id);
  const actividadId = Number(req.params.actId);

  if (Number.isNaN(clienteId) || Number.isNaN(actividadId)) {
    res.status(400).json({ error: 'IDs inválidos' });
    return;
  }

  try {
    const completada = await Clientes.completarActividad(clienteId, actividadId);
    res.json(completada);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al completar actividad';
    const status = mensaje.includes('no encontrada') ? 404 : 400;
    res.status(status).json({ error: mensaje });
  }
}

export async function eliminarActividad(req: Request, res: Response): Promise<void> {
  const clienteId = Number(req.params.id);
  const actividadId = Number(req.params.actId);

  if (Number.isNaN(clienteId) || Number.isNaN(actividadId)) {
    res.status(400).json({ error: 'IDs inválidos' });
    return;
  }

  try {
    await Clientes.eliminarActividad(clienteId, actividadId);
    res.status(204).send();
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al eliminar actividad';
    const status = mensaje.includes('no encontrada') ? 404 : 400;
    res.status(status).json({ error: mensaje });
  }
}
