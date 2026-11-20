import {Router} from 'express';
import * as c from '../controllers/clientes.js';
export const router=Router();
router.get('/',c.listar); router.post('/',c.crear);
router.get('/:clienteId',c.obtener); router.put('/:clienteId',c.editar); router.delete('/:clienteId',c.eliminar);
router.post('/:clienteId/actividades',c.crearActividad);
router.put('/:clienteId/actividades/:actividadId',c.editarActividad);
router.delete('/:clienteId/actividades/:actividadId',c.eliminarActividad);
router.patch('/:clienteId/actividades/:actividadId/completar',c.completarActividad);
