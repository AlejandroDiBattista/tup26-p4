import { Router } from 'express';
import * as clientes from '../controladores/clientes';
import { rutasActividades } from './actividades';

export const rutasClientes = Router();

rutasClientes.get('/', clientes.listar);
rutasClientes.post('/', clientes.crear);
rutasClientes.get('/:clienteId', clientes.obtener);
rutasClientes.patch('/:clienteId', clientes.actualizar);
rutasClientes.delete('/:clienteId', clientes.eliminar);
rutasClientes.use('/:clienteId/actividades', rutasActividades);
