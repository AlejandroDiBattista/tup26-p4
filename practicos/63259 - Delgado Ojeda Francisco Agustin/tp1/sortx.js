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
                        Usá "\\t" para archivos separados por tabulaciones.

    -nh, --no-header    Indica que el archivo no tiene encabezado.
                        Los campos se identifican mediante índices desde cero.

    -h, --help          Muestra esta ayuda.

EJEMPLOS:
    sortx empleados.csv ordenados.csv -b apellido
    sortx empleados.csv salarios.csv -b salario:num:desc
    sortx empleados.csv resultado.csv -b departamento -b salario:num:desc
    sortx datos.csv resultado.csv -nh -b 2:num:desc
    sortx datos.tsv salida.tsv -d "\\t" -b nombre
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
