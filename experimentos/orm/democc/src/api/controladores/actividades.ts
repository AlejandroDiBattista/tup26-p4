import type { Request, Response } from 'express';
import { Clientes, type FiltroActividades } from '../../servicios/clientes';
import { leerCuerpo, leerId } from '../peticion';

/** GET /api/clientes/:clienteId/actividades?estado=todas|pendientes|vencidas|sin-compromiso */
export async function listar(req: Request, res: Response) {
  const estado = (req.query.estado ?? 'todas') as FiltroActividades;
  res.json(await Clientes.listarActividades(leerId(req, 'clienteId'), estado));
}

export async function obtener(req: Request, res: Response) {
  res.json(await Clientes.obtenerActividad(leerId(req, 'clienteId'), leerId(req, 'actividadId')));
}

export async function crear(req: Request, res: Response) {
  const clienteId = leerId(req, 'clienteId');
  const actividad = await Clientes.agregarActividad(clienteId, leerCuerpo(req));
  res.status(201).location(`/api/clientes/${clienteId}/actividades/${actividad.id}`).json(actividad);
}

export async function actualizar(req: Request, res: Response) {
  const actividad = await Clientes.actualizarActividad(
    leerId(req, 'clienteId'),
    leerId(req, 'actividadId'),
    leerCuerpo(req),
  );
  res.json(actividad);
}

export async function eliminar(req: Request, res: Response) {
  await Clientes.eliminarActividad(leerId(req, 'clienteId'), leerId(req, 'actividadId'));
  res.status(204).end();
}

export async function completar(req: Request, res: Response) {
  res.json(await Clientes.completarActividad(leerId(req, 'clienteId'), leerId(req, 'actividadId')));
}
