// Ejecutar desde apuntes/llm: node demo/J3.js
import { pedir } from './llm.js'

console.log('\nJ3 · Juzgar: Verificar una respuesta contra la política')
console.log('='.repeat(60))

const instruccion = `Revisá si el borrador de respuesta cumple la política de la empresa.
Devolvé un JSON con "cumple" (true o false) y "reglasIncumplidas" (lista de textos).`

const datos = {
  "politica": "Los cambios por roturas se aceptan dentro de los diez días de la entrega, con comprobante. No se ofrecen descuentos ni se devuelven importes sin autorización del administrador.",
  "borrador": "Lamentamos que hayan llegado dos martillos rotos. Se los cambiaremos cuando nos envíe el comprobante. Además, le devolveremos el total de la compra y tendrá un descuento del 20% en su próximo pedido."
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
