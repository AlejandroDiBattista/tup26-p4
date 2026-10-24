import { Router } from 'express'
import * as controlador from '../controllers/clientes.controller.js'

export const rutasClientes = Router()

rutasClientes.get('/', controlador.listar)
rutasClientes.post('/', controlador.crear)
rutasClientes.get('/:id', controlador.obtener)
rutasClientes.put('/:id', controlador.actualizar)
rutasClientes.delete('/:id', controlador.eliminar)

rutasClientes.get('/:id/actividades', controlador.listarActividades)
rutasClientes.post('/:id/actividades', controlador.crearActividad)
