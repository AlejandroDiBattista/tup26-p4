import { Router } from 'express';
import { ClientesControlador } from '../controladores/clientes.controlador.js';

export const clientesRouter = Router();

clientesRouter.get('/', ClientesControlador.listar);
clientesRouter.get('/:id', ClientesControlador.obtenerPorId);
clientesRouter.post('/', ClientesControlador.crear);
clientesRouter.put('/:id', ClientesControlador.actualizar);
clientesRouter.delete('/:id', ClientesControlador.eliminar);

clientesRouter.post('/:id/actividades', ClientesControlador.agregarActividad);
clientesRouter.put('/:id/actividades/:actividadId', ClientesControlador.actualizarActividad);
clientesRouter.patch(
  '/:id/actividades/:actividadId/completar',
  ClientesControlador.completarActividad
);
clientesRouter.delete('/:id/actividades/:actividadId', ClientesControlador.eliminarActividad);
