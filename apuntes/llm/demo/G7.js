// Ejecutar desde apuntes/llm: node demo/G7.js
import { pedir } from './llm.js'

console.log('\nG7 · Generar: Clientes de prueba')
console.log('='.repeat(60))

const instruccion = `Generá 20 clientes ficticios de Tucumán para probar un sistema.
Devolvé un JSON con la lista "clientes"; cada uno tiene nombre, empresa, telefono y correo.
Incluí tres con datos incompletos y dos casi duplicados entre sí.`

const datos = {
  "sistema": "Mini CRM de una distribuidora de ferretería",
  "localidades": [
    "San Miguel de Tucumán",
    "Yerba Buena",
    "Tafí Viejo"
  ],
  "rubros": [
    "ferretería",
    "electricidad",
    "construcción",
    "pinturería"
  ],
  "dominioParaCorreosFicticios": "example.test",
  "ejemploDeFicha": {
    "nombre": "Lucía Ejemplo",
    "empresa": "Ferretería de Prueba",
    "telefono": "+543815550101",
    "correo": "lucia@example.test"
  },
  "cantidad": 20,
  "fichasConDatosIncompletos": 3,
  "fichasCasiDuplicadasEntreSi": 2
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
