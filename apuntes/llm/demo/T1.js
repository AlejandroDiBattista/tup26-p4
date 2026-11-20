// Ejecutar desde apuntes/llm: node demo/T1.js
import { pedir } from './llm.js'

console.log('\nT1 · Transformar: Traducir un correo')
console.log('='.repeat(60))

const instruccion = `
Traducí al ingles el correo que vas a recibir.
Mantené el tono y los saltos de línea. 
No traduzcas nombres propios.
Respondé solo con la traducción.`

const datos = `Buenos días, Mariana:
Te envío la cotización de veinte cajas de tornillos para Ferretería El Puente.
El precio es válido hasta el 20 de noviembre de 2026.
Saludos cordiales,
Pablo`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const resultado = await pedir(instruccion, datos)

console.log('\nRESULTADO\n')
console.log(resultado)
