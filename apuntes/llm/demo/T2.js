// Ejecutar desde apuntes/llm: node demo/T2.js
import { pedir } from './llm.js'

console.log('\nT2 · Transformar: Traducir los textos de la interfaz')
console.log('='.repeat(60))

const instruccion = `Vas a recibir un JSON con textos de una aplicación en español.
Devolvé el mismo JSON con los valores traducidos al ingles.
No cambies las claves ni lo que esté entre llaves, como {nombre}.`

const datos = {
  "titulo": "Clientes",
  "buscar": "Buscar por nombre o documento",
  "nuevoCliente": "Nuevo cliente",
  "guardar": "Guardar cambios",
  "bienvenida": "Hola, {nombre}",
  "saldo": "Saldo pendiente: {importe}",
  "sinResultados": "No encontramos clientes con esa búsqueda."
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
