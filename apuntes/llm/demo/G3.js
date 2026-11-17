// Ejecutar desde apuntes/llm: node demo/G3.js
import { pedir } from './llm.js'

console.log('\nG3 · Generar: Responder una consulta frecuente')
console.log('='.repeat(60))

const instruccion = `Respondé la consulta del cliente usando únicamente la política que se adjunta.
Si la política no contiene la respuesta, escribí: "Lo consulto y le respondo a la brevedad."`

const datos = {
  "consulta": "Estoy en Yerba Buena. Si compro $ 120.000, ¿cuánto cuesta el envío y cuánto demora?",
  "politicaEnvios": "Entregamos en San Miguel de Tucumán y Yerba Buena. El envío no tiene cargo en compras desde $ 100.000. Para importes menores cuesta $ 5.000. El plazo de entrega es de dos a cinco días hábiles desde la confirmación del pago."
}

const entrada = JSON.stringify(datos, null, 2)

console.log('\nDATOS DE ENTRADA\n')
console.log(entrada)

const resultado = await pedir(instruccion, entrada)

console.log('\nRESULTADO\n')
console.log(resultado)
