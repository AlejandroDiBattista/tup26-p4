import { Router } from 'express';
import * as clientes from '../controllers/clientes.controller';
import actividadesRouter from './actividades.routes';

const router = Router();

router.get('/', clientes.listar);
router.post('/', clientes.crear);
router.get('/:id', clientes.obtener);
router.put('/:id', clientes.actualizar);
router.delete('/:id', clientes.eliminar);

router.use('/:clienteId/actividades', actividadesRouter);

export default router;
