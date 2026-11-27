import {Router} from 'express'
import * as controles from './controladores.js'
export const rutas=Router()
rutas.route('/').get(controles.listar).post(controles.agregar)
rutas.route('/:id').get(controles.ver).put(controles.editar).delete(controles.borrar)
rutas.post('/:id/actividades',controles.actividad)
rutas.route('/:id/actividades/:numero').put(controles.cambiar('editar')).delete(controles.cambiar('borrar'))
rutas.patch('/:id/actividades/:numero/completar',controles.cambiar('completar'))