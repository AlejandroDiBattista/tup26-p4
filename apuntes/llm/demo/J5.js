// Ejecutar desde apuntes/llm: node demo/J5.js
import { pedir } from './llm.js'

console.log('\nJ5 · Juzgar: Detectar datos faltantes en un pedido')
console.log('='.repeat(60))

const instruccion = `Un pedido completo indica producto, cantidad, dirección de entrega y fecha.
Indicá cuáles de esos datos faltan en el pedido recibido.
Devolvé un JSON con la lista "faltantes". Si no falta nada, la lista va vacía.`

const datos = `Hola, necesito 20 cajas de tornillos para entregar en Avenida Aconquija 1200, Yerba Buena. Avísenme cuando esté confirmado. Mariana.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const texto = await pedir(instruccion, datos, {
  response_format: { type: 'json_object' },
})
const resultado = JSON.parse(texto)

console.log('\nRESULTADO\n')
console.log(JSON.stringify(resultado, null, 2))
