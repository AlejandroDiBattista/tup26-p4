import { Router } from 'express';
import { ClientesController } from '../controllers/clientes.controller';

const router = Router();

router.get('/', ClientesController.listar);
router.get('/:id', ClientesController.obtener);
router.post('/', ClientesController.crear);
router.put('/:id', ClientesController.actualizar);
router.delete('/:id', ClientesController.eliminar);

export default router;
