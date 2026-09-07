#!/usr/bin/env node
import { readFileSync } from "fs";
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

function isOption(regular, shorthand, value) {
    return value === `--${regular}` || value === `-${shorthand}`;
}

const isHelp = (value) => isOption('help', 'h', value);
const isBy = (value) => isOption('by', 'b', value);
const isDelimiter = (value) => isOption('delimiter', 'd', value);
const isNoHeader = (value) => isOption('no-header', 'nh', value);

function help() {
    console.log(HELP);
    process.exit(0);
}

function logError(message) {
    console.error(message);
    process.exit(1);
}

function shiftValue(opcion, flag) {
    if (opcion.length === 0) {
        logError(`Falta un valor para la opción ${flag}`);
    }
    
    return opcion.shift();
}

function handleCriterios(opcion) {
    const [name, tipo = 'alpha', orden = 'asc'] = opcion.split(':');

    if (!['alpha', 'num'].includes(tipo)) {
        logError(`Tipo de ordenamiento inválido: ${tipo}`);
    }
    if (!['asc', 'desc'].includes(orden)) {
        logError(`Orden de ordenamiento inválido: ${orden}`);
    }

    return{
        name,
        numeric: tipo === 'num',
        descending: orden === 'desc'
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

            if (config.delimiter.length !== 1) {
                logError(`El delimitador debe ser un único carácter: ${config.delimiter}`);
            }
        } else if (isNoHeader(opcion)) {
            config.noHeader = true;
        } else if (isBy(opcion)) {
            config.sortFields.push(
                handleCriterios(shiftValue(opciones, opcion))
            );
        } else {
            logError(`Opción inválida: ${opcion}`);
        }
    }

    if (config.sortFields.length === 0) {
        logError("Se requiere al menos un criterio -b o --by");
    }

    return config;
}

function parseArgs() {
    const args = process.argv.slice(2);
    if (isHelp(args[0])) {
        return help();
    }

    const [inputFile, outputFile, ...opciones] = args;

    if (!inputFile || !outputFile) {
        logError("falta los archivos de origen o destino");
    }

    const config = parseOpciones(opciones);

    return {
        inputFile,
        outputFile,
        ...config
    };
}

function main() {
    const args = parseArgs();
    const input = readInput(args.inputFile);
    const { header, rows } = parseDelimited(input, args);
    const sortedRows = sortRows(
        rows,
        args.sortFields,
        header
    );

    console.log({
        header,
        rows: sortedRows
    });
}


function separator(input, args) {
    return input
        .split("\n")
        .map(linea => linea.replaceAll("\r", "").split(args.delimiter));
}

function readInput(inputFile) {
    try {
        return readFileSync(inputFile, "utf-8");
    } catch (error) {
        logError(`Error al leer el archivo: ${error.message}`);
    }
}

function parseDelimited(input, args) {
    if (input.includes('"')) {
        logError("La entrada contiene comillas dobles, lo cual no está admitido");
    }

    const filas = separator(input, args);
    const ultima = filas[filas.length - 1];

    if (ultima.length === 1 && ultima[0] === "") {
        filas.pop();
    }

    const cantidadCampos = filas[0].length;

    for (const fila of filas) {
        if (fila.length !== cantidadCampos) {
            logError("Todas las filas deben tener la misma cantidad de campos");
        }
    }

    if (args.noHeader) {
        return {
            header: null,
            rows: filas
        };
    }

    const [header, ...rows] = filas;

    return {
        header,
        rows
    };
}

function compareValues(valorA, valorB, numeric) {
    if (numeric) {
        const numA = Number(valorA);
        const numB = Number(valorB);

        if (Number.isNaN(numA) || Number.isNaN(numB)) {
            const valor = Number.isNaN(numA) ? valorA : valorB;
            logError(`Valor no numérico: ${valor}`);
        }

        return numA - numB;
    }

    return valorA.localeCompare(valorB);
}

function sortRows(rows, sortFields, header) {
    const fields = sortFields.map(field => {
        let index;

        if (header) {
            index = header.indexOf(field.name);
        } else {
            index = Number(field.name);
        }

        if (index === -1 || Number.isNaN(index)) {
            logError(`El campo solicitado no existe: ${field.name}`);
        }

        return {
            ...field,
            index
        };
    });

    rows.sort((a, b) => {
        for (const field of fields) {
            const result = compareValues(
                a[field.index],
                b[field.index],
                field.numeric
            );

            if (result !== 0) {
                return field.descending ? -result : result;
            }
        }

        return 0;
    });

    return rows;
}

main();