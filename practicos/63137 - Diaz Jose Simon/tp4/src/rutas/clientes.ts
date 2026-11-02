import { Router } from 'express';
import * as clientes from '../controladores/clientes.ts';
import * as actividades from '../controladores/actividades.ts';

export const rutasDeClientes = Router();

rutasDeClientes.get('/', clientes.listar);
rutasDeClientes.get('/:id', clientes.obtener);
rutasDeClientes.post('/', clientes.crear);
rutasDeClientes.put('/:id', clientes.actualizar);
rutasDeClientes.delete('/:id', clientes.eliminar);
rutasDeClientes.post('/:id/actividades', actividades.crear);
