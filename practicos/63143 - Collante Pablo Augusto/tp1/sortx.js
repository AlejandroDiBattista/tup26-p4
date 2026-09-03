#!/usr/bin/env node
import { readFileSync } from 'node:fs';

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

//* 1. parseArgs      → leer los argumentos y construir la configuración
//* 2. readInput      → leer el archivo de origen
//? 3. parseDelimited → convertir el texto en filas y columnas
//? 4. sortRows       → ordenar las filas
//? 5. serialize      → reconstruir el texto delimitado
//? 6. writeOutput    → escribir el archivo de destino


const args = process.argv.slice(2);

function parseArgs(args) {

    if (args.includes('-h') || args.includes('--help')) {
        console.log(HELP)
        process.exit(0)
    }

    const config = {
        inputFile: null,
        outputFile: null,
        delimiter: ',',
        noHeader: false,
        sortFields: []
    };


    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "-nh" || arg === "--no-header") {
            config.noHeader = true;
        } else if (arg === "-d" || arg === "--delimiter") {
            if (i + 1 >= args.length) {
                console.error("Error: Falta el valor para delimitar")
                process.exit(1);
            }
            config.delimiter = args[++i];
            if (config.delimiter === "\\t") config.delimiter = "\t";
        } else if (arg === "-b" || arg === "--by") {
            if (i + 1 >= args.length) {
                console.error("Error: Falta el valor para ordenar")
                process.exit(1);
            }
            const parts = args[++i].split(':');
            config.sortFields.push({
                name: parts[0],
                numeric: parts[1] === 'num',
                descending: parts[2] === 'desc'
            });
        } else if (!arg.startsWith('-')) {
            if (!config.inputFile) {
                config.inputFile = arg;
            } else if (!config.outputFile) {
                config.outputFile = arg;
            }
        }
        else {
            console.error(`Error: Opción desconocida ${arg}`);
            process.exit(1);
        }
    }
    if (!config.inputFile) {
        console.error("Error: Falta el archivo de origen");
        process.exit(1);
    }
    if (!config.outputFile) {
        console.error("Error: Falta el archivo de destino");
        process.exit(1);
    }
    if (config.delimiter.length !== 1) {
        console.error("Error: El delimitador debe ser un solo carácter");
        process.exit(1);
    }
    if (config.sortFields.length === 0) {
        console.error("Error: No se especificó ningún criterio de ordenamiento");
        process.exit(1);
    }

    return config;
}


function readInput(filePath) {
    try {
        const archivo = readFileSync(filePath, 'utf-8');
        return archivo;
    }
    catch (error) {
        console.error(`Error: No se pudo leer el archivo de origen ${filePath}`);
        process.exit(1);
    }
}

function parseDelimited(texto, delimiter) {
    const lines = texto.split('\n');
    const rows = lines.map(line => line.split(delimiter));
    return rows;
}


const config = parseArgs(args);
const inputData = readInput(config.inputFile);
const parsedData = parseDelimited(inputData, config.delimiter);
console.log(config);
console.log(inputData);
console.log(parsedData);
