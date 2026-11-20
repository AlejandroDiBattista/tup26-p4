// Ejecutar desde apuntes/llm: node demo/J4.js
import { pedir } from './llm.js'

console.log('\nJ4 · Juzgar: Verificar que un resumen sea fiel')
console.log('='.repeat(60))

const instruccion = `Indicá si el resumen contiene alguna afirmación que no esté en el texto original.
Devolvé un JSON con "fiel" (true o false) y "agregados" (lista de afirmaciones agregadas).`

const datos = {
  "original": "El pedido 142 salió del depósito el lunes 16 de noviembre. El transporte estima entregarlo entre el miércoles 18 y el viernes 20. Todavía no confirmó un horario.",
  "resumen": "El pedido 142 llegará el miércoles 18 a las 10 y el envío será gratuito."
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
