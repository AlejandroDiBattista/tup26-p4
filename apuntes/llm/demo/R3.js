// Ejecutar desde apuntes/llm: node demo/R3.js
import { pedir } from './llm.js'

console.log('\nR3 · Reducir: Extraer un contacto de un correo')
console.log('='.repeat(60))

const instruccion = `Extraé los datos de contacto de quien firma el correo.
Devolvé un JSON con nombre, empresa, telefono y correo.
Si un dato no figura en el texto, poné null. No lo inventes ni lo deduzcas.`

const datos = `Buen día:
Quisiera recibir el catálogo actualizado y saber si hacen entregas en Yerba Buena.
Por favor, envíenlo a este mismo correo.
Saludos,
Mariana López
Ferretería El Puente
Teléfono: 381-555-0142
mariana.lopez@example.test`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const texto = await pedir(instruccion, datos, {
  response_format: { type: 'json_object' },
})
const resultado = JSON.parse(texto)

console.log('\nRESULTADO\n')
console.log(JSON.stringify(resultado, null, 2))
