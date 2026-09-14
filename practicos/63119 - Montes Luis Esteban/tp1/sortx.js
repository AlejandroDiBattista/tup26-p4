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

import fs from "node:fs";


function parseArgs(args) {

    const origen = args[0];
    const destino = args[1];

    const criterios = [];
    let delimitador = ",";
    let noHeader = false;

    for (let i = 2; i < args.length; i++) {

        if (args[i] === "-b" || args[i] === "--by") {
            const criterio = args[i + 1];
            criterios.push(criterio);
            i++;
        }

        else if (args[i] === "-d" || args[i] === "--delimiter") {
            delimitador = args[i + 1];
            i++;
        }

        else if (args[i] === "-nh" || args[i] === "--no-header") {
            noHeader = true;
        }
    }

    return {
        origen,
        destino,
        criterios,
        delimitador,
        noHeader
    };
}

function readInput(origen) {
    const contenido = fs.readFileSync(origen, "utf8");

    return contenido;
}

function parseDelimited(contenido, delimitador) {
    const lineas = contenido.trimEnd().split(/\r?\n/);

    const filas = lineas.map(linea => linea.split(delimitador));

    return filas;
}

const args = process.argv.slice(2);

const config = parseArgs(args);

const contenido = readInput(config.origen);

const filas = parseDelimited(contenido, config.delimitador);

let encabezado;
let datos;

if (config.noHeader) {
    encabezado = null;
    datos = filas;
} else {
    encabezado = filas[0];
    datos = filas.slice(1);
}

console.log("Encabezado:", encabezado);
console.log("Datos:", datos);

// console.log(HELP);