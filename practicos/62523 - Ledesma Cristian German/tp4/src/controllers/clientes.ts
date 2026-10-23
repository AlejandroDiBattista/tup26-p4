import type { NextFunction, Request, Response } from 'express';
import { Clientes } from '../services/clientes.js';

function idDesdeParametros(req: Request): number {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new Error('El id no es válido.');
  return id;
}

function datosDeCliente(body: Record<string, unknown>) {
  return {
    nombre: String(body.nombre ?? '').trim(),
    email: String(body.email ?? '').trim(),
    telefono: String(body.telefono ?? '').trim(),
    direccion: String(body.direccion ?? '').trim(),
  };
}

function validarCliente(datos: ReturnType<typeof datosDeCliente>) {
  if (Object.values(datos).some(valor => !valor)) {
    throw new Error('Nombre, email, teléfono y dirección son obligatorios.');
  }
}

export function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const buscar = typeof req.query.buscar === 'string' ? req.query.buscar : '';
    res.json(Clientes.listar(buscar));
  } catch (error) {
    next(error);
  }
}

export function obtener(req: Request, res: Response, next: NextFunction) {
  try {
    const id = idDesdeParametros(req);
    const cliente = Clientes.obtener(id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado.' });

    res.json({
      ...cliente,
      actividades: Clientes.listarActividades(id),
    });
  } catch (error) {
    next(error);
  }
}

export function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const datos = datosDeCliente(req.body);
    validarCliente(datos);
    res.status(201).json(Clientes.crear(datos));
  } catch (error) {
    next(error);
  }
}

export function actualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = idDesdeParametros(req);
    const datos = datosDeCliente(req.body);
    validarCliente(datos);
    const cliente = Clientes.actualizar(id, datos);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado.' });

    res.json(cliente);
  } catch (error) {
    next(error);
  }
}

export function eliminar(req: Request, res: Response, next: NextFunction) {
  try {
    const eliminado = Clientes.eliminar(idDesdeParametros(req));
    if (!eliminado) return res.status(404).json({ error: 'Cliente no encontrado.' });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
