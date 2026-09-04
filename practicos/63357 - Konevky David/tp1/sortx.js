#!/usr/bin/env node
import { readFileSync } from "node:fs";

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
function isOption(regular,shorthand, value) {
    return value === `--${regular}` || value === `-${shorthand}`;
}
const isHelp = (value) => isOption("help", "h", value);
const isBy = (value) => isOption("by", "b", value);
const isDelimiter = (value) => isOption("delimiter", "d", value);
const isNoHeader = (value) => isOption("no-header", "nh", value);

function help() {
  console.log(HELP);
  process.exit(0);
}

function logError(message) {
  console.error(message);
  process.exit(1);
}

function shiftValue(opciones, flag) {
  if (opciones.length === 0) logError(`${flag} requiere un valor`);
  return opciones.shift();
}



function handleByCriterios(opcion) {
    const [name, tipo = "alpha", orden = "asc"] = opcion.split(":");
    if (!["alpha", "num"].includes(tipo)) {
        logError(`Tipo inválido: ${tipo}`);
    }
    if (!["asc", "desc"].includes(orden)) {
        logError(`Orden inválido: ${orden}`);
    }
    return {
        name,
        numeric: tipo === "num",
        descending: orden === "desc"
    };
}

function parseOpciones(opciones) {
    const config = {
        sortFields: [],
        delimiter: ",",
        noHeader: false
    };

    while (opciones.length > 0) {
        const opcion = opciones.shift();

        if (isDelimiter(opcion)) {
            config.delimiter = shiftValue(opciones, opcion);
        } else if (isNoHeader(opcion)) {
            config.noHeader = true;
        } else if (isBy(opcion)) {
            config.sortFields.push(handleByCriterios(shiftValue(opciones, opcion)));
        } else {
            logError(`Opción inválida: ${opcion}`);
        }
    }

    if (config.sortFields.length === 0) {
        logError(`Se requiere al menos un criterio -b o --by`);
    }

    return config;
}

function parseArgs() {
    const args = process.argv.slice(2);

    if (isHelp(args[0])) return help();

    const [inputFile, outputFile, ...opciones] = args;

    if (!inputFile || !outputFile) return logError(`Falta el archivo de origen o destino`);

    const config = parseOpciones(opciones);

    return { inputFile, outputFile, ...config };
}

const separator = (input, args) => input.split("\n").map(linea => linea.replaceAll('\r', '').split(args.delimiter));

function readInput(inputFile) {
    try {
        return readFileSync(inputFile, "utf-8");
    } catch (error) {
        logError(`Error al leer el archivo: ${error.message}`);
    }
}

function parseDelimited(input, args) {
    const filas = separator(input, args);
    if (args.noHeader) {
        return { header: null, rows: filas };
    }
    const [header, ...rows] = filas;
    return { header, rows };
}

function main() {
    const args = parseArgs();
    const input = readInput(args.inputFile);
    const { header, rows } = parseDelimited(input, args);
    if (args.noHeader) {
        console.log(rows);
    } else {
        console.log(header, rows);
    }
}
main();