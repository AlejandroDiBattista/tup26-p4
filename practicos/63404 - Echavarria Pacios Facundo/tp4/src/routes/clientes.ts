import { Router } from 'express';
import * as controller from '../controllers/clientes.js';

export const router = Router();
router.get('/', controller.listar);
router.post('/', controller.crear);
router.get('/:id', controller.obtener);
router.put('/:id', controller.editar);
router.delete('/:id', controller.eliminar);
router.post('/:id/actividades', controller.agregarActividad);
router.put('/:id/actividades/:actividadId', controller.editarActividad);
router.patch('/:id/actividades/:actividadId/completar', controller.completarActividad);
router.delete('/:id/actividades/:actividadId', controller.eliminarActividad);
