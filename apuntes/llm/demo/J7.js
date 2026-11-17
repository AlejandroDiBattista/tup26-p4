// Ejecutar desde apuntes/llm: node demo/J7.js
import { pedir } from './llm.js'

console.log('\nJ7 · Juzgar: Detectar contradicciones')
console.log('='.repeat(60))

const instruccion = `Compará la nota del vendedor con el registro del sistema.
Listá los datos en que se contradicen. Si no hay contradicciones, respondé: ninguna.`

const datos = {
  "notaVendedor": "El pedido 142 ya fue pagado en efectivo y se entregó el 16/11/2026. Incluía 20 cajas de tornillos.",
  "registroSistema": {
    "pedido": 142,
    "estado": "pendiente de entrega",
    "fechaEntrega": null,
    "formaPago": "cuenta corriente",
    "saldoPendiente": 85000,
    "items": [
      {
        "producto": "Caja de tornillos",
        "cantidad": 20
      }
    ]
  }
}

const entrada = JSON.stringify(datos, null, 2)

console.log('\nDATOS DE ENTRADA\n')
console.log(entrada)

const resultado = await pedir(instruccion, entrada)

console.log('\nRESULTADO\n')
console.log(resultado)
