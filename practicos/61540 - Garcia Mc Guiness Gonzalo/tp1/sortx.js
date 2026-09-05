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

    if (args.length < 2){
        console.error("Falta archivo de origen o destino.")
        process.exit(1)
    }

    configuracion.inputFile = args[0]
    configuracion.outputFile = args[1]

    for (let i = 2; i < argv.length; i++) {

        const arg = argv[i]

        if (arg === '-b' || arg === '--by') {
            const campo = args[i+1]
            if (campo){
                configuracion.sortFields.push(campo)
            }
            i++
        } else if (arg === '-d' || arg === '--delimiter'){
            configuracion.delimiter = args[i+1] || ","
            i++
        } else if (arg === '-nh' || arg === '--no-header'){
            configuracion.noHeader = true
        }

        
    }
    return configuracion
}
const config = parseArgs(process.argv.slice(2))
console.log(config)