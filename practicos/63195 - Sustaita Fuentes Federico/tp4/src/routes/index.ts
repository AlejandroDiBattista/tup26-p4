import { Router } from 'express';
import clientes from './clientes.routes';
import actividades from './actividades.routes';

const router = Router();

router.use('/clientes', clientes);
router.use('/actividades', actividades);

export default router;
