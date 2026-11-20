// Ejecutar desde apuntes/llm: node demo/G4.js
import { pedir } from './llm.js'

console.log('\nG4 · Generar: Descripción de un producto')
console.log('='.repeat(60))

const instruccion = `Escribí una descripción de venta de 60 palabras a partir de la ficha.
Mencioná solo características que figuren en ella.`

const datos = {
  "producto": "Martillo carpintero",
  "marca": "Norte",
  "pesoCabeza": "500 g",
  "materialCabeza": "acero",
  "mango": "fibra de vidrio con agarre de goma",
  "largoTotal": "33 cm",
  "uso": "clavado y extracción de clavos"
}

const entrada = JSON.stringify(datos, null, 2)

console.log('\nDATOS DE ENTRADA\n')
console.log(entrada)

const resultado = await pedir(instruccion, entrada)

console.log('\nRESULTADO\n')
console.log(resultado)
