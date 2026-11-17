// Ejecutar desde apuntes/llm: node demo/R10.js
import { pedir } from './llm.js'

console.log('\nR10 · Reducir: Extraer fechas y montos de un contrato')
console.log('='.repeat(60))

const instruccion = `Vas a recibir el texto de un contrato.
Devolvé un JSON con fechaInicio, fechaFin, montoMensual y moneda.
Las fechas van como AAAA-MM-DD. Si un dato no figura, poné null.`

const datos = `Contrato de mantenimiento entre Ferretería El Puente y Soporte Norte.
El servicio comienza el 1 de diciembre de 2026 y finaliza el 30 de noviembre de 2027.
El abono mensual es de 150.000 pesos argentinos, pagadero dentro de los primeros diez días de cada mes.
El servicio comprende asistencia remota y una visita mensual al local.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const texto = await pedir(instruccion, datos, {
  response_format: { type: 'json_object' },
})
const resultado = JSON.parse(texto)

console.log('\nRESULTADO\n')
console.log(JSON.stringify(resultado, null, 2))
