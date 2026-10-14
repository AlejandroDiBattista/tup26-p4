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
console.log(HELP)
const fs = require("node:fs");

const ayuda = `Uso:
    sortx origen destino [-b campo[:tipo[:orden]]]...
        [-d delimitador] [-nh] [-h]

Opciones:
    -b, --by          Campo para ordenar. Se puede repetir.
    -d, --delimiter   Delimitador de un caracter. Por defecto: coma.
    -nh, --no-header  Indica que el archivo no tiene encabezado.
    -h, --help        Muestra esta ayuda.`;

function parseArgs(args) {
    const config = {
        inputFile: "",
        outputFile: "",
        delimiter: ",",
        noHeader: false,
        sortFields: [],
        help: false
    };
    const files = [];

    if (args.includes("-h") || args.includes("--help")) {
        config.help = true;
        return config;
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "-b" || arg === "--by") {
            i++;
            if (args[i] === undefined || args[i].startsWith("-")) {
                throw new Error(`Falta el valor de ${arg}.`);
            }
            config.sortFields.push(parseSortField(args[i]));
        } else if (arg === "-d" || arg === "--delimiter") {
            i++;
            if (args[i] === undefined) {
                throw new Error(`Falta el valor de ${arg}.`);
            }
            config.delimiter = args[i] === "\\t" ? "\t" : args[i];
        } else if (arg === "-nh" || arg === "--no-header") {
            config.noHeader = true;
        } else if (arg.startsWith("-")) {
            throw new Error(`Opción desconocida: ${arg}.`);
        } else {
            files.push(arg);
        }
    }

    if (files.length !== 2) {
        throw new Error("Debes indicar el archivo de origen y el de destino.");
    }
    if (config.sortFields.length === 0) {
        throw new Error("Debes indicar al menos un criterio con -b o --by.");
    }
    if (Array.from(config.delimiter).length !== 1) {
        throw new Error("El delimitador debe ser un solo caracter.");
    }

    config.inputFile = files[0];
    config.outputFile = files[1];
    return config;
}

function parseSortField(value) {
    const parts = value.split(":");

    if (parts.length > 3 || parts[0] === "") {
        throw new Error(`Criterio de ordenamiento invalido: ${value}.`);
    }

    const type = parts[1] || "alpha";
    const order = parts[2] || "asc";

    if (type !== "alpha" && type !== "num") {
        throw new Error(`Tipo de ordenamiento invalido: ${type}.`);
    }
    if (order !== "asc" && order !== "desc") {
        throw new Error(`Orden invalido: ${order}.`);
    }

    return {
        name: parts[0],
        numeric: type === "num",
        descending: order === "desc"
    };
}

function readInput(fileName) {
    try {
        return fs.readFileSync(fileName, "utf8");
    } catch (error) {
        throw new Error(`No se pudo leer el archivo '${fileName}': ${error.message}`);
    }
}

function parseDelimited(text, delimiter) {
    if (text.includes('"')) {
        throw new Error("El archivo no puede contener comillas dobles.");
    }

    let cleanText = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (cleanText.endsWith("\n")) {
        cleanText = cleanText.slice(0, -1);
    }
    if (cleanText.length === 0) {
        throw new Error("El archivo de origen esta vacio.");
    }

    const lines = cleanText.split("\n");
    const rows = lines.map(line => line.split(delimiter));
    const columnCount = rows[0].length;

    for (let i = 0; i < rows.length; i++) {
        if (rows[i].length !== columnCount) {
            throw new Error(`La fila ${i + 1} tiene una cantidad distinta de campos.`);
        }
    }

    return rows;
}

function sortRows(rows, sortFields, noHeader) {
    const firstDataRow = noHeader ? 0 : 1;
    const header = noHeader ? [] : rows[0];
    const data = rows.slice(firstDataRow);
    const fields = sortFields.map(field => {
        let columnIndex;

        if (noHeader) {
            if (!/^\d+$/.test(field.name)) {
                throw new Error(`Sin encabezado, el campo '${field.name}' debe ser un indice numerico.`);
            }
            columnIndex = Number(field.name);
        } else {
            columnIndex = header.indexOf(field.name);
            if (columnIndex === -1) {
                throw new Error(`No existe la columna '${field.name}'.`);
            }
        }

        if (columnIndex >= rows[0].length) {
            throw new Error(`No existe la columna '${field.name}'.`);
        }

        if (field.numeric) {
            for (const row of data) {
                const value = row[columnIndex].trim();
                if (value === "" || !Number.isFinite(Number(value))) {
                    throw new Error(`El valor '${row[columnIndex]}' no es numerico.`);
                }
            }
        }

        return { ...field, columnIndex };
    });

    data.sort((rowA, rowB) => {
        for (const field of fields) {
            let result;

            if (field.numeric) {
                result = Number(rowA[field.columnIndex]) - Number(rowB[field.columnIndex]);
            } else {
                result = rowA[field.columnIndex].localeCompare(rowB[field.columnIndex]);
            }

            if (result !== 0) {
                return field.descending ? -result : result;
            }
        }
        return 0;
    });

    return noHeader ? data : [header, ...data];
}

function serialize(rows, delimiter) {
    return rows.map(row => row.join(delimiter)).join("\n") + "\n";
}

function writeOutput(fileName, text) {
    try {
        fs.writeFileSync(fileName, text, "utf8");
    } catch (error) {
        throw new Error(`No se pudo escribir el archivo '${fileName}': ${error.message}`);
    }
}

function main() {
    try {
        const config = parseArgs(process.argv.slice(2));
        if (config.help) {
            console.log(ayuda);
            return;
        }

        const text = readInput(config.inputFile);
        const rows = parseDelimited(text, config.delimiter);
        const sortedRows = sortRows(rows, config.sortFields, config.noHeader);
        const output = serialize(sortedRows, config.delimiter);
        writeOutput(config.outputFile, output);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exitCode = 1;
    }
}

main();
