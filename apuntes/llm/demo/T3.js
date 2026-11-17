// Ejecutar desde apuntes/llm: node demo/T3.js
import { pedir } from './llm.js'

console.log('\nT3 · Transformar: Corregir una nota')
console.log('='.repeat(60))

const instruccion = `Corregí la ortografía y la puntuación del texto.
No cambies palabras ni el orden de las ideas.
Respondé solo con el texto corregido.`

const datos = `hola mariana te confirmo que el miercoles sale tu pedido todavia no tengo el numero de seguimiento cuando lo tenga te aviso gracias por la pasiencia`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const resultado = await pedir(instruccion, datos)

console.log('\nRESULTADO\n')
console.log(resultado)
