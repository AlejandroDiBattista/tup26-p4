import type { Request, Response } from 'express';
import { Clientes } from './clientes.servicio.ts';

export async function buscar(req: Request, res: Response) {
  const texto = typeof req.query.buscar === 'string' ? req.query.buscar : '';
  const clientes = await Clientes.buscar(texto);
  res.json(clientes);
}

export async function agregarActividad(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const actividad = await Clientes.agregarActividad(id, req.body);
    res.status(201).json(actividad);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    res.status(400).json({ message: mensaje });
  }
}

export async function listarActividades(req: Request, res: Response) {
  const id = Number(req.params.id);
  const actividades = await Clientes.actividades(id);
  res.json(actividades);
}

export async function eliminar(req: Request, res: Response) {
  const id = Number(req.params.id);
  const eliminado = await Clientes.eliminar(id);

  if (!eliminado) {
    res.status(404).json({ message: 'Cliente no encontrado' });
    return;
  }

  res.status(204).end();
}

export async function obtener(req: Request, res: Response) {
  const id = Number(req.params.id);
  const cliente = await Clientes.obtener(id);

  if (cliente === undefined) {
    res.status(404).json({ message: 'Cliente no encontrado' });
    return;
  }

  res.json(cliente);
}

export async function crear(req: Request, res: Response) {
  try {
    const cliente = await Clientes.crear(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    res.status(400).json({ message: mensaje });
  }
}
