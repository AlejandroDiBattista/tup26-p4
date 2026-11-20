import { Router } from 'express';
import * as controlador from '../controllers/clientes.controller.ts';

export const rutasClientes = Router();

rutasClientes.get('/', controlador.listar);
rutasClientes.get('/:id', controlador.obtener);
rutasClientes.post('/', controlador.crear);
rutasClientes.put('/:id', controlador.actualizar);
rutasClientes.delete('/:id', controlador.eliminar);
rutasClientes.post('/:id/actividades', controlador.agregarActividad);