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
    while (i < args.length) {
        const arg = args[i];
        if (args === "-h" || arg === "--help") {
            console.log(HELP.trim());
            process.exit(0);
        } else if (arg === "-nh" || arg === "--no-header") {
            noHeader = true;
            i++;
        } else if (arg === "-d" || arg === "--delimiter") {
            const val = args[i + 1];
            if (val === undefined) {
                throw new Error("la opcion requiere un delimitador");
            }
            delimiter = val === "\\t" ? "\t" : val;
            if ([...delimiter].length !== 1) {
                throw new Error("El delimitador dese ser un unico caracter");
            }
            i += 2;
        } else if (arg == "-b" || arg == "--by") {
            const val = args[i + 1];
            if (val === undefined || val.startsWith("-")) {
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
function sortRows(rows, sortFields, noHeader) {
    if (rows.length === 0) return [];

    let header = null;
    let dataRows = rows;

    if (!noHeader) {
        header = rows[0];
        dataRows = rows.slice(1);
    }

    const resolvedFields = sortFields.map(sf => {
        let colIndex;
        if (!noHeader) {
            colIndex = header.indexOf(sf.name);
            if (colIndex === -1) {
                throw new Error(`el campo solicitado no existe: ${sf.name}`);
            }
        } else {
            colIndex = Number(sf.name);
            if (Number.isNaN(colIndex) || colIndex < 0 || colIndex >= rows[0].length) {
                throw new Error(`el campo solicitado no existe: ${sf.name}`);
            }
        }
        return {
            colIndex,
            numeric: sf.numeric,
            descending: sf.descending
        };
    });

    dataRows.sort((rowA, rowB) => {
        for (const sf of resolvedFields) {
            const valAStr = rowA[sf.colIndex];
            const valBStr = rowB[sf.colIndex];

            let cmp = 0;
            if (sf.numeric) {
                const numA = Number(valAStr);
                const numB = Number(valBStr);
                if (Number.isNaN(numA) || Number.isNaN(numB)) {
                    throw new Error('un criterio numérico encuentra un valor no numérico');
                }
                cmp = numA - numB;
            } else {
                cmp = valAStr.localeCompare(valBStr, 'es');
            }

            if (cmp !== 0) {
                return sf.descending ? -cmp : cmp;
            }
        }
        return 0;
    });

    return !noHeader ? [header, ...dataRows] : dataRows;
}

function serialize(rows, delimiter) {
    return rows.map(row => row.join(delimiter)).join('\n');
}
function writeOutput(filePath, content) {
    try {
        writeFileSync(filePath, content, 'utf8');
    } catch {
        throw new Error(`no se pudo escribir el archivo de destino: ${filePath}`);
    }
}
function main() {
    try {
        const rawArgs = process.argv.slice(2);
        const config = parseArgs(rawArgs);
        const rawText = readInput(config.inputFile);
        const rows = parseDelimited(rawText, config.delimiter);
        const sorted = sortRows(rows, config.sortFields, config.noHeader);
        const outputText = serialize(sorted, config.delimiter);
        writeOutput(config.outputFile, outputText);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}
main();


