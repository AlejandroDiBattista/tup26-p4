// Ejecutar desde apuntes/llm: node demo/G10.js
import { pedir } from './llm.js'

console.log('\nG10 · Generar: Texto de ayuda de una pantalla')
console.log('='.repeat(60))

const instruccion = `Vas a recibir los campos de un formulario con su descripción.
Escribí para cada uno un texto de ayuda de una oración, en tono neutro.
Devolvé un JSON cuya clave es el nombre del campo.`

const datos = [
  {
    "campo": "nombre",
    "descripcion": "Nombre completo o razón social del cliente. Es obligatorio."
  },
  {
    "campo": "documento",
    "descripcion": "DNI o CUIT. Debe ser único entre los clientes."
  },
  {
    "campo": "correo",
    "descripcion": "Dirección para enviar presupuestos y comprobantes. Es opcional."
  },
  {
    "campo": "telefono",
    "descripcion": "Número de contacto con código de área. Es opcional."
  },
  {
    "campo": "cuentaCorriente",
    "descripcion": "Indica si se permite al cliente comprar a cuenta."
  },
  {
    "campo": "limiteCredito",
    "descripcion": "Deuda máxima permitida para compras a cuenta. Puede quedar vacío si no hay límite."
  }
]

const entrada = JSON.stringify(datos, null, 2)

console.log('\nDATOS DE ENTRADA\n')
console.log(entrada)

const texto = await pedir(instruccion, entrada, {
  response_format: { type: 'json_object' },
})
const resultado = JSON.parse(texto)

console.log('\nRESULTADO\n')
console.log(JSON.stringify(resultado, null, 2))
