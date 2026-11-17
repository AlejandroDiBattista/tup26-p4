// Ejecutar desde apuntes/llm: node demo/R9.js
import { pedir } from './llm.js'

console.log('\nR9 · Reducir: Etiquetar')
console.log('='.repeat(60))

const instruccion = `Asigná a la nota entre una y tres etiquetas de esta lista:
precio, entrega, calidad, facturacion, soporte.
Devolvé un JSON con la lista "etiquetas". No uses etiquetas fuera de la lista.`

const datos = `El pedido llegó dos días tarde y, además, la factura tiene el domicilio anterior. Los productos estaban en buen estado y el precio fue el acordado.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const texto = await pedir(instruccion, datos, {
  response_format: { type: 'json_object' },
})
const resultado = JSON.parse(texto)

console.log('\nRESULTADO\n')
console.log(JSON.stringify(resultado, null, 2))
