#!/usr/bin/env node

import fs from "node:fs";
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
                        Usá "\\t" para archivos separados por tabulaciones.

    -nh, --no-header    Indica que el archivo no tiene encabezado.
                        Los campos se identifican mediante índices desde cero.

    -h, --help          Muestra esta ayuda.

EJEMPLOS:
    sortx empleados.csv ordenados.csv -b apellido
    sortx empleados.csv salarios.csv -b salario:num:desc
    sortx empleados.csv resultado.csv -b departamento -b salario:num:desc
    sortx datos.csv resultado.csv -nh -b 2:num:desc
    sortx datos.tsv salida.tsv -d "\\t" -b nombre
`

// Escribir aqui la solución al enunciado.

function parseArgs(args) {
    const config = {
        inputFile: null,
        outputFile: null,
        delimiter: ",",
        noHeader: false,
        sortFields: []
    };

    if (args.length === 0) {
        throw new Error("Faltan los archivos de origen y destino.");
    }

    if (args.includes("-h") || args.includes("--help")) {
        return { help: true };
    }

    let i = 0;

    if (!args[i] || args[i].startsWith("-")) {
        throw new Error("Falta el archivo de origen.");
    }

    config.inputFile = args[i++];

    if (!args[i] || args[i].startsWith("-")) {
        throw new Error("Falta el archivo de destino.");
    }

    config.outputFile = args[i++];

    while (i < args.length) {
        const arg = args[i];

        if (arg === "-b" || arg === "--by") {
            i++;

            if (i >= args.length) {
                throw new Error("La opción --by requiere un valor.");
            }

            const parts = args[i].split(":");

            if (parts.length > 3) {
                throw new Error("Criterio de ordenamiento inválido.");
            }

            const name = parts[0];
            const type = parts[1] || "alpha";
            const order = parts[2] || "asc";

            if (!name) {
                throw new Error("El campo no puede estar vacío.");
            }

            if (type !== "alpha" && type !== "num") {
                throw new Error("El tipo debe ser alpha o num.");
            }

            if (order !== "asc" && order !== "desc") {
                throw new Error("El orden debe ser asc o desc.");
            }

            config.sortFields.push({
                name,
                numeric: type === "num",
                descending: order === "desc"
            });

            i++;
        }

        else if (arg === "-d" || arg === "--delimiter") {
            i++;

            if (i >= args.length) {
                throw new Error("La opción --delimiter requiere un valor.");
            }

            let delimiter = args[i];

            if (delimiter === "\\t") {
                delimiter = "\t";
            }

            if (delimiter.length !== 1) {
                throw new Error("El delimitador debe tener un solo carácter.");
            }

            config.delimiter = delimiter;
            i++;
        }

        else if (arg === "-nh" || arg === "--no-header") {
            config.noHeader = true;
            i++;
        }

        else {
            throw new Error(`Opción desconocida: ${arg}`);
        }
    }

    if (config.sortFields.length === 0) {
        throw new Error("Debe especificar al menos un criterio --by.");
    }

    return config;
}

function readInput(filename) {
   try {
        return fs.readFileSync(filename, "utf8");
    } catch (error) {
        throw new Error(`No se puede leer el archivo de origen: ${filename}`);
    }
}

function parseDelimited(text, delimiter) {
    const lines = text.split(/\r?\n/);

    if (lines.length > 0 && lines[lines.length - 1] === "") {
        lines.pop();
    }

    if (lines.length === 0) {
        throw new Error("El archivo está vacío.");
    }

    const rows = lines.map(line => {
        
        if (line.includes('"')) {
            throw new Error("El archivo no puede contener comillas.");
        }

        return line.split(delimiter);
    });

    const fieldCount = rows[0].length;

    for (const row of rows) {
        if (row.length !== fieldCount) {
            throw new Error("Las filas tienen distinta cantidad de campos.");
        }
    }

    return rows;
}


function sortRows(rows, config) {
    const header = config.noHeader ? null : rows[0];
    const data = config.noHeader ? rows : rows.slice(1);

    const criteria = config.sortFields.map(field => {
        let index;

        if (config.noHeader) {
            index = Number(field.name);

            if (!Number.isInteger(index) || index < 0 || index >= rows[0].length) {
                throw new Error(`Campo inexistente: ${field.name}`);
            }
        } else {
            index = header.indexOf(field.name);

            if (index === -1) {
                throw new Error(`Campo inexistente: ${field.name}`);
            }
        }

        return {
            ...field,
            index
        };
    });

    data.sort((a, b) => {
        for (const criterion of criteria) {
            const valueA = a[criterion.index];
            const valueB = b[criterion.index];

            let comparison;

            if (criterion.numeric) {
                const numberA = Number(valueA);
                const numberB = Number(valueB);

                if (Number.isNaN(numberA) || Number.isNaN(numberB)) {
                    throw new Error(
                        `El campo ${criterion.name} contiene un valor no numérico.`
                    );
                }

                comparison = numberA - numberB;
            } else {
                comparison = valueA.localeCompare(valueB, "es");
            }

            if (comparison !== 0) {
                return criterion.descending ? -comparison : comparison;
            }
        }

        return 0;
    });

    return header ? [header, ...data] : data;
}

function serialize(rows, delimiter) {
    return rows.map(row => row.join(delimiter)).join("\n");
}

function writeOutput(filename, text) {
    try {
        fs.writeFileSync(filename, text, "utf8");
    } catch (error) {
        throw new Error(`No se puede escribir el archivo de destino: ${filename}`);
    }
}

try {
    const config = parseArgs(process.argv.slice(2));

    if (config.help) {
        console.log(HELP);
        process.exit(0);
    }

    const text = readInput(config.inputFile);

    const rows = parseDelimited(text, config.delimiter);

    const sortedRows = sortRows(rows, config);

    const outputText = serialize(sortedRows, config.delimiter);

    writeOutput(config.outputFile, outputText);

    console.log(`Archivo generado correctamente: ${config.outputFile}`);
} catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
}