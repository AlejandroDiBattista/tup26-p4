// Ejecutar desde apuntes/llm: node demo/T5.js
import { pedir } from './llm.js'

console.log('\nT5 · Transformar: Pasar un texto técnico a lenguaje llano')
console.log('='.repeat(60))

const instruccion = `Reescribí el texto para una persona sin conocimientos técnicos.
Usá oraciones cortas y reemplazá cada término técnico por una explicación breve.
No quites ninguna advertencia ni ningún paso.`

const datos = `Para actualizar el sistema, ejecutá las migraciones del esquema de la base de datos.
Antes de comenzar, generá un backup y verificá que pueda restaurarse.
Después reiniciá el servidor y comprobá el endpoint de estado.
No cierres la terminal mientras se ejecutan las migraciones: podrías dejar la base incompleta.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const resultado = await pedir(instruccion, datos)

console.log('\nRESULTADO\n')
console.log(resultado)
