// Ejecutar desde apuntes/llm: node demo/T4.js
import { pedir } from './llm.js'

console.log('\nT4 · Transformar: Pasar una nota interna a un correo formal')
console.log('='.repeat(60))

const instruccion = `Vas a recibir una nota interna de un vendedor.
Reescribila como un correo formal para el cliente, tratándolo de usted.
No agregues datos que no estén en la nota.`

const datos = `Mariana llamó por las 20 cajas de tornillos del pedido 142.
Confirmé con depósito: salen el miércoles 18 de noviembre.
El envío va al domicilio habitual de Ferretería El Puente.
Avisarle que le mandamos el seguimiento cuando lo tengamos. Firma Pablo.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const resultado = await pedir(instruccion, datos)

console.log('\nRESULTADO\n')
console.log(resultado)
