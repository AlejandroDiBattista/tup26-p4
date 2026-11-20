import { Router } from 'express';
import * as actividades from '../controllers/actividades.js';
import * as controlador from '../controllers/clientes.js';

export const clientesRouter = Router();

clientesRouter.get('/', controlador.listar);
clientesRouter.get('/:id', controlador.obtener);
clientesRouter.post('/', controlador.crear);
clientesRouter.put('/:id', controlador.actualizar);
clientesRouter.delete('/:id', controlador.eliminar);
clientesRouter.post('/:clienteId/actividades', actividades.crear);
