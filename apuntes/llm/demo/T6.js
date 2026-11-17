// Ejecutar desde apuntes/llm: node demo/T6.js
import { pedir } from './llm.js'

console.log('\nT6 · Transformar: Normalizar teléfonos')
console.log('='.repeat(60))

const instruccion = `Vas a recibir un teléfono argentino escrito de cualquier forma.
Devolvelo con el formato +54 seguido del código de área y el número, sin espacios ni guiones.
Si no es un teléfono válido, respondé: invalido.`

const datos = `(0381) 456-7890`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const resultado = await pedir(instruccion, datos)

console.log('\nRESULTADO\n')
console.log(resultado)
