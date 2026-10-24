import { Router } from 'express'
import * as c from '../controladores/clientes.js'

export const router = Router()

router.get('/', c.listar)
router.post('/', c.crear)
router.get('/:id', c.obtener)
router.put('/:id', c.actualizar)
router.delete('/:id', c.eliminar)

router.get('/:clienteId/actividades', c.listarActividades)
router.post('/:clienteId/actividades', c.crearActividad)
router.put('/:clienteId/actividades/:id', c.actualizarActividad)
router.post('/:clienteId/actividades/:id/completar', c.completarActividad)
router.delete('/:clienteId/actividades/:id', c.eliminarActividad)
