import {Router} from 'express';
import{
    getClientes,
    getClienteId,
    postCliente,
    putCliente,
    deleteCliente
} from '../controllers/clientes.controller.js';

import{
    getActividades,
    postActividad
} from '../controllers/actividades.controller.js';

const router= Router();

//rutas de clientes
//get
router.get('/',getClientes);
//get por id
router.get('/:id',getClienteId);
//post
router.post('/',postCliente);
//put
router.put('/:id', postCliente);
//delete
router.delete('/:id',deleteCliente);

//rutas de actividades de un cliente

//get
router.get('/:id/actividades',getActividades);
//post
router.post('/:id/actividades',postActividad);

export default router;