import { Router } from 'express';
import { ActividadesController } from '../controllers/actividades.controller';

const router = Router();

// Operaciones individuales sobre actividades
router.put('/:id', ActividadesController.actualizar);
router.patch('/:id/completar', ActividadesController.completar);
router.delete('/:id', ActividadesController.eliminar);

export default router;
