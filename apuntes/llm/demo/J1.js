// Ejecutar desde apuntes/llm: node demo/J1.js
import { pedir } from './llm.js'

console.log('\nJ1 · Juzgar: Detectar duplicados')
console.log('='.repeat(60))

const instruccion = `Vas a recibir dos fichas de cliente.
Indicá si corresponden a la misma empresa o persona.
Devolvé un JSON con "mismo" (true o false) y "motivo" (una oración).
Ante la duda, respondé false.`

const datos = {
  "fichaA": {
    "nombre": "Mariana López",
    "empresa": "Ferretería El Puente",
    "telefono": "381-555-0142",
    "correo": "ventas@elpuente.example.test"
  },
  "fichaB": {
    "nombre": "Mariana Lopez",
    "empresa": "El Puente Ferreteria",
    "telefono": "+54 381 5550142",
    "correo": "ventas@elpuente.example.test"
  }
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
