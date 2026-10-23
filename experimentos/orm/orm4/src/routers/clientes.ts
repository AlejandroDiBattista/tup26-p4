import { Router } from 'express';
import { ClientesHandler } from '../handlers/clientes.js';

export const clientesRouter = Router();

clientesRouter.get('/', ClientesHandler.listar);
clientesRouter.get('/:id', ClientesHandler.obtener);
clientesRouter.post('/', ClientesHandler.crear);
clientesRouter.put('/:id', ClientesHandler.actualizar);
clientesRouter.delete('/:id', ClientesHandler.eliminar);
