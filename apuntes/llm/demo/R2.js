// Ejecutar desde apuntes/llm: node demo/R2.js
import { pedir } from './llm.js'

console.log('\nR2 · Reducir: Resumir el historial antes de una llamada')
console.log('='.repeat(60))

const instruccion = `Vas a recibir las notas de un cliente, de la más vieja a la más nueva.
Escribí un resumen de cinco líneas para un vendedor que lo va a llamar ahora:
qué compró, qué problemas tuvo, qué quedó pendiente.
Usá solo lo que dicen las notas.`

const datos = [
  {
    "fecha": "2026-10-20",
    "nota": "Compró 20 cajas de tornillos. Pidió entrega a domicilio."
  },
  {
    "fecha": "2026-10-24",
    "nota": "Avisó que dos cajas llegaron abiertas. Se acordó reponerlas."
  },
  {
    "fecha": "2026-10-28",
    "nota": "Recibió las dos cajas de reposición y confirmó que estaban bien."
  },
  {
    "fecha": "2026-11-10",
    "nota": "Pidió un presupuesto por 10 rollos de cinta y 5 lámparas LED."
  },
  {
    "fecha": "2026-11-13",
    "nota": "El vendedor envió el presupuesto. Falta que Mariana confirme la compra."
  }
]

const entrada = JSON.stringify(datos, null, 2)

console.log('\nDATOS DE ENTRADA\n')
console.log(entrada)

const resultado = await pedir(instruccion, entrada)

console.log('\nRESULTADO\n')
console.log(resultado)
