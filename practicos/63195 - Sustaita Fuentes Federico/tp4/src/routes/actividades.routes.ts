import { Router } from 'express';
import * as actividades from '../controllers/actividades.controller';
import { validarId } from '../middlewares/parametros';

const router = Router();

router.param('id', validarId);

router.route('/:id')
  .put(actividades.editar)
  .delete(actividades.eliminar);

router.post('/:id/completar', actividades.completar);

export default router;
