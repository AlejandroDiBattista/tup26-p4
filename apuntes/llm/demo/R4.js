// Ejecutar desde apuntes/llm: node demo/R4.js
import { pedir } from './llm.js'

console.log('\nR4 · Reducir: Extraer los ítems de un pedido')
console.log('='.repeat(60))

const instruccion = `Vas a recibir un pedido escrito por un cliente.
Devolvé un JSON con una lista "items"; cada ítem tiene producto y cantidad.
Si no se indica la cantidad de un producto, poné null en cantidad.`

const datos = `Hola, necesito 12 martillos carpinteros de 500 g, 30 rollos de cinta aisladora y lámparas LED de 12 W. Gracias.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const texto = await pedir(instruccion, datos, {
  response_format: { type: 'json_object' },
})
const resultado = JSON.parse(texto)

console.log('\nRESULTADO\n')
console.log(JSON.stringify(resultado, null, 2))
