import { Router } from 'express';
import * as ClientesController from './clientes.controller.js';

const router = Router();

// CRUD Clientes y búsqueda flexible
router.get('/', ClientesController.listar);
router.post('/', ClientesController.crear);
router.get('/:id', ClientesController.obtenerPorId);
router.put('/:id', ClientesController.actualizar);
router.delete('/:id', ClientesController.eliminar);

// Actividades del Cliente
router.post('/:id/actividades', ClientesController.agregarActividad);
router.put('/:id/actividades/:actId', ClientesController.actualizarActividad);
router.patch('/:id/actividades/:actId/completar', ClientesController.completarActividad);
router.delete('/:id/actividades/:actId', ClientesController.eliminarActividad);

export default router;
