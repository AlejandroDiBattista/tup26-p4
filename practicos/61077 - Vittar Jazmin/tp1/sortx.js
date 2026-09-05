#!/usr/bin/env node

const HELP = `

sortx — Ordena archivos de texto delimitados

USO:
    sortx <origen> <destino> [opciones]

ARGUMENTOS:
    origen              Archivo que se desea ordenar.
    destino             Archivo donde se guardará el resultado.

OPCIONES:
    -b, --by <criterio> Criterio de ordenamiento. Se puede repetir.
                        Formato: campo[:tipo[:orden]]
                        tipo: alpha (predeterminado) o num
                        orden: asc (predeterminado) o desc

    -d, --delimiter <c> Delimitador de un solo carácter.
                        Predeterminado: ","
                        Usá "\t" para archivos separados por tabulaciones.

    -nh, --no-header    Indica que el archivo no tiene encabezado.
                        Los campos se identifican mediante índices desde cero.

    -h, --help          Muestra esta ayuda.

EJEMPLOS:
    sortx empleados.csv ordenados.csv -b apellido
    sortx empleados.csv salarios.csv -b salario:num:desc
    sortx empleados.csv resultado.csv -b departamento -b salario:num:desc
    sortx datos.csv resultado.csv -nh -b 2:num:desc
    sortx datos.tsv salida.tsv -d "\t" -b nombre
`

// Escribir aqui la solución al enunciado.
console.log(process.argv) /* array con 2 elementos 'process.argv[0] → Node.js' y 'process.argv[1] → sortx.js' */

/* FUNCIÓN 1 --> mirar lo que escribió el usuario */
function parseArgs() {
    const inputFile = process.argv[2]       // archivo de entrada
    const outputFile = process.argv[3]      // archivo de salida

    for (let i = 4; i < process.argv.length; i++) {         // en posición 4 empiezan las opciones
        if (process.argv[i] === "-d" || process.argv[i] === "--delimiter") {
            let delimiter = process.argv[i + 1]
        }

    }
    return {
        inputFile: inputFile,
        outputFile: outputFile,
        delimiter: delimiter,
        noHeader: false
    }
}
console.log(parseArgs())

console.log(HELP)