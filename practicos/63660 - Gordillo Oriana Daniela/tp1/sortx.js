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
//solución al enunciado.
import { readFileSync, writeFileSync } from "node:fs";

const rawArgs =
    process.argv.slice(2);

if (rawArgs.includes(`-h`) ||
    rawArgs.includes(`--help`)) {
    console.log(HELP.trim());
    process.exit(0);
}

//funcion parseArgs
{
    inputFile; "empleados.csv",
        outputFile; "ordenados.csv",
            delimiter; ",",
                noHeader; false,
                    sortFields;[{ name: "apellido", numeric: false, descending: false }]
}

function parseArgs(args) {
    let inputFile = null;
    let outputFile = null;
    let delimiter = ",";
    let noHeader = false;
    const sortFields = [];

    let i = 0;
    while (i < args.lengh) {
        const arg = args[i];
        if (args === "-h" || arg === "--help") {
            console.log(HELP.trim());
            process.exit(0);
        } else if (arg === "nh" || arg === "--no-header") {
            noHeader = true;
            i++;
        } else if (arg === "-d" || arg === "--delimiter") {
            const val = args[i + 1];
            if (val === underfined) {
                throw new Error("la opcion requiere un delimitador");
            }
            delimiter = val === "//t" ? "/t" : val;
            if ([...delimiter].length !== 1) {
                throw new Error("El delimitador dese ser un unico caracter");
            }
            i += 2;
        } else if (arg == "-b" || arg == "--by") {
            const val = args[i + 1];
            if (val === underfined || val.startsWith("-")) {
                throw new Error('la opcion ${args} requiere un criterio');
            }
            const parts = val.split(':');
            const name = parts[0];
            if (!name) {
                throw new Error('el criterio de ordenamiento no especifica un campo');
            }
            const typeStr = (parts[1] || 'alpha').toLowerCase();
            const orderStr = (parts[2] || 'asc').toLowerCase();
            if (typeStr !== 'alpha' && typeStr !== 'num') {
                throw new Error(`tipo de ordenamiento desconocido: ${typeStr}`);
            }
            if (orderStr !== 'asc' && orderStr !== 'desc') {
                throw new Error(`orden desconocido: ${orderStr}`);
            }
            sortFields.push({
                name,
                numeric: typeStr === 'num',
                descending: orderStr === 'desc'
            });
            i += 2;
        } else if (arg.startsWith('-')) {
            throw new Error(`opción desconocida: ${arg}`);
        } else {
            if (!inputFile) {
                inputFile = arg;
            } else if (!outputFile) {
                outputFile = arg;
            } else {
                throw new Error(`argumento inesperado: ${arg}`);
            }
            i++;
        }
    }
    if (!inputFile) {
        throw new Error('falta indicar el archivo de origen');
    }
    if (!outputFile) {
        throw new Error('falta indicar el archivo de destino');
    }
    if (sortFields.length === 0) {
        throw new Error('debe especificar al menos un criterio de ordenamiento (-b)');
    }
    return { inputFile, outputFile, delimiter, noHeader, sortFields };
}

function readInput(filePath) {
    try {
        return readFileSync(filePath, 'utf8');
    } catch {
        throw new Error(`no se pudo leer el archivo de origen: ${filePath}`);
    }
}

function parseDelimited(content, delimiter) {
    if (content.includes('"')) {
        throw new Error('la entrada contiene comillas dobles');
    }

    const lines = content.split(/\r?\n/).filter(line => line.length > 0);
    if (lines.length === 0) {
        return [];
    }

    const rows = lines.map(line => line.split(delimiter));
    const cantidadCampos = rows[0].length;

    for (let r = 0; r < rows.length; r += 1) {
        if (rows[r].length !== cantidadCampos) {
            throw new Error(`las filas tienen diferente cantidad de campos`);
        }
    }

    return rows;
}



