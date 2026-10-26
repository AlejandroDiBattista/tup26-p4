import type { Request, Response } from 'express';

import { Clientes } from '../services/clientes.service.js';

const parseId = (value: string | string[] | undefined) => {
  const normalized = Array.isArray(value) ? value[0] : value;
  if (normalized === undefined) return null;
  const asNumber = Number(normalized);
  return Number.isInteger(asNumber) ? asNumber : null;
};

const readQueryString = (value: unknown) => {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first : '';
  }
  return typeof value === 'string' ? value : '';
};

export const listarClientes = async (_req: Request, res: Response) => {
  try {
    const search = readQueryString(_req.query.search);
    const clientes = await Clientes.listarTodos(search);
    res.json(clientes);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al listar clientes';
    res.status(500).json({ error: message });
  }
};

export const obtenerCliente = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const cliente = await Clientes.obtenerPorId(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    return res.json(cliente);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener cliente';
    return res.status(500).json({ error: message });
  }
};

export const crearCliente = async (req: Request, res: Response) => {
  try {
    const cliente = await Clientes.crear(req.body ?? {});
    return res.status(201).json(cliente);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear cliente';
    return res.status(400).json({ error: message });
  }
};

export const actualizarCliente = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const cliente = await Clientes.actualizar(id, req.body ?? {});
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    return res.json(cliente);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar cliente';
    return res.status(400).json({ error: message });
  }
};

export const eliminarCliente = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const ok = await Clientes.eliminar(id);
    if (!ok) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    return res.json({ ok: true, message: 'Cliente eliminado.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar cliente';
    return res.status(400).json({ error: message });
  }
};

export const crearActividad = async (req: Request, res: Response) => {
  const clienteId = parseId(req.params.clienteId);
  if (clienteId === null) {
    return res.status(400).json({ error: 'ID de cliente inválido.' });
  }

  try {
    const actividad = await Clientes.crearActividad(clienteId, req.body ?? {});
    return res.status(201).json(actividad);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear actividad';
    return res.status(400).json({ error: message });
  }
};

export const actualizarActividad = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'ID de actividad inválido.' });
  }

  try {
    const actividad = await Clientes.actualizarActividad(id, req.body ?? {});
    if (!actividad) {
      return res.status(404).json({ error: 'Actividad no encontrada.' });
    }

    return res.json(actividad);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar actividad';
    return res.status(400).json({ error: message });
  }
};

export const completarActividad = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'ID de actividad inválido.' });
  }

  try {
    const actividad = await Clientes.completarActividad(id);
    if (!actividad) {
      return res.status(404).json({ error: 'Actividad no encontrada.' });
    }

    return res.json(actividad);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al completar actividad';
    return res.status(400).json({ error: message });
  }
};

export const eliminarActividad = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'ID de actividad inválido.' });
  }

  try {
    const ok = await Clientes.eliminarActividad(id);
    if (!ok) {
      return res.status(404).json({ error: 'Actividad no encontrada.' });
    }

    return res.json({ ok: true, message: 'Actividad eliminada.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar actividad';
    return res.status(400).json({ error: message });
  }
};
