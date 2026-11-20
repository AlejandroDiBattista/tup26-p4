import { Router } from 'express';
import * as actividades from '../controllers/actividades.controller';

// mergeParams permite leer :clienteId definido en el router padre
const router = Router({ mergeParams: true });

router.get('/', actividades.listar);
router.post('/', actividades.crear);
router.put('/:id', actividades.actualizar);
router.post('/:id/completar', actividades.completar);
router.delete('/:id', actividades.eliminar);

export default router;
