#!/usr/bin/env node
import fs from 'fs'

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
// función 1: leer args y construir config

function parseArgs() {
    if (process.argv.includes('-h') || process.argv.includes('--help')) {
        console.log(HELP)
        process.exit(0)
    }

    const inputFile = process.argv[2]
    const outputFile = process.argv[3]

    if (inputFile === undefined || outputFile === undefined) {
        console.error('Error: Debe especificar un archivo de origen y un archivo de destino.')
        process.exit(1)
    }

    let delimiter = ','
    let noHeader = false
    let sortFields = []

    for (let i = 4; i < process.argv.length; i++) {
        const option = process.argv[i]
        if (option === '-d' || option === '--delimiter') {
            if (i + 1 >= process.argv.length) {
                console.error('error: la opción -d requiere un argumento.')
                process.exit(1)
            }
            delimiter = process.argv[++i]

            if (delimiter === '\\t') {
                delimiter = '\t'
            }

            if (delimiter.length !== 1) {
                console.error('error: el delimitador debe ser un solo carácter.')
                process.exit(1)
            }

        } else if (option === '-nh' || option === '--no-header') {
            noHeader = true
        } else if (option === '-b' || option === '--by') {
            if (i + 1 >= process.argv.length) {
                console.error('error: la opción -b requiere un argumento.')
                process.exit(1)
            }

            const criterio = process.argv[++i]
            const partes = criterio.split(':')

            if (partes.length > 3) {
                console.error('error: el criterio de ordenamiento tiene un formato inválido.')
                process.exit(1)
            }

            const nombre = partes[0]

            if (!nombre) {
                console.error('error: el criterio de ordenamiento debe especificar un campo.')
                process.exit(1)
            }

            if (partes[1] !== undefined && partes[1] !== 'alpha' && partes[1] !== 'num') {
                console.error('error: el tipo de ordenamiento debe ser "alpha" o "num".')
                process.exit(1)
            }

            if (partes[2] !== undefined && partes[2] !== 'asc' && partes[2] !== 'desc') {
                console.error('error: el orden de ordenamiento debe ser "asc" o "desc".')
                process.exit(1)
            }

            const numeric = partes[1] === 'num'
            const descending = partes[2] === 'desc'

            sortFields.push({
                name: nombre,
                numeric: numeric,
                descending: descending
            })
        }    else {
            console.error(`error: opción desconocida "${option}".`)
            process.exit(1)
        }
    }
    if (sortFields.length === 0) {
        console.error('error: debe especificar al menos un criterio de ordenamiento con -b.')
        process.exit(1)
    }

    return {
        inputFile,
        outputFile,
        delimiter,
        noHeader,
        sortFields
    }
}

const config = parseArgs()
const contenido = readInput(config.inputFile)
console.log(sortRows(parseDelimited(contenido, config.delimiter), config))

//función 2: leer el archivo de origen

function readInput(inputFile) {
    try {
        const contenido = fs.readFileSync(inputFile, 'utf-8')
        return contenido 
    } catch (error) {
        console.error('error: no se pudo leer el archivo de origen.')
        process.exit(1)
    }
}


//función 3: parseDelimited → convertir el texto en filas y columnas

function parseDelimited(contenido, delimiter) {
    if (contenido.includes('"')) {
        console.error('error: el archivo contiene comillas dobles, lo cual no está permitido.')
        process.exit(1)
    }

    const texto = contenido.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const textoSinFinal = texto.endsWith('\n') 
    ? texto.slice(0, -1) 
    : texto

    if (textoSinFinal === "") {
        return []
    }

    const lineas = textoSinFinal.split('\n')
    const cantidadCampos = lineas[0].split(delimiter).length

    const filas = lineas.map((linea, indice) => {
        const campos = linea.split(delimiter)

        if (campos.length !== cantidadCampos) {
            console.error(`error: la línea ${indice + 1} tiene una cantidad de campos diferente a las demás.`)
            process.exit(1)
        }
        return campos
    })
    return filas
}

//función 4: sortRows → ordenar las filas

function sortRows(filas, args) {
    if (filas.length === 0) {
        return []
    }

    let encabezado
    let registros

    if (args.noHeader) {
        registros = filas.slice()
    } else {
        encabezado = filas[0]
        registros = filas.slice(1)
    }

    const criterios = []

    for (const campo of args.sortFields) {
        let posicion

        if (args.noHeader) {
            posicion = parseInt(campo.name)

            if (
                !Number.isInteger(posicion) ||
                posicion < 0 ||
                posicion >= filas[0].length
            ){
                console.error(`error: el índice de campo "${campo.name}" es inválido.`)
                process.exit(1)
            }
        } else {
            
            posicion = encabezado.findIndex(nombre => nombre === campo.name)

            if (posicion === -1) {
                console.error(`error: el campo "${campo.name}" no existe en el encabezado.`)
                process.exit(1)
            }
        }

        criterios.push({
            index: posicion,
            numeric: campo.numeric,
            descending: campo.descending
        })
    }

    registros.sort((a, b) => {
        for (const criterio of criterios) {

            const valorA = a[criterio.index]
            const valorB = b[criterio.index]

            let comparacion

            if (criterio.numeric) {
                
                /*if (valorA.trim() === '' || valorB.trim() === '') {
                    console.error('error: no se puede ordenar numéricamente con campos vacíos.')
                    process.exit(1)
                }
                
                const numA = Number(valorA)
                const numB = Number(valorB)*/

                if (valorA.trim() === '' || valorB.trim() === ''){
                    console.error('error: no se puede ordenar numéricamente con campos vacíos.')
                    process.exit(1)
                }

                const numeroA = Number(valorA)
                const numeroB = Number(valorB)

                if (!Number.isFinite(numeroA) || !Number.isFinite(numeroB)) {
                    console.error('error: no se puede ordenar numéricamente con campos no numéricos.')
                    process.exit(1)
                }

                comparacion = numeroA - numeroB
            } else {
                comparacion = valorA.localeCompare(valorB)
            }

            if (comparacion !== 0) {
                return criterio.descending 
                ? -comparacion 
                : comparacion
            }
        }

        return 0
    })
    
    if (encabezado !== undefined) {
        registros.unshift(encabezado)
    }

    return registros
}

//función 5: serialize → reconstruir el texto delimitado

function serialize(filas, delimiter) {
    const resultado = filas.map(fila => fila.join(delimiter))

    return resultado.join("\n")
}

// función 6: writeOutput → escribir el archivo de destino

function writeOutput(outputFile, contenido) {
    try {
        fs.writeFileSync(outputFile, contenido, 'utf-8')
        return true
    } catch (error) {
        console.error('error: no se pudo escribir el archivo de destino.')
        process.exit(1)
    }
}