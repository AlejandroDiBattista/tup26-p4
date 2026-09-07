#!/usr/bin/env node

const fs = require("fs");

const HELP = `
sortx - Ordena archivos de texto delimitados

USO:
    sortx <origen> <destino> [opciones]

OPCIONES:
    -b, --by <criterio> Campo por el que ordenar.
    -d, --delimiter <c> Delimitador.
    -nh, --no-header    Archivo sin encabezado.
    -h, --help          Muestra esta ayuda.

EJEMPLOS:
    sortx empleados.csv ordenados.csv -b apellido
    sortx empleados.csv salarios.csv -b salario:num:desc
    sortx datos.csv resultado.csv -nh -b 2:num:desc
`;

function parseSortField(texto) {
    let partes = texto.split(":");

    let name = partes[0];
    let tipo = partes[1] || "alpha";
    let orden = partes[2] || "asc";

    return {
        name: name,
        numeric: tipo === "num",
        descending: orden === "desc"
    };
}

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

function readInput(fileName) {
    return fs.readFileSync(fileName, "utf8");
}

function parseDelimited(texto, delimiter) {
    texto = texto.replace(/\r\n/g, "\n");
    texto = texto.replace(/\r/g, "\n");

    if (texto.endsWith("\n")) {
        texto = texto.slice(0, -1);
    }

    if (texto.length === 0) {
        return [];
    }

    let lineas = texto.split("\n");
    let filas = [];

    for (let i = 0; i < lineas.length; i++) {
        let fila = lineas[i].split(delimiter);
        filas.push(fila);
    }

    return filas;
}

function main() {
    let config = parseArgs(process.argv.slice(2));

    let texto = readInput(config.inputFile);

    let filas = parseDelimited(
        texto,
        config.delimiter
    );

    console.log(filas);
}

main();