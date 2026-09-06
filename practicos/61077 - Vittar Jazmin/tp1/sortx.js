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
/* console.log(process.argv)   // array con 2 elementos 'process.argv[0] → Node.js' y 'process.argv[1] → sortx.js' */

/* FUNCIÓN 1 --> mirar lo que escribió el usuario */
function parseArgs() {
    if (process.argv.includes("-h") || process.argv.includes("--help")) {       // mostrar ayuda
        console.log(HELP)
        process.exit(0)                     // función de node.js       (0) --> terminó correctamente
    }

    const inputFile = process.argv[2]       // archivo de entrada
    const outputFile = process.argv[3]      // archivo de salida

    if (!inputFile) {                           // validar archivo de entrada
        console.error("Error: Falta especificar el archivo de origen")
        process.exit(1)                     // función de node.js       (1) --> terminó porque hubo un error
    }

    if (!outputFile) {                           // validar archivo de salida
        console.error("Error: Falta especificar el archivo de destino")
        process.exit(1)                     // función de node.js       (1) --> terminó porque hubo un error
    }

    let delimiter = ","         // valor predeterminado
    let noHeader = false        // valor predeterminado
    let sortFields = []         // valor predeterminado

    for (let i = 4; i < process.argv.length; i++) {         // en posición 4 empiezan las opciones
        if (process.argv[i] === "-d" || process.argv[i] === "--delimiter") {
            if (i + 1 >= process.argv.length) {
                console.error("Error: La opción --delimiter requiere un valor")
                process.exit(1)
            }

            delimiter = process.argv[i + 1]
            i++

            if (delimiter.length !== 1) {                   // validar un caracter
                console.error("Error: El delimitador debe ser de un solo carácter")
                process.exit(1)                     // función de node.js       (1) --> terminó porque hubo un error
            }

        } else if (process.argv[i] === "-nh" || process.argv[i] === "--no-header") {
            noHeader = true

        } else if (process.argv[i] === "-b" || process.argv[i] === "--by") {
            if (i + 1 >= process.argv.length) {
                console.error("Error: la opción --by requiere un criterio")
                process.exit(1)                     // función de node.js       (1) --> terminó porque hubo un error
            }

            const criterio = process.argv[i + 1]
            i++

            const partes = criterio.split(":")      // criterio tiene columna:tipo:orden (ej: salario:num:desc)
            // split transforma cadena en array
            if (partes.length > 3) {
                console.error("Error: El criterio debe tener el formato campo[:tipo[:orden]]")
                process.exit(1)                     // función de node.js       (1) --> terminó porque hubo un error
            }

            const name = partes[0]                      // columna
            if (!name) {
                console.error("Error: Debe especificar un campo para ordenar")
                process.exit(1)                     // función de node.js       (1) --> terminó porque hubo un error
            }

            const numeric = partes[1] === "num"         // tipo
            if (partes[1] !== "alpha" && partes[1] !== "num") {             // validar tipo
                console.error(`Error: El tipo '${partes[1]}' no es válido. Debe ser 'alpha' o 'num'`)
                process.exit(1)                     // función de node.js       (1) --> terminó porque hubo un error
            }

            const descending = partes[2] === "desc"     // orden
            if (partes[2] !== "asc" && partes[2] !== "desc") {             // validar orden
                console.error(`Error: El orden '${partes[2]}' no es válido. Debe ser 'asc' o 'desc'`)
                process.exit(1)                     // función de node.js       (1) --> terminó porque hubo un error
            }

            sortFields.push({       // guardar criterio en una lista
                name: name,
                numeric: numeric,
                descending: descending
            })
        } else {
            console.error(`Error: Opción inválida ${process.argv[i]}`)
            process.exit(1)                     // función de node.js       (1) --> terminó porque hubo un error
        }
    }

    if (sortFields.length === 0) {                      // validar existencia de criterio
        console.error("Error: Debe especificar al menos un criterio de ordenamiento con -b / --by")
        process.exit(1)                     // función de node.js       (1) --> terminó porque hubo un error
    }

    return {
        inputFile: inputFile,
        outputFile: outputFile,
        delimiter: delimiter,
        noHeader: noHeader,
        sortFields: sortFields
    }
}

