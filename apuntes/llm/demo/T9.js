// Ejecutar desde apuntes/llm: node demo/T9.js
import { pedir } from './llm.js'

console.log('\nT9 · Transformar: Ocultar datos personales')
console.log('='.repeat(60))

const instruccion = `Devolvé el mismo texto reemplazando nombres de personas por [NOMBRE],
teléfonos por [TELEFONO], correos por [CORREO] y documentos por [DOCUMENTO].
No cambies nada más.`

const datos = `La clienta Mariana López, DNI 12.345.678, pidió actualizar su ficha.
Su teléfono es 381-555-0142 y su correo es mariana.lopez@example.test.
Pablo Ruiz confirmó que el pedido 142 se entrega el miércoles.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const resultado = await pedir(instruccion, datos)

console.log('\nRESULTADO\n')
console.log(resultado)
