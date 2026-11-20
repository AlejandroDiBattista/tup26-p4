import { Router } from 'express';

import {
  crearActividad,
  crearCliente,
  completarActividad,
  actualizarActividad,
  actualizarCliente,
  eliminarActividad,
  eliminarCliente,
  listarClientes,
  obtenerCliente
} from '../controllers/clientes.controller.js';

const router = Router();

router.get('/clientes', listarClientes);
router.get('/clientes/:id', obtenerCliente);
router.post('/clientes', crearCliente);
router.put('/clientes/:id', actualizarCliente);
router.delete('/clientes/:id', eliminarCliente);

router.post('/clientes/:clienteId/actividades', crearActividad);
router.put('/actividades/:id', actualizarActividad);
router.patch('/actividades/:id/completar', completarActividad);
router.delete('/actividades/:id', eliminarActividad);

export default router;