/* FUNCIÓN 2 --> buscar y leer el archivo que pidió el usuario */
/* const fs = require("fs") */        // fs es File System, sirve para leer archivos, es una librería de node.js
import fs from "fs"           // solución a 'const fs = require("fs")' ya que daba error por la configuración en package.json

function readInput(inputFile) {
    try {
        const contenido = fs.readFileSync(inputFile, "utf-8")
        return contenido
    } catch (error) {
        console.error(`Error: No se puede leer el archivo de origen ${inputFile}`)
        process.exit(1)
    }
}

/* FUNCIÓN 3 --> convertir texto en array con filas y columnas */
function parseDelimited(contenido, delimiter) {
    const lineasTexto = contenido.trim().split("\n")           // separar el texto en distintas líneas
    // trim quita espacios o saltos de línea vacíos del final
    const filas = []            // array para acumular las filas

    for (let i = 0; i < lineasTexto.length; i++) {
        const lineaLimpia = lineasTexto[i].replace("\r", "")        // eliminar salto de linea
        const fila = lineaLimpia.split(delimiter)                   // separar las lineas en columnas según el delimitador
        filas.push(fila)                // agregar la fila al array
    }

    return filas
}

/* FUNCIÓN 4 --> recibir filas y criterios para ordenar */
function sortRows(filas, args) {
    if (filas.length === 0) return []
    let encabezado = null
    let datos = filas

    if (!args.noHeader) {     // sacar encabezado (si es que hay)
        encabezado = filas[0]
        datos = filas.slice(1) // slice copia todo desde la fila 1 en adelante
    }

    const criterios = args.sortFields.map(function (campo) {       // buscar posición del índice de cada columna a ordenar
        let indiceColumna = -1

        if (args.noHeader) {
            indiceColumna = parseInt(campo.name, 10)            // convertir texto a número (ej: "2" a 2)
        } else {
            indiceColumna = encabezado.indexOf(campo.name)      // buscar posición en el encabezado
        }

        return {
            index: indiceColumna,
            numeric: campo.numeric,
            descending: campo.descending
        }
    })

    datos.sort(function (filaA, filaB) {             // ordenar lista
        for (let i = 0; i < criterios.length; i++) {
            const criterio = criterios[i]
            let valorA = filaA[criterio.index]
            let valorB = filaB[criterio.index]
            let resultado = 0

            if (criterio.numeric) {                 // comparación
                resultado = Number(valorA) - Number(valorB)
            } else {
                resultado = valorA.localeCompare(valorB)
            }

            if (resultado !== 0) {              // invertir comparación si hay otro orden (ej: descendente)
                return criterio.descending ? -resultado : resultado
            }
        }
        return 0            // si son iguales en el criterio se pasa al siguiente
    })

    if (encabezado) {               // se pone encabezado al inicio (si es que hay)
        return [encabezado, ...datos]
    }

    return datos
}

/* FUNCIÓN 5 --> contrario a parseDelimited (convierte array en texto) */
function serialize(filas, delimiter) {
    const lineasTexto = []

    for (let i = 0; i < filas.length; i++) {
        const filaActual = filas[i]
        const lineaUnida = filaActual.join(delimiter)		// unir elementos de la fila actual con delimitador
        lineasTexto.push(lineaUnida)			// agregar línea al array
    }

    return lineasTexto.join("\n") + "\n"		// unir líneas con salto de línea
}

/* FUNCIÓN 6 --> guardar texto en el archivo pedido */
function writeOutput(outputFile, contenido) {
    try {
        fs.writeFileSync(outputFile, contenido)         // craer archivo y guardar contenido
    } catch (error) {
        console.error(`Error: No se puede escribir el archivo de destino '${outputFile}'`)
        process.exit(1)
    }
}

const args = parseArgs()
const contenido = readInput(args.inputFile)
const filas = parseDelimited(contenido, args.delimiter)
const filasOrdenadas = sortRows(filas, args)
const textoOrdenado = serialize(filasOrdenadas, args.delimiter)

writeOutput(args.outputFile, textoOrdenado)