import { Router } from 'express'
import { ClienteController } from '../controllers/clientes'

const router = Router()

router.get('/buscar', ClienteController.buscar)
router.get('/', ClienteController.obtenerTodos)
router.get('/:id', ClienteController.obtenerPorId)
router.post('/', ClienteController.crear)
router.put('/:id', ClienteController.actualizar)
router.delete('/:id', ClienteController.eliminar)

export default router
