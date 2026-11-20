// Ejecutar desde apuntes/llm: node demo/T7.js
import { pedir } from './llm.js'

console.log('\nT7 · Transformar: Normalizar direcciones')
console.log('='.repeat(60))

const instruccion = `Vas a recibir una dirección escrita a mano.
Devolvé un JSON con los campos calle, numero, piso, localidad y provincia.
Si un dato no figura, poné null. No lo deduzcas.`

const datos = `Av. Mate de Luna 1850, piso 2. San Miguel de Tucumán, provincia de Tucumán.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const texto = await pedir(instruccion, datos, {
  response_format: { type: 'json_object' },
})
const resultado = JSON.parse(texto)

console.log('\nRESULTADO\n')
console.log(JSON.stringify(resultado, null, 2))
