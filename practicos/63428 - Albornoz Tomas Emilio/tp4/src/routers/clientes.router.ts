import { Router } from 'express'
import * as clientes from '../controllers/clientes.controller'
import * as actividades from '../controllers/actividades.controller'

export const clientesRouter = Router()

clientesRouter.get('/', clientes.listar)
clientesRouter.post('/', clientes.crear)
clientesRouter.get('/:id', clientes.obtener)
clientesRouter.put('/:id', clientes.actualizar)
clientesRouter.delete('/:id', clientes.eliminar)
clientesRouter.get('/:id/actividades', actividades.listarDeCliente)
clientesRouter.post('/:id/actividades', actividades.crearEnCliente)
