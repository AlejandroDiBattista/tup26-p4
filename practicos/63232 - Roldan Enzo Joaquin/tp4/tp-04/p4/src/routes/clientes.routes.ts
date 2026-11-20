import { Router } from 'express';
import type { BaseDatos } from '../db';
import {
  actualizarActividad,
  actualizarCliente,
  completarActividad,
  crearActividad,
  crearCliente,
  eliminarActividad,
  eliminarCliente,
  listarActividades,
  listarClientes,
  obtenerCliente,
} from '../controllers/clientes.controller';

export function crearRutasClientes(db: BaseDatos) {
  const router = Router();

  router.get('/', listarClientes(db));
  router.post('/', crearCliente(db));
  router.get('/:id', obtenerCliente(db));
  router.put('/:id', actualizarCliente(db));
  router.delete('/:id', eliminarCliente(db));
  router.get('/:id/actividades', listarActividades(db));
  router.post('/:id/actividades', crearActividad(db));
  router.put('/:id/actividades/:actividadId', actualizarActividad(db));
  router.patch('/:id/actividades/:actividadId/completar', completarActividad(db));
  router.delete('/:id/actividades/:actividadId', eliminarActividad(db));

  return router;
}
