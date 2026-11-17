// Ejecutar desde apuntes/llm: node demo/J6.js
import { pedir } from './llm.js'

console.log('\nJ6 · Juzgar: Calificar un posible cliente')
console.log('='.repeat(60))

const instruccion = `Calificá al posible cliente de 1 a 3 según la nota:
3 si tiene presupuesto y plazo definidos, 2 si tiene uno de los dos, 1 si no tiene ninguno.
Devolvé un JSON con "puntaje" y "motivo".`

const datos = `Mariana administra una ferretería y busca cambiar de distribuidor. Tiene reservado un presupuesto de $ 500.000 para herramientas y necesita recibir la primera compra antes del 1 de diciembre de 2026. Solicitó una propuesta por correo.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const texto = await pedir(instruccion, datos, {
  response_format: { type: 'json_object' },
})
const resultado = JSON.parse(texto)

console.log('\nRESULTADO\n')
console.log(JSON.stringify(resultado, null, 2))
