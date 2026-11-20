// Ejecutar desde apuntes/llm: node demo/G8.js
import { pedir } from './llm.js'

console.log('\nG8 · Generar: Reclamos de prueba')
console.log('='.repeat(60))

const instruccion = `Escribí 10 correos de reclamo ficticios, variados en tono, largo y motivo.
Dos deben estar mal redactados y uno debe mezclar un reclamo con un pedido.
Devolvé un JSON con la lista "correos".`

const datos = {
  "empresa": "Distribuidora Norte",
  "contexto": "Venta de herramientas y artículos de ferretería",
  "productos": [
    "martillos",
    "tornillos",
    "cinta aisladora",
    "lámparas LED"
  ],
  "motivosDeEjemplo": [
    "entrega atrasada",
    "producto roto",
    "cantidad incompleta",
    "error en la factura"
  ],
  "correosFicticios": 10,
  "malRedactados": 2,
  "conReclamoYPedidoEnElMismoMensaje": 1
}

const entrada = JSON.stringify(datos, null, 2)

console.log('\nDATOS DE ENTRADA\n')
console.log(entrada)

const texto = await pedir(instruccion, entrada, {
  response_format: { type: 'json_object' },
})
const resultado = JSON.parse(texto)

console.log('\nRESULTADO\n')
console.log(JSON.stringify(resultado, null, 2))
