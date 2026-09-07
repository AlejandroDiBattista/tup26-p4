#!/usr/bin/env node
import fs from 'node:fs'

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
function parseArgs(args) {
    const config = {
        inputFile: null,
        outputFile: null,
        delimiter: ',',
        noHeader: false,
        sortFields: []
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]

        if (arg === '-h' || arg === '--help') {
            console.log(HELP)
            process.exit(0)
        }

        if (arg === '-nh' || arg === '--no-header') {
            config.noHeader = true
            continue
        }

        if (arg === '-d' || arg === '--delimiter') {
            if (i + 1 >= args.length) {
                throw new Error(`Falta el delimitador después de "${arg}"`)
            }

            let delimiter = args[++i]

            if (delimiter === '\\t') {
                delimiter = '\t'
            }

            if (delimiter.length !== 1) {
                throw new Error(
                    `El delimitador debe ser un único carácter. Se recibió: "${delimiter}"`
                )
            }

            config.delimiter = delimiter
            continue
        }

        if (arg === '-b' || arg === '--by') {
            if (i + 1 >= args.length) {
                throw new Error(`Falta el criterio después de "${arg}"`)
            }

            const criterion = args[++i]
            const parts = criterion.split(':')

            if (parts.length > 3) {
                throw new Error(`Criterio inválido: "${criterion}"`)
            }

            const [field, type = 'alpha', order = 'asc'] = parts

            if (field === '') {
                throw new Error('El campo del criterio no puede estar vacío')
            }

            if (type !== 'alpha' && type !== 'num') {
                throw new Error(`Tipo de ordenamiento inválido: "${type}"`)
            }

            if (order !== 'asc' && order !== 'desc') {
                throw new Error(`Orden inválido: "${order}"`)
            }

            config.sortFields.push({
                name: field,
                numeric: type === 'num',
                descending: order === 'desc'
            })

            continue
        }

        if (arg.startsWith('-')) {
            throw new Error(`Opción desconocida: "${arg}"`)
        }

        if (config.inputFile === null) {
            config.inputFile = arg
        } else if (config.outputFile === null) {
            config.outputFile = arg
        } else {
            throw new Error(`Argumento inesperado: "${arg}"`)
        }
    }

    if (config.inputFile === null) {
        throw new Error('Falta el archivo de origen')
    }

    if (config.outputFile === null) {
        throw new Error('Falta el archivo de destino')
    }

    if (config.sortFields.length === 0) {
        throw new Error('Debe indicar al menos un criterio con -b o --by')
    }

    if (config.inputFile === config.outputFile) {
        throw new Error('Los archivos de origen y destino deben ser diferentes')
    }

    return config
}


function readInput(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8')
    } catch (error) {
        throw new Error(`No se pudo leer el archivo de origen: "${filePath}"`)
    }
}


function parseDelimited(text, delimiter) {
    if (text.includes('"')) {
        throw new Error('El archivo no puede contener comillas')
    }

    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const lines = normalizedText.split('\n')

    if (lines[lines.length - 1] === '') {
        lines.pop()
    }

    if (lines.length === 0) {
        throw new Error('El archivo de origen está vacío')
    }

    const rows = lines.map(line => line.split(delimiter))
    const columnCount = rows[0].length

    for (let i = 0; i < rows.length; i++) {
        if (rows[i].length !== columnCount) {
            throw new Error(
                `La fila ${i + 1} tiene ${rows[i].length} columnas; se esperaban ${columnCount}`
            )
        }
    }

    return rows
}


function sortRows(rows, sortFields, noHeader) {
    const header = noHeader ? null : rows[0]
    const dataRows = noHeader ? [...rows] : rows.slice(1)
    const columnCount = rows[0].length

    const criteria = sortFields.map(field => {
        let index

        if (noHeader) {
            if (!/^\d+$/.test(field.name)) {
                throw new Error(`Índice de columna inválido: "${field.name}"`)
            }

            index = Number(field.name)
        } else {
            index = header.indexOf(field.name)

            if (index === -1) {
                throw new Error(`No existe la columna: "${field.name}"`)
            }
        }

        if (index < 0 || index >= columnCount) {
            throw new Error(`Índice de columna fuera de rango: ${index}`)
        }

        return {
            ...field,
            index
        }
    })

    for (const criterion of criteria) {
        if (!criterion.numeric) {
            continue
        }

        for (const row of dataRows) {
            if (row[criterion.index].trim() === '' ||
                Number.isNaN(Number(row[criterion.index]))) {
                throw new Error(
                    `La columna "${criterion.name}" contiene un valor no numérico`
                )
            }
        }
    }

    dataRows.sort((rowA, rowB) => {
        for (const criterion of criteria) {
            const valueA = rowA[criterion.index]
            const valueB = rowB[criterion.index]

            let comparison

            if (criterion.numeric) {
                comparison = Number(valueA) - Number(valueB)
            } else {
                comparison = valueA.localeCompare(valueB)
            }

            if (comparison !== 0) {
                return criterion.descending ? -comparison : comparison
            }
        }

        return 0
    })

    return noHeader ? dataRows : [header, ...dataRows]
}

function serialize(rows, delimiter) {
    return rows.map(row => row.join(delimiter)).join('\n')
}

function writeOutput(filePath, content) {
    try {
        fs.writeFileSync(filePath, content, 'utf-8')
    } catch (error) {
        throw new Error(`No se pudo escribir el archivo de destino: "${filePath}"`)
    }
}

function main() {
    try {
        const config = parseArgs(process.argv.slice(2))
        const input = readInput(config.inputFile)
        const rows = parseDelimited(input, config.delimiter)
        const sortedRows = sortRows(
            rows,
            config.sortFields,
            config.noHeader
        )
        const output = serialize(sortedRows, config.delimiter)

        writeOutput(config.outputFile, output)
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exitCode = 1
    }
}

main()