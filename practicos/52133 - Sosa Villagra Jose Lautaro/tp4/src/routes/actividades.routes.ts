import { Router } from 'express';
import { ActividadesController } from '../controllers/actividades.controller';

const router = Router();

router.get('/', ActividadesController.listar);
router.post('/', ActividadesController.crear);
router.put('/:id', ActividadesController.actualizar);
router.patch('/:id/completar', ActividadesController.completar);
router.patch('/:id/reabrir', ActividadesController.reabrir);
router.delete('/:id', ActividadesController.eliminar);

export default router;
