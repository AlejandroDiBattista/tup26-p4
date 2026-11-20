import { Router } from 'express'
import * as actividades from '../controllers/actividades.controller'

export const actividadesRouter = Router()

actividadesRouter.put('/:id', actividades.actualizar)
actividadesRouter.patch('/:id/completar', actividades.completar)
actividadesRouter.delete('/:id', actividades.eliminar)
