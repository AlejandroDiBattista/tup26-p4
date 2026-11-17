// Ejecutar desde apuntes/llm: node demo/T10.js
import { pedir } from './llm.js'

console.log('\nT10 · Transformar: Convertir una búsqueda en un filtro')
console.log('='.repeat(60))

const instruccion = `Vas a recibir una búsqueda escrita en castellano sobre una lista de clientes.
Devolvé un JSON con los filtros a aplicar. Campos permitidos:
provincia (texto), sinComprasDesdeDias (número), conDeuda (true o false).
Incluí solo los campos que la búsqueda mencione.
Si la búsqueda pide algo que estos campos no cubren, devolvé {"error": "no soportado"}.`

const datos = `Mostrame los clientes de la provincia de Tucumán que hace más de 90 días que no compran y que tienen deuda.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const texto = await pedir(instruccion, datos, {
  response_format: { type: 'json_object' },
})
const resultado = JSON.parse(texto)

console.log('\nRESULTADO\n')
console.log(JSON.stringify(resultado, null, 2))
