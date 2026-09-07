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

import fs from "fs"

function parseSortField(valor) {
    const partes = valor.split(":")
    const nombre = partes[0]
    const tipo = partes[1] || "alpha"
    const orden = partes[2] || "asc"

    return {
        name: nombre,
        numeric: tipo === "num",
        descending: orden === "desc"
    }
}

function parseArgs(arg) {
    let configuracion = {
        delimiter: ",",
        noHeader: false,
        sortFields: []
    }
    let ubicacion = []

    while (arg.length > 0) {
        const opcion = arg.shift()
        if (opcion === "--by" || opcion === "-b") {
            let campo = arg.shift()
            configuracion.sortFields.push(parseSortField(campo))   
        } else if (opcion === "--delimiter" || opcion === "-d") {
            let valor = arg.shift()
            configuracion.delimiter = valor
        } else if (opcion === "--no-header" || opcion === "-nh") {
            configuracion.noHeader = true
        } else if (opcion === "--help" || opcion === "-h") {
            console.log(HELP)
            process.exit(0)
        } else if (opcion.startsWith("-")) {
            console.error(`Error: opción desconocida "${opcion}".`)
            process.exit(1)
        } else {
            ubicacion.push(opcion)
        }
    }

    if (ubicacion.length < 1) {
        console.error("Error: falta el archivo de origen.")
        process.exit(1)
    }
    if (ubicacion.length < 2) {
        console.error("Error: falta el archivo de destino.")
        process.exit(1)
    }

    configuracion.inputFile = ubicacion[0]
    configuracion.outputFile = ubicacion[1]

    if (configuracion.sortFields.length === 0) {
        console.error("Error: debe especificar al menos un criterio -b/--by.")
        process.exit(1)
    }

    return configuracion
}

function readInput(inputFile) {
    try {
        const contenido = fs.readFileSync(inputFile, "utf8")
        return contenido
    } catch {
        console.error(`Error: no se pudo leer el archivo "${inputFile}".`)
        process.exit(1)
    }
}

function parseDelimited(texto, delimiter) {
   const lineas = texto.split(/\r?\n/).filter(linea => linea.trim() !== "")
    const filas = []
    let cantidadColumnas = null

    for (const linea of lineas) {
        if (linea.includes('"')) {
            console.error("Error: la entrada contiene comillas dobles.")
            process.exit(1)
        }

        const columnas = linea.split(delimiter)

        if (cantidadColumnas === null) {
            cantidadColumnas = columnas.length
        } else if (columnas.length !== cantidadColumnas) {
            console.error("Error: las filas tienen diferente cantidad de campos.")
            process.exit(1)
        }

        filas.push(columnas)
    }
    return filas
}

const config = parseArgs(process.argv.slice(2))
const texto = readInput(config.inputFile)
const filas = parseDelimited(texto, config.delimiter)
console.log(filas)