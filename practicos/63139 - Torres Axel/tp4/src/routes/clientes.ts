import { Router } from 'express';
import * as controller from '../controllers/clientes.js';

export const clientesRouter = Router();
clientesRouter.get('/', controller.listar);
clientesRouter.post('/', controller.crear);
clientesRouter.get('/:clienteId', controller.obtener);
clientesRouter.put('/:clienteId', controller.actualizar);
clientesRouter.patch('/:clienteId', controller.actualizar);
clientesRouter.delete('/:clienteId', controller.eliminar);
clientesRouter.get('/:clienteId/actividades', controller.listarActividades);
clientesRouter.post('/:clienteId/actividades', controller.agregarActividad);
clientesRouter.get('/:clienteId/actividades/:actividadId', controller.obtenerActividad);
clientesRouter.put('/:clienteId/actividades/:actividadId', controller.actualizarActividad);
clientesRouter.patch('/:clienteId/actividades/:actividadId', controller.actualizarActividad);
clientesRouter.patch('/:clienteId/actividades/:actividadId/completar', controller.completarActividad);
clientesRouter.delete('/:clienteId/actividades/:actividadId', controller.eliminarActividad);
