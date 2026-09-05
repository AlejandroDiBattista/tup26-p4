#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises"

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

function parseArgs(argv) {
    // si el usuario pide ayuda se muestra y se sale
    if (argv.includes("--help") || argv.includes("-h")) {
        console.log(HELP)
        process.exit(0)
    }
    const args = argv.slice(0)
    if (args.length < 1 || args[0].startsWith("-")) {
        throw new Error("Falta el archivo de origen.")
    }
    const inputFile = args.shift()
    if (args.length < 1 || args[0].startsWith("-")) {
        throw new Error("Falta el archivo de destino.")
    }
    const outputFile = args.shift()
    const config = {
        inputFile,
        outputFile,
        delimiter: ",",
        noHeader: false,
        sortFields: []
    }
    // se procesan el resto de las opciones
    let i = 0
    while (i < args.length) {
        const arg = args[i]
        if (arg === "--by" || arg === "-b") {
            i++
            if (i >= args.length) {
                throw new Error(`La opcion "${arg}" necesita un valor.`)
            }
            config.sortFields.push(parseSortField(args[i]))
        } else if (arg === "--delimiter" || arg === "-d") {
            i++
            if (i >= args.length) {
                throw new Error(`La opcion "${arg}" necesita un valor.`)
            }
            const delim = args[i]
            const resolvedDelim = delim === "\\t" ? "\t" : delim
            if ([...resolvedDelim].length !== 1) {
                throw new Error(`El delimitador debe ser exactamente un caracter. Se recibio: "${delim}"`)
            }
            config.delimiter = resolvedDelim
        } else if (arg === "--no-header" || arg === "-nh") {
            config.noHeader = true
        } else if (arg.startsWith("-")) {
            throw new Error(`Opcion desconocida: "${arg}"`)
        } else {
            throw new Error(`Argumento inesperado: "${arg}"`)
        }
        i++
    }
    if (config.sortFields.length === 0) {
        throw new Error("Debe especificar al menos un criterio de ordenamiento con --by (-b).")
    }
    return config
}
// parsea una expresion del tipo: campo[:tipo[:orden]]
function parseSortField(expr) {
    const partes = expr.split(":")
    const name = partes[0]
    const tipoRaw = partes[1] ?? "alpha"
    const ordenRaw = partes[2] ?? "asc"
    if (tipoRaw !== "alpha" && tipoRaw !== "num") {
        throw new Error(`Tipo de ordenamiento invalido: "${tipoRaw}". Debe ser "alpha" o "num".`)
    }
    if (ordenRaw !== "asc" && ordenRaw !== "desc") {
        throw new Error(`Orden invalido: "${ordenRaw}". Debe ser "asc" o "desc".`)
    }
    return {
        name,
        numeric: tipoRaw === "num",
        descending: ordenRaw === "desc"
    }
}

// readInput — lee el archivo de origen
async function readInput(filePath) {
    try {
        const contenido = await readFile(filePath, "utf8")
        return contenido
    } catch (error) {
        if (error.code === "ENOENT") {
            throw new Error(`El archivo de origen no existe: "${filePath}"`)
        }
        throw new Error(`No se pudo leer el archivo "${filePath}": ${error.message}`)
    }
}

// parseDelimited — convierte texto en filas y columnas
function parseDelimited(text, delimiter, noHeader) {
    // se divide por lineas (maneja \r\n y \n)
    const lineas = text.split(/\r?\n/u)

    // se elimina la ultima linea vacia si el archivo termina con salto de linea
    if (lineas.length > 0 && lineas[lineas.length - 1] === "") {
        lineas.pop()
    }

    if (lineas.length === 0) {
        throw new Error("El archivo de origen esta vacio.")
    }

    // se verifica que no haya comillas dobles (no soportadas)
    for (let i = 0; i < lineas.length; i++) {
        if (lineas[i].includes('"')) {
            throw new Error(`La linea ${i + 1} contiene comillas dobles, que no estan soportadas.`)
        }
    }

    // se parsean todas las filas
    const filas = lineas.map(linea => linea.split(delimiter))

    // se verifica que todas las filas tengan la misma cantidad de campos
    const cantidadEsperada = filas[0].length
    for (let i = 1; i < filas.length; i++) {
        if (filas[i].length !== cantidadEsperada) {
            throw new Error(
                `La fila ${i + 1} tiene ${filas[i].length} campo(s) pero se esperaban ${cantidadEsperada}.`
            )
        }
    }

    // separa el encabezado de los datos
    let header = null
    let rows = filas

    if (!noHeader) {
        header = filas[0]
        rows = filas.slice(1)
    }

    return { header, rows }
}
