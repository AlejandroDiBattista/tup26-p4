#!/usr/bin/env node
import fs from "fs"
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

// 1. parseArgs      → leer los argumentos y construir la configuración
// 2. readInput      → leer el archivo de origen
// 3. parseDelimited → convertir el texto en filas y columnas
// 4. sortRows       → ordenar las filas
// 5. serialize      → reconstruir el texto delimitado
// 6. writeOutput    → escribir el archivo de destino

function parseArgs(args) {
    if (args?.[0] == "-h" || args?.[0] == "--help") {
        console.log(HELP)
        process.exit(0)
    }

    let configuracion = {
        inputFile:  null, outputFile: null,
        sortFields: [],
        delimiter: ",",   noHeader: false,   
    }

    configuracion.inputFile  = args.shift()
    configuracion.outputFile = args.shift()

    while (args.length > 0) {
        let arg = args.shift()
        switch (arg) {
            case "-b": 
            case "--by":
                let criterio = args.shift()
                let [campo, tipo, orden] = criterio.split(":")
                configuracion.sortFields.push({
                    name: campo,
                    numeric: tipo === "num",
                    descending: orden === "desc"
                })
                break
            case "-d":
            case "--delimiter":
                configuracion.delimiter = args.shift().replaceAll("\\t", "\t")
                break
            case "-nh":
            case "--no-header":
                configuracion.noHeader = true
                break
            default:
                console.error(`Opción desconocida: ${arg}`)
                process.exit(1)
        }
    }
    return configuracion;
}

function readInput(filePath) {
    let texto = fs.readFileSync(filePath, "utf-8")
    return texto.replaceAll("\r\n", "\n")
}

function parseDelimited(texto, delimiter, noHeader) {
    let rows = texto.split("\n").map(fila => fila.split(delimiter))
    let header = null
    if (!noHeader) {
        header = rows.shift()
    } else {
        header = rows[0].map((_, index) => `${index}`)
    }
    return { header, rows }
}

function sortRows(header, rows, sortFields) {
    let rows = [...rows]
    for (let field of sortFields) {
        field.index = header.indexOf(field.name)
    }
    rows.sort((a, b) => {
        for (let {index, numeric, descending} of sortFields) {
            let valorA = a[index], valorB = b[index]
            let resultado = numeric ? Number(valorA) - Number(valorB) : valorA.localeCompare(valorB)
            if (resultado !== 0) {
                return descending ? -resultado : resultado
            }
        }
        return 0
    })
    return {header, rows}
}

function serialize(header, rows, delimiter, noHeader) {
    let filas = []
    if (!noHeader) {
        filas.push(header.join(delimiter))
    }
    for (let fila of rows) {
        filas.push(fila.join(delimiter))
    }
    return filas.join("\n")
}

function writeOutput(filePath, texto) {
    fs.writeFileSync(filePath, texto, "utf-8")
}

let parametros = process.argv.slice(2)
let configuracion = parseArgs(parametros)

let texto  = readInput(configuracion.inputFile)
let parsed = parseDelimited(texto, configuracion.delimiter, configuracion.noHeader)
let sorted = sortRows(parsed.header, parsed.rows, configuracion.sortFields)

let ouput = serialize(sorted.header, sorted.rows, configuracion.delimiter, configuracion.noHeader)
writeOutput(configuracion.outputFile, ouput)