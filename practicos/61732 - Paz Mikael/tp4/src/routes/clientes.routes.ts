import { Router } from 'express'
import { ClientesController } from '../controllers/clientes.controller.js'

export const clientesRouter = Router()

clientesRouter.get('/', ClientesController.listar)
clientesRouter.get('/:id', ClientesController.obtener)
clientesRouter.post('/', ClientesController.crear)
clientesRouter.put('/:id', ClientesController.actualizar)
clientesRouter.delete('/:id', ClientesController.eliminar)
clientesRouter.post('/:id/actividades', ClientesController.agregarActividad)
