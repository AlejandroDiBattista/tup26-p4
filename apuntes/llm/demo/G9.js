// Ejecutar desde apuntes/llm: node demo/G9.js
import { pedir } from './llm.js'

console.log('\nG9 · Generar: Preguntas frecuentes a partir de un manual')
console.log('='.repeat(60))

const instruccion = `Vas a recibir un manual de uso.
Escribí ocho preguntas que haría un usuario nuevo, cada una con su respuesta.
Cada respuesta debe poder verificarse en el manual. Haslo muy extenso, con detalle y claridad. No inventes información.`

const datos = `Manual de uso del Mini CRM.
1. Para entrar, escriba su correo y contraseña en la pantalla de inicio de sesión.
2. Para crear un cliente, entre a Clientes, pulse Nuevo cliente y complete nombre y documento.
3. El buscador de Clientes acepta nombre o número de documento.
4. Para crear una venta, entre a Ventas, seleccione Nueva venta y agregue los productos.
5. Al agregar un producto, indique una cantidad que no supere la existencia disponible.
6. Las formas de pago son contado, tarjeta y cuenta corriente. Esta última requiere un cliente habilitado.
7. La ficha del cliente muestra su saldo y los movimientos de la cuenta corriente.
8. Para registrar un pago, abra la ficha del cliente y pulse Registrar pago. El importe no puede superar la deuda.
9. Una factura emitida puede imprimirse desde su detalle.
10. Solo un administrador puede anular facturas. Debe escribir el motivo de la anulación.`

console.log('\nDATOS DE ENTRADA\n')
console.log(datos)

const resultado = await pedir(instruccion, datos)

console.log('\nRESULTADO\n')
console.log(resultado)
