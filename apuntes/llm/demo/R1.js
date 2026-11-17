// Ejecutar desde apuntes/llm: node demo/R1.js
import { pedir } from './llm.js'

console.log('\nR1 · Reducir: Resumir un correo largo')
console.log('='.repeat(60))

const instruccion = `Resumí el correo en dos oraciones como máximo.
La primera dice qué pide el cliente. La segunda, qué plazo menciona, si menciona alguno.`

const datos = `Buen día. El 5 de noviembre compré veinte cajas de tornillos y diez rollos de cinta.
Las cajas llegaron bien, pero recibí solamente seis rollos. En el remito figuran diez.
Ya revisé con el encargado del depósito y no hay otro paquete pendiente de abrir.
Necesito que me envíen los cuatro rollos que faltan antes del viernes 20 de noviembre,
porque el sábado empezamos un trabajo. Si hace falta, puedo enviar fotos del paquete y del remito.
Quedo atenta a la confirmación. Mariana, Ferretería El Puente.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const resultado = await pedir(instruccion, datos)

console.log('\nRESULTADO\n')
console.log(resultado)
