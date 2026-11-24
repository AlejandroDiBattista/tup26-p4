import { Router } from 'express';
import * as clientes from '../controllers/clientes.js';
import * as actividades from '../controllers/actividades.js';

export const router = Router();

router.get('/clientes', clientes.listar);
router.post('/clientes', clientes.crear);
router.get('/clientes/:id', clientes.obtener);
router.patch('/clientes/:id', clientes.actualizar);
router.delete('/clientes/:id', clientes.eliminar);
router.get('/clientes/:id/actividades', actividades.listar);
router.post('/clientes/:id/actividades', actividades.crear);
router.patch('/actividades/:id', actividades.actualizar);
router.patch('/actividades/:id/completar', actividades.completar);
router.delete('/actividades/:id', actividades.eliminar);
