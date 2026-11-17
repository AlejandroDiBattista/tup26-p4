// Ejecutar desde apuntes/llm: node demo/J9.js
import { pedir } from './llm.js'

console.log('\nJ9 · Juzgar: Evaluar una respuesta de atención')
console.log('='.repeat(60))

const instruccion = `Evaluá la respuesta con tres criterios, cada uno con sí o no:
responde lo que se preguntó, es cordial, indica el próximo paso.
Devolvé un JSON con los tres criterios.`

const datos = {
  "consulta": "¿Hacen entregas en Yerba Buena y cuánto demora un pedido?",
  "respuesta": "Hola, Mariana. Sí, entregamos en Yerba Buena y el plazo es de dos a cinco días hábiles desde el pago. Si nos confirma los productos y el domicilio, le enviamos el presupuesto para que pueda hacer el pedido. Gracias por consultarnos."
}

const entrada = JSON.stringify(datos, null, 2)

console.log('\nDATOS DE ENTRADA\n')
console.log(entrada)

const texto = await pedir(instruccion, entrada, {
  response_format: { type: 'json_object' },
})
const resultado = JSON.parse(texto)

console.log('\nRESULTADO\n')
console.log(JSON.stringify(resultado, null, 2))
