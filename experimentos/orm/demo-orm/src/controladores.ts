import type { Request, Response } from 'express';
import { z } from 'zod';
import { Clientes } from './clientes.js';
import { filtroActividad } from './validacion.js';

const parametroId = z.coerce.number().int().positive();
const clienteId = (req: Request) => parametroId.parse(req.params.clienteId);
const actividadId = (req: Request) => parametroId.parse(req.params.actividadId);

export const controladores = {
  async listar(req: Request, res: Response) {
    if (req.query.email !== undefined) {
      const cliente = await Clientes.buscarPorEmail(z.string().parse(req.query.email));
      res.json(cliente ? [cliente] : []);
    } else {
      res.json(await Clientes.buscar(z.string().parse(req.query.texto ?? '')));
    }
  },
  async obtener(req: Request, res: Response) { res.json(await Clientes.obtener(clienteId(req))); },
  async crear(req: Request, res: Response) {
    const cliente = await Clientes.crear(req.body);
    res.location(`/api/clientes/${cliente.id}`).status(201).json(cliente);
  },
  async actualizar(req: Request, res: Response) { res.json(await Clientes.actualizar(clienteId(req), req.body)); },
  async eliminar(req: Request, res: Response) {
    await Clientes.eliminar(clienteId(req));
    res.status(204).end();
  },
  async listarActividades(req: Request, res: Response) {
    res.json(await Clientes.listarActividades(clienteId(req), filtroActividad.parse(req.query.filtro ?? 'todas')));
  },
  async obtenerActividad(req: Request, res: Response) { res.json(await Clientes.obtenerActividad(clienteId(req), actividadId(req))); },
  async crearActividad(req: Request, res: Response) {
    const actividad = await Clientes.crearActividad(clienteId(req), req.body);
    res.location(`/api/clientes/${actividad.clienteId}/actividades/${actividad.id}`).status(201).json(actividad);
  },
  async actualizarActividad(req: Request, res: Response) { res.json(await Clientes.actualizarActividad(clienteId(req), actividadId(req), req.body)); },
  async eliminarActividad(req: Request, res: Response) {
    await Clientes.eliminarActividad(clienteId(req), actividadId(req));
    res.status(204).end();
  },
  async completarActividad(req: Request, res: Response) { res.json(await Clientes.completarActividad(clienteId(req), actividadId(req))); },
};
