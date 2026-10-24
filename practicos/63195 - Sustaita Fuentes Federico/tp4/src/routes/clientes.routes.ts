import { Router } from 'express';
import * as clientes from '../controllers/clientes.controller';
import * as actividades from '../controllers/actividades.controller';
import { validarId } from '../middlewares/parametros';

const router = Router();

router.param('id', validarId);

router.route('/')
  .get(clientes.listar)
  .post(clientes.crear);

router.route('/:id')
  .get(clientes.obtener)
  .put(clientes.actualizar)
  .delete(clientes.eliminar);

router.post('/:id/actividades', actividades.crear);

export default router;
