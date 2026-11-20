import { Router } from 'express';
import { rutasClientes } from './clientes.routes.ts';
import { rutasActividades } from './actividades.routes.ts';

export const api = Router();

api.use('/clientes', rutasClientes);
api.use('/actividades', rutasActividades);