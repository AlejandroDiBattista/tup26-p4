import { Router } from 'express';
import { ClientesController as C } from '../controllers/clientes.js';
import { actividadesRouter } from './actividades.js';

export const clientesRouter = Router();

clientesRouter.get('/', C.listar);
clientesRouter.post('/', C.crear);
clientesRouter.get('/:id', C.obtener);
clientesRouter.put('/:id', C.actualizar);
clientesRouter.delete('/:id', C.eliminar);
clientesRouter.use('/:clienteId/actividades', actividadesRouter);
