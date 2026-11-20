// Ejecutar desde apuntes/llm: node demo/G5.js
import { pedir } from './llm.js'

console.log('\nG5 · Generar: Mensaje de seguimiento')
console.log('='.repeat(60))

const instruccion = `Redactá un mensaje de seguimiento para el cliente a partir de la nota de la reunión.
Agradecé, recordá lo acordado en una lista y proponé el próximo paso que figura en la nota.`

const datos = `Reunión con Mariana López, de Ferretería El Puente, el 16/11/2026.
Se acordó enviar 20 cajas de tornillos el 18/11/2026 al domicilio de la ficha del cliente.
Mariana confirmará el comprobante de pago antes del despacho.
Se conservará el precio del presupuesto 142.
Próximo paso: Pablo enviará por correo la confirmación del pedido para que Mariana la revise.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const resultado = await pedir(instruccion, datos)

console.log('\nRESULTADO\n')
console.log(resultado)
