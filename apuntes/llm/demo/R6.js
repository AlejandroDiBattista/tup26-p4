// Ejecutar desde apuntes/llm: node demo/R6.js
import { pedir } from './llm.js'

console.log('\nR6 · Reducir: Detectar urgencia')
console.log('='.repeat(60))

const instruccion = `Indicá la urgencia del mensaje: alta, media o baja.
Es alta si menciona un plazo de hoy o mañana, o una amenaza de cancelar.
Respondé únicamente con la palabra.`

const datos = `Si mañana a las 10 no recibo las veinte cajas, voy a cancelar el pedido completo. Por favor, confirmen hoy si llegan a tiempo.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const resultado = await pedir(instruccion, datos)

console.log('\nRESULTADO\n')
console.log(resultado)
