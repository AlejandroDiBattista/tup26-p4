#!/usr/bin/env node

const fs = require("fs");
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
    if (args.includes("--help") || args.includes("-h")) {
        console.log(HELP);
        process.exit(0);
    }

    let config = {
        inputFile: null,
        outputFile: null,
        delimiter: ",",
        noHeader: false,
        sortFields: []
    };

    let archivos = [];

    for (let i = 0; i < args.length; i++) {
        let arg = args[i];

        if (arg === "-b" || arg === "--by") {
            config.sortFields.push(parseSortField(args[++i]));
        }
        else if (arg === "-d" || arg === "--delimiter") {
            let delimiter = args[++i];

            if (delimiter === "\\t" || delimiter === "`t") {
                delimiter = "\t";
            }

            config.delimiter = delimiter;
        }
        else if (arg === "-nh" || arg === "--no-header") {
            config.noHeader = true;
        }
        else {
            archivos.push(arg);
        }
    }

    config.inputFile = archivos[0];
    config.outputFile = archivos[1];

    return config;
}

function main() {
    let config = parseArgs(process.argv.slice(2));

    console.log(config);
}

main();