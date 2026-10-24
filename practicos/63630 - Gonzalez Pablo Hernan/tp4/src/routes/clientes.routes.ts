import { Router } from 'express';
import * as clientes from '../controllers/clientes.controller.ts';
import { actividadesRouter } from './actividades.routes.ts';

export const clientesRouter = Router();

clientesRouter.get('/', clientes.listar);
clientesRouter.post('/', clientes.crear);
clientesRouter.get('/:id', clientes.obtener);
clientesRouter.put('/:id', clientes.actualizar);
clientesRouter.delete('/:id', clientes.eliminar);
clientesRouter.use('/:id/actividades', actividadesRouter);
