import { Router } from 'express';
import { ClientesController } from '../controllers/clientes.controller';

const router = Router();

// Búsqueda flexible (debe ir antes de :id para no colisionar)
router.get('/buscar', ClientesController.buscar);

// CRUD de clientes
router.get('/', ClientesController.listar);
router.get('/:id', ClientesController.obtenerPorId);
router.post('/', ClientesController.crear);
router.put('/:id', ClientesController.actualizar);
router.delete('/:id', ClientesController.eliminar);

// Subrecurso de actividades para un cliente
router.get('/:id/actividades', ClientesController.listarActividades);
router.post('/:id/actividades', ClientesController.agregarActividad);

export default router;
