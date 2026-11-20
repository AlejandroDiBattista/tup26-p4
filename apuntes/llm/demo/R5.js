// Ejecutar desde apuntes/llm: node demo/R5.js
import { pedir } from './llm.js'

console.log('\nR5 · Reducir: Clasificar un correo')
console.log('='.repeat(60))

const instruccion = `Clasificá el correo en una sola categoría: consulta, reclamo, pedido, otro.
Respondé únicamente con la palabra.`

const datos = `Hola, recibí el pedido 142 y dos martillos tienen el mango quebrado. Necesito que los cambien, porque así no los puedo vender.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const resultado = await pedir(instruccion, datos)

console.log('\nRESULTADO\n')
console.log(resultado)
