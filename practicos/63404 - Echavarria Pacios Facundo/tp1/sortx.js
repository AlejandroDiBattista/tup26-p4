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
let params = process.argv.slice(2)

// 1. parseArgs      → leer los argumentos y construir la configuración
// 2. readInput      → leer el archivo de origen
// 3. parseDelimited → convertir el texto en filas y columnas
// 4. sortRows       → ordenar las filas
// 5. serialize      → reconstruir el texto delimitado
// 6. writeOutput    → escribir el archivo de destino

// {
//     inputFile: "empleados.csv",
//     outputFile: "ordenados.csv",
//     delimiter: ",",
//     noHeader: false,
//     sortFields: [ { name: "apellido", numeric: false, descending: false } ]
// }

//Funcion para mostar errores
const showError = (message) => {
    console.error(`Error: ${message}`)
    process.exit(1)
}

//Funcion para parsear el argumento de --by
const parseBy = (arg) => {
    const [name, numeric, descending] = arg.split(':')

    const sortConfig = {
        name: name,
        numeric: false,
        descending: false
    }

    if (numeric === 'num') {
        sortConfig.numeric = true
    }else if (numeric === "alpha" || "" || undefined) {
        sortConfig.numeric = false
    }else {
        showError("Los valores aceptados para tipo son solo 'alpha' y 'num'. Para mas informacion ejecute el comando --help. ")
    }
    
    if (descending === 'desc') {
        sortConfig.descending = true
    }else if (descending === "asc" || "" || undefined) {
        sortConfig.descending = false
    }else {
        showError("Los valores aceptados para orden son solo 'asc' y 'desc'. Para mas informacion ejecute el comando --help. ")
    }
    
    return sortConfig
}

//Funcion para validar el delimitador
const validateDelimiter = (delimiter) => {
    if (delimiter == "/t") {
        return delimiter
    }

    if (delimiter.length != 1) {
        showError("El delimitador no pude ser de nas de 1 caracter")
        return
    }

    return delimiter
}

//Funcion para leer los argumentos y construir la configuración
const parseArgs = (args) => {
    let configuration = {
        inputFile: "",
        outputFile: "",
        delimiter: ",",
        noHeader: false,
        sortFields: []
    }


    if (args.length === 0) {
        showError("No se recibieron parametros.")
        return
    }

    let inputOutput = []

    while (args.length > 0) {
        let nextArg = args.shift()

        if (nextArg[0] === '-') {
            switch (nextArg) {
                case "-h":
                case "--help":
                    console.log(HELP)
                    process.exit(0)
                    break;
                case "-nh":
                case "--no-header":
                    configuration.noHeader = true
                    break;

                case "-d":
                case "--delimiter":
                    if (args[0] !== undefined) {
                        configuration.delimiter = validateDelimiter(args.shift())
                    }else {
                        showError(`Falta argumento despues de ${nextArg}.`)
                    }
                    break;

                case "-b":
                case "--by":
                    if (args[0] !== undefined) {
                        configuration.sortFields.push(parseBy(args.shift()))
                    }else {
                        showError(`Falta argumento despues de ${nextArg}.`)
                    }
                    break;
            
                default:
                    showError(`Argumento desconocido ${nextArg}.`)
                    break;
            }
            
        }else {
            inputOutput.push(nextArg)
        }
    }

    if (inputOutput.length > 2) {
        showError("Se recibieron mas de 2 argumentos posicionales.")
        return
    }else if (inputOutput.length < 2) {
        showError("Falta el archivo de origen o destino.")
        return
    }

    const [inputFile, outputFile] = inputOutput
    configuration.inputFile = inputFile
    configuration.outputFile = outputFile
}
