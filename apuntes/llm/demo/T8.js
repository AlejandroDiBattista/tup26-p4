// Ejecutar desde apuntes/llm: node demo/T8.js
import { pedir } from './llm.js'

console.log('\nT8 · Transformar: Acortar para WhatsApp')
console.log('='.repeat(60))

const instruccion = `Reescribí el mensaje para enviarlo por WhatsApp.
Máximo 300 caracteres, tono cordial, sin saludo final.
Conservá fechas, montos y nombres tal como están.`

const datos = `Estimada Mariana López: nos comunicamos de Ferretería El Puente para informarle que el pedido 142 está preparado. El total pendiente es de $ 85.000 y podrá retirarlo el 18/11/2026 entre las 9 y las 13. Para que podamos entregarlo, deberá presentar el comprobante de pago y mencionar el número de pedido en el mostrador. Agradecemos su compra y quedamos a su disposición ante cualquier consulta adicional. Saludos cordiales, Pablo Ruiz.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const resultado = await pedir(instruccion, datos)

console.log('\nRESULTADO\n')
console.log(resultado)
