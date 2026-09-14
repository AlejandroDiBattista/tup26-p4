#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

// function parseArgs(argv){};
// function readInput(inputFile){}
// function parseDelimited(text,delimiter,noHeader){}
// function sortRows(rows, sortFields, header){}
// function serialize(){}
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

function parseArgs(argv) {
    const config = {
        inputFile: null,
        outputFile: null,
        delimiter: ",",
        noHeader: false,
        sortFields: [],
        help: false,
    };

    const positionals = [];
    let i = 0

    while (i < argv.length) {
        const arg = argv[i]

        if (arg === "-h" || arg === "--help") {
            config.help = true;
            i += 1;
            continue;
        }
        if (arg === "-nh" || arg === "--no-header") {
            config.noHeader = true;
            i += 1;
            continue
        }

        if (arg === "-b" || arg === "--by") {
            const value = argv[i + 1];
            if (value === undefined) {
                fail(`La opcion ${arg} necesita un valor`);
            }
            config.sortFields.push(sortFieldsParser(value))
            i += 2;
            continue;
        }
        if (arg === "-d" || arg === "--delimiter") {
            let value = argv[i + 1];
            if (value === undefined) {
                fail(`La opción ${arg} requiere un valor`);
            }
            if (value === "\\t") value = "\t";
            if (value.length !== 1) {
                fail(`El delimitador debe ser un único carácter (recibido: "${value}")`);
            }
            config.delimiter = value;
            i += 2;
            continue;
        }


        if (arg.startsWith("-")) {
            fail(`opcion desconocida: ${arg}`)
        }
        positionals.push(arg);
        i += 1;

    }

    if (config.help) {
        return config;
    }

    if (positionals.length < 1) {
        fail("Falta el archivo de origen");
    }
    if (positionals.length < 2) {
        fail("Falta el archivo de destino");
    }
    if (positionals.length > 2) {
        fail(`Argumentos de más: ${positionals.slice(2).join(", ")}`);
    }
    if (config.sortFields.length === 0) {
        fail("Debés indicar al menos un criterio con -b/--by");
    }

    config.inputFile = positionals[0];
    config.outputFile = positionals[1];
    return config;


}

function readInput(inputFile) {
    try {
        return readFileSync(inputFile, "utf8");
    } catch {
        fail(`No se pudo leer el archivo de origen: ${inputFile}`);
    }
}

function parseDelimited(text, delimiter, noHeader) {
    if (text.includes('"')) {
        fail("La entrada contiene comillas dobles (no admitidas)");
    }

    const lines = text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n")
        .filter((line, idx, arr) => !(line === "" && idx === arr.length - 1));

    if (!lines.length) {
        fail("El archivo de origen está vacío");
    }

    const allRows = lines.map((line) => line.split(delimiter));
    const expectedCols = allRows[0].length;

    for (let i = 0; i < allRows.length; i++) {
        const row = allRows[i];
        if (row.length !== expectedCols) {
            fail(`La fila ${i + 1} tiene ${row.length} campos, se esperaban ${expectedCols}`);
        }
    }

    if (noHeader) {
        return { header: null, rows: allRows };
    }

    return {
        header: allRows[0],
        rows: allRows.slice(1),
    };
}

function compareValues(a, b, numeric, descending) {
    let result;

    if (numeric) {
        const na = Number(a);
        const nb = Number(b);
        if (Number.isNaN(na) || Number.isNaN(nb)) {
            fail(`Valor no numérico encontrado (valores: "${a}", "${b}")`);
        }
        result = na - nb;
    } else {
        result = String(a).localeCompare(String(b), "es");
    }

    return descending ? -result : result;
}
function resolveColumnIndex(field, header, columnCount) {

    if (header) {
        const idx = header.indexOf(field.name);

        if (idx === -1) {
            fail(`El campo solicitado no existe: "${field.name}"`);
        }
        return idx;
    }
    if (!/^\d+$/.test(field.name)) {
        fail(`Sin encabezado, el campo debe ser un índice numérico (recibido: "${field.name}")`);
    }

    const idx = Number(field.name);

    if (idx < 0 || idx >= columnCount) {
        fail(`Índice de columna fuera de rango: ${idx}`);
    }

    return idx;
}

function sortRows(rows, sortFields, header) {
    if (!rows.length) return rows;

    const columnCount = rows[0].length;
    const resolved = sortFields.map((field) => ({
        ...field,
        index: resolveColumnIndex(field, header, columnCount),
    }));

    return rows.slice().sort((rowA, rowB) => {
        for (const field of resolved) {
            const cmp = compareValues(rowA[field.index], rowB[field.index], field.numeric, field.descending);
            if (cmp !== 0) return cmp;
        }
        return 0;
    });
}

function serialize(header, rows, delimiter) {
    const lines = [];

    if (header) {
        lines.push(header.join(delimiter));
    }

    for (const row of rows) {
        lines.push(row.join(delimiter));
    }

    return lines.join("\n") + "\n";
}

function writeOutput(outputFile, content) {
    try {
        writeFileSync(outputFile, content, "utf8");
    } catch {
        fail(`No se pudo escribir el archivo de destino: ${outputFile}`);
    }
}

function sortFieldsParser(raw) {
    const parts = raw.split(":");

    if (parts.length < 1 || parts.length > 3 || parts[0] === "") {
        fail(`cantidad de campos invalidos`);
    }

    const name = parts[0];
    const tipo = parts[1] ?? "alpha";
    const orden = parts[2] ?? "asc";

    if (tipo !== "alpha" && tipo !== "num") {
        fail(`tipo de ordenamiento invalido (usa alpha o num)`);
    }

    if (orden !== "asc" && orden !== "desc") {
        fail(`orden invalido (usa asc o desc)`);
    }

    return {
        name,
        numeric: tipo === "num",
        descending: orden === "desc",
    };
}

function main() {
    try {
        const config = parseArgs(process.argv.slice(2));

        if (config.help) {
            console.log(HELP);
            process.exit(0);
        }

        const text = readInput(config.inputFile);
        const { header, rows } = parseDelimited(text, config.delimiter, config.noHeader);

        const sorted = sortRows(rows, config.sortFields, header);
        const output = serialize(header, sorted, config.delimiter);

        writeOutput(config.outputFile, output);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

main();