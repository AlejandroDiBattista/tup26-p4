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

// Lectura de argumentos y construccion de la configuracion
function parseArgs(argv){
    
    const config = {
        inputFile: null,
        outputFile: null,
        delimiter: ',',
        noHeader: false,
        sortFields: [ { name: null, numeric: false, descending: false } ],
    }

    const positionalArgs = []

    for (let index = 0; index < argv.length; index++) {
        const token = argv[index]
        
        
        if (token === '-b' || token === '--by') {
            index++ 
            if (index >= argv.length) throw new Error("La opcion --by requiere un valor") 
            config.sortFields.push(interpretarCriterio(argv[index]))  
        }
        else if (token === '-nh' || token === '--no-header') {
            config.noHeader = true
        }
        else if (token === '-d' || token === '--delimiter') {
            index++
            // aca tambien aplicamos manejos de errores
            if (index >= argv.length) throw new Error ("La opcion --delimiter requiere un valor")
            config.delimiter = resolveDelimiter(argv[index])
            if(config.delimiter.length !== 1) throw new Error ("El delimitador debe ser un unico caracter")
        }
        else if (token.startsWith('-')) {
            console.log('opcion desconocida: "' + token + '"')
        }
        else {
            positionalArgs.push(token)
        } 
    }

    if (positionalArgs.length < 1) throw new Error("Falta el archivo de origen")

    if (positionalArgs.length < 2) throw new Error("Falta el archivo de destino")

    config.inputFile = positionalArgs[0]
    
    config.outputFile = positionalArgs[1]
}

// Esta funcion se usa para resolver cuando un delimitador es una tabulacion
function resolveDelimiter(text) {
    if (text === '\\t') return '\t'
    return text
}

