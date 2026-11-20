// Ejecutar desde apuntes/llm: node demo/R8.js
import { pedir } from './llm.js'

console.log('\nR8 · Reducir: Titular una nota')
console.log('='.repeat(60))

const instruccion = `Escribí un título de seis palabras como máximo para la nota.
Tiene que servir para encontrarla después en una lista. Sin punto final.`

const datos = `Mariana confirmó que el pedido 142 llegó completo, pero pidió que en las próximas entregas no se mezclen los rollos de cinta con los martillos porque se aplastan los envases.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const resultado = await pedir(instruccion, datos)

console.log('\nRESULTADO\n')
console.log(resultado)
