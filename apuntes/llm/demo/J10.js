// Ejecutar desde apuntes/llm: node demo/J10.js
import { pedir } from './llm.js'

console.log('\nJ10 · Juzgar: Verificar si un documento responde una pregunta')
console.log('='.repeat(60))

const instruccion = `Indicá si el documento contiene la información necesaria para responder la pregunta.
Devolvé un JSON con "responde" (true o false) y "fragmento" (la parte del documento que lo respalda, o null).`

const datos = {
  "pregunta": "¿En qué plazo puedo pedir un cambio si un producto llega roto?",
  "documento": "Política de cambios. Los productos que llegan dañados pueden cambiarse dentro de los diez días corridos desde la entrega. Se debe presentar el comprobante de compra y una foto del producto. Los cambios por otros motivos se evalúan en el local."
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
