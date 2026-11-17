// Ejecutar desde apuntes/llm: node demo/R7.js
import { pedir } from './llm.js'

console.log('\nR7 · Reducir: Extraer tareas de una minuta')
console.log('='.repeat(60))

const instruccion = `Vas a recibir la minuta de una reunión.
Devolvé un JSON con una lista "tareas"; cada tarea tiene responsable, descripcion y fecha.
Incluí solo los compromisos explícitos. Si no hay fecha, poné null.`

const datos = `Minuta de la reunión del 16/11/2026.
Mariana pidió mejorar el embalaje de los martillos. Se conversó sobre agregar productos al catálogo.
Pablo se comprometió a enviar el catálogo actualizado el 18/11/2026.
Carla confirmó que llamará al transporte el 17/11/2026 para consultar los horarios.
Sergio se comprometió a revisar las cajas antes del próximo despacho, sin fijar fecha.
La posibilidad de abrir una sucursal quedó como idea, sin responsables ni compromisos.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const texto = await pedir(instruccion, datos, {
  response_format: { type: 'json_object' },
})
const resultado = JSON.parse(texto)

console.log('\nRESULTADO\n')
console.log(JSON.stringify(resultado, null, 2))
