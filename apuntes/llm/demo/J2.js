// Ejecutar desde apuntes/llm: node demo/J2.js
import { pedir } from './llm.js'

console.log('\nJ2 · Juzgar: Comparar dos presupuestos')
console.log('='.repeat(60))

const instruccion = `Vas a recibir dos versiones de un presupuesto.
Listá las diferencias en productos, cantidades, precios y condiciones.
Si no hay diferencias, respondé: sin cambios.`

const datos = {
  "versionAnterior": {
    "numero": 142,
    "items": [
      {
        "producto": "Martillo 500 g",
        "cantidad": 10,
        "precioUnitario": 12500
      },
      {
        "producto": "Cinta aisladora 20 m",
        "cantidad": 20,
        "precioUnitario": 1900
      }
    ],
    "pago": "contado",
    "entrega": "cinco días hábiles"
  },
  "versionNueva": {
    "numero": 142,
    "items": [
      {
        "producto": "Martillo 500 g",
        "cantidad": 12,
        "precioUnitario": 13000
      },
      {
        "producto": "Cinta aisladora 20 m",
        "cantidad": 20,
        "precioUnitario": 1900
      },
      {
        "producto": "Lámpara LED 12 W",
        "cantidad": 5,
        "precioUnitario": 3200
      }
    ],
    "pago": "cuenta corriente a 15 días",
    "entrega": "cinco días hábiles"
  }
}

const entrada = JSON.stringify(datos, null, 2)

console.log('\nDATOS DE ENTRADA\n')
console.log(entrada)

const resultado = await pedir(instruccion, entrada)

console.log('\nRESULTADO\n')
console.log(resultado)
