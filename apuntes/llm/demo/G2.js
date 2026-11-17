// Ejecutar desde apuntes/llm: node demo/G2.js
import { pedir } from './llm.js'

console.log('\nG2 · Generar: Personalizar una plantilla')
console.log('='.repeat(60))

const instruccion = `Vas a recibir una plantilla de correo y la ficha de un cliente.
Adaptá la plantilla a ese cliente: usá su nombre y mencioná su última compra.
No cambies las condiciones comerciales de la plantilla.`

const datos = {
  "plantilla": "Hola, {nombre}. Gracias por su última compra. Los pedidos se entregan dentro de los cinco días hábiles y el envío es sin cargo para compras desde $ 100.000. Quedamos a su disposición.",
  "cliente": {
    "nombre": "Mariana López",
    "empresa": "Ferretería El Puente",
    "ultimaCompra": {
      "fecha": "10/11/2026",
      "productos": "20 cajas de tornillos y 10 rollos de cinta aisladora"
    }
  }
}

const entrada = JSON.stringify(datos, null, 2)

console.log('\nDATOS DE ENTRADA\n')
console.log(entrada)

const resultado = await pedir(instruccion, entrada)

console.log('\nRESULTADO\n')
console.log(resultado)
