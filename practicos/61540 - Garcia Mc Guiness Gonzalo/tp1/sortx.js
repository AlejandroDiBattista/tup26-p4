#!/usr/bin/env node
import fs from "node:fs"
// `
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
function errores(mensaje) {
    console.error(`Error: ${mensaje}`)
    process.exit(1)
}

function parseArgs(argv)    {
    const configuracion = {
        inputFile: null,
        outputFile: null,
        delimiter: ",",
        noHeader: false,
        sortFields:[]
    }
    const args = argv

    if (args.includes("-h") || args.includes("--help")){
        console.log(HELP)
        process.exit(0)
    }

    for (let i = 0; i < argv.length; i++) {

        const arg = argv[i]

        if (arg === '-b' || arg === '--by') {
            if (i + 1 >= args.length) errores("La opcion '-b' o '--by' no recibe su valor.")
            const campo = args[i+1]
            
            const parts = campo.split(":")
            const name = parts[0]
            if (!name) errores("El nombre de campo en '-b' o '--by' esta vacio.")
            
            let numeric = false
            let descending = false

            for (let j = 1; j < parts.length; j++){               
                if (parts[j] === "num") numeric = true;
                else if (parts[j] === "alpha") numeric = false;
                else if (parts[j] === "asc") descending = false;
                else if (parts[j] === "desc") descending = true;
                else errores(`Modificador desconocido '${parts[j]}' en el criterio '-b' o '--by'.`)
            }

            configuracion.sortFields.push({name, numeric, descending})
            i++
        } else if (arg === '-d' || arg === '--delimiter'){
            if (i + 1 >= args.length) errores("La opcion de '-d' o '--delimiter' no recibe su valor.")
            let rawDelimiter = args[i+1]

            if (rawDelimiter === '\\t') rawDelimiter = '\t';
            if (rawDelimiter === '\\n') rawDelimiter = '\n';
            if (rawDelimiter === '\\r') rawDelimiter = '\r';
            
            configuracion.delimiter = rawDelimiter
            i++            
        } else if (arg === '-nh' || arg === '--no-header'){
            configuracion.noHeader = true
        } else if (arg.startsWith("-")){
            errores(`Se indica una opcion desconocida '${arg}'`)
        } else {
            if (!configuracion.inputFile) {
                configuracion.inputFile = arg
            } else if (!configuracion.outputFile) {
                configuracion.outputFile = arg
            } else {
                errores(`Se indica un argumento inesperado '${arg}'`)
            }
        } 
    }
    
    if (!configuracion.inputFile || !configuracion.outputFile) {
        errores("Falta archivo de origen o destino.")
    }
    if (configuracion.sortFields.length === 0) {
        errores("Falta el criterio de campo -b o --by.")
    }
    if (!configuracion.delimiter || configuracion.delimiter.length !== 1){
        errores("El delimitador no es un solo caracter.")
    }

    return configuracion
}
function readInput(filePath){
    try {
        return fs.readFileSync(filePath, "utf8")
    } catch (error) {
        errores(`EL archivo de origen no existe o no se puede leer: ${filePath}`)
    }
}

function parseDelimited(text, configuracion) {
    if (text.includes('"')) errores("El archivo de origen contiene comillas dobles.")
    const lineas = text.split (/\r?\n/).filter(linea => linea.trim() !== "")

    if (lineas.length === 0) {
        return {header: [], rows: []}
    }

    const todasLasFilas = lineas.map(linea => linea.split(configuracion.delimiter))
    const camposEsperados = todasLasFilas[0].length

    for (let i = 0; i < todasLasFilas.length; i++) {
        if (todasLasFilas[i].length !== camposEsperados) {
            errores("Las filas tienen diferente cantidad de campos.")
        }
    }

    let header = []
    let rows = []

    if (configuracion.noHeader) {
        header = Array.from({length: camposEsperados}, (_, i) => i.toString())
        rows = todasLasFilas
    } else {
        header = todasLasFilas[0].map(h => h.trim())
        rows = todasLasFilas.slice(1)
    }

    configuracion.sortFields.forEach(campo => {
        if (!header.includes(campo.name)) errores(`El campo solicitado no existe: '${campo.name}'`)        
    })

    return {header, rows}
}

function sortRows(data, configuracion) {
    const {header, rows} = data

    return rows.sort((filaA, filaB) => {
        for(const campo of configuracion.sortFields) {
            
            const indiceCampo = header.indexOf(campo.name)

            const valorA = filaA[indiceCampo]
            const valorB = filaB[indiceCampo]

            if (campo.numeric) {
                const numA = Number(valorA)
                const numB = Number(valorB)

                if (isNaN(numA) || valorA.trim() === "") {
                    errores(`Un valor no numerico en el campo '${campo.name}': '${valorA}'`)
                }
                if (isNaN(numB) || valorB.trim() === "") {
                    errores(`Un valor no numerico en el campo '${campo.name}': '${valorB}'`)
                }

                if (numA !== numB) {
                    return campo.descending ? numB - numA : numA - numB
                }
            } else {

                const comparacionAlf = valorA.localeCompare(valorB)

                if (comparacionAlf !== 0) {
                    return campo.descending ?  -comparacionAlf : comparacionAlf
                }
            }
        }
        return 0
    })
}

function main(){

    const config = parseArgs(process.argv.slice(2))

    const contenidoCsv = readInput(config.inputFile)

    const datosMapeados = parseDelimited(contenidoCsv, config)

    const filasOrdenadas = sortRows(datosMapeados, config)

    console.log("Configuracion:", config)
    console.log("Filas Ordenadas:", filasOrdenadas)
}

main()