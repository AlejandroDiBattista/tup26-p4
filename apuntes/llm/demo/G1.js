// Ejecutar desde apuntes/llm: node demo/G1.js
import { pedir } from './llm.js'

console.log('\nG1 · Generar: Aviso de deuda')
console.log('='.repeat(60))

const instruccion = `Vas a recibir los datos de la deuda de un cliente en JSON.
Redactá un correo breve y cordial avisando el saldo y la fecha de vencimiento.
Usá solo los datos recibidos. No ofrezcas descuentos ni planes de pago.`

const datos = {
  "comercio": "Distribuidora Norte",
  "cliente": "Mariana López",
  "empresa": "Ferretería El Puente",
  "saldo": "$ 85.000",
  "vencimiento": "20/11/2026",
  "referencia": "Factura 0001-00000142"
}

const entrada = JSON.stringify(datos, null, 2)

console.log('\nDATOS DE ENTRADA\n')
console.log(entrada)

const resultado = await pedir(instruccion, entrada)

console.log('\nRESULTADO\n')
console.log(resultado)
