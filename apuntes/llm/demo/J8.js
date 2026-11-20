// Ejecutar desde apuntes/llm: node demo/J8.js
import { pedir } from './llm.js'

console.log('\nJ8 · Juzgar: Decidir si interviene una persona')
console.log('='.repeat(60))

const instruccion = `Indicá si el mensaje del cliente debe pasar a una persona.
Debe pasar si amenaza con acciones legales, pide hablar con un responsable o menciona un daño.
Devolvé un JSON con "derivar" (true o false) y "motivo".`

const datos = `Es la tercera vez que reclamo por los martillos rotos. Quiero hablar hoy con el responsable del local. Si no tengo una respuesta, voy a iniciar acciones legales. Mariana.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const texto = await pedir(instruccion, datos, {
  response_format: { type: 'json_object' },
})
const resultado = JSON.parse(texto)

console.log('\nRESULTADO\n')
console.log(JSON.stringify(resultado, null, 2))
