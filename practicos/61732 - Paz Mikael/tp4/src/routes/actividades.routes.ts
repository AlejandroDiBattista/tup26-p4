import { Router } from 'express'
import { ActividadesController } from '../controllers/actividades.controller.js'

export const actividadesRouter = Router()

actividadesRouter.put('/:id', ActividadesController.actualizar)
actividadesRouter.put('/:id/completar', ActividadesController.completar)
actividadesRouter.delete('/:id', ActividadesController.eliminar)
