import { Router } from 'express'
import * as controlador from '../controllers/actividades.controller.js'

export const rutasActividades = Router()

rutasActividades.put('/:id', controlador.actualizar)
rutasActividades.patch('/:id/completar', controlador.completar)
rutasActividades.delete('/:id', controlador.eliminar)
