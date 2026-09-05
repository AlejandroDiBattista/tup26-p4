#!/usr/bin/env node
import fs from "node:fs"

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

// 1. parseArgs      → leer los argumentos y construir la configuración. Listo
// 2. readInput      → leer el archivo de origen. Listo
// 3. parseDelimited → convertir el texto en filas y columnas. Listo
// 4. sortRows       → ordenar las filas.
// 5. serialize      → reconstruir el texto delimitado.
// 6. writeOutput    → escribir el archivo de destino.

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

    if (!name || name.trim() === "") {
        showError("El campo de orden no puede estar vacío.");
    }

    if (numeric === 'num') {
        sortConfig.numeric = true
    }else if (numeric === "alpha" || !numeric) {
        sortConfig.numeric = false
    }else {
        showError("Los valores aceptados para tipo son solo 'alpha' y 'num'. Para mas informacion ejecute el comando --help. ")
    }
    
    if (descending === 'desc') {
        sortConfig.descending = true
    }else if (descending === "asc" || !descending) {
        sortConfig.descending = false
    }else {
        showError("Los valores aceptados para orden son solo 'asc' y 'desc'. Para mas informacion ejecute el comando --help. ")
    }
    
    return sortConfig
}

//Funcion para validar el delimitador
const validateDelimiter = (delimiter) => {
    if (delimiter === `\\t`) {
        return delimiter
    }

    if (delimiter.length != 1) {
        showError("El delimitador no pude ser de nas de 1 caracter")
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
    }else if (inputOutput.length < 2) {
        showError("Falta el archivo de origen o destino.")
    }

    const [inputFile, outputFile] = inputOutput
    configuration.inputFile = inputFile
    configuration.outputFile = outputFile

    if (configuration.sortFields.length === 0) {
        showError("El argumento --by no puede estar vacio.")
    }

    return configuration
}

// El programa debe admitir archivos delimitados por un único carácter, por ejemplo:

// CSV separado por comas;
// TSV separado por tabulaciones;
// PSV separado por barras verticales;
// archivos separados por punto y coma.
// Los campos entre comillas no están admitidos. Ningún campo puede contener el delimitador ni un salto de línea.

// Todas las filas deben tener la misma cantidad de campos. Si una fila tiene una cantidad diferente, el programa debe informar un error.

// El archivo de destino debe conservar el mismo delimitador utilizado para leer el archivo de origen.

//Funcion para leer el archivo de origen
const readInput = (inputFile) => {
    try {
        const data = fs.readFileSync(inputFile, 'utf-8')
        if (data.includes('"')) {
            showError("El archivo de informacion no puede conterner comillas.")
        }
        return data
    } catch (error) {
        showError(error.message)
    }
}

//convertir el texto en filas y columnas.
const parseDelimited = (text, delimiter) => {
    const cleanText = text.replace(/\r/g, "").trim();

    let data = cleanText.split("\n")

    data = data.map(e => e.split(delimiter))

    for (const element of data) {
        if (data[0].length != element.length) {
            showError("Todas las filas tiene que tener la misma cantidad de campos.")
        }
    }

    return data
}

//reconstruir el texto delimitado
const serialize = (data, delimiter) => {
    data = data.map(e => e.join(delimiter))

    return data.join('\n')
}

//escribir el archivo de destino.
const writeOutput = (outputFile, text) => {
    try {
        fs.writeFileSync(outputFile, text, 'utf-8')
    } catch (error) {
        showError(error.message)
    }
}

const sortx = (args) => {
    let {inputFile, outputFile, delimiter, noHeader, sortFields} = parseArgs(args)

    let inputData = parseDelimited(readInput(inputFile), delimiter)
}

sortx(params)