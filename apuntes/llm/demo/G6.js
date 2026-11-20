// Ejecutar desde apuntes/llm: node demo/G6.js
import { pedir } from './llm.js'

console.log('\nG6 · Generar: Variantes de un asunto')
console.log('='.repeat(60))

const instruccion = `Proponé cinco asuntos distintos para el correo que vas a recibir.
Máximo 50 caracteres cada uno. Devolvé un JSON con la lista "asuntos".`

const datos = `Hola, Mariana:
Ya preparamos el presupuesto 142 para las veinte cajas de tornillos y los diez rollos de cinta.
El importe total es de $ 85.000 y la propuesta es válida hasta el 20/11/2026.
Adjuntamos el detalle para que pueda revisarlo y confirmar el pedido.
Saludos, Pablo, Distribuidora Norte.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const texto = await pedir(instruccion, datos, {
  response_format: { type: 'json_object' },
})
const resultado = JSON.parse(texto)

console.log('\nRESULTADO\n')
console.log(JSON.stringify(resultado, null, 2))
