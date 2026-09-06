#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

// function parseArgs(argv){};
// function readInput(inputFile){}
// function parseDelimited(text,delimiter,noHeader){}
// function sortRows(rows, sortFields, header){}
// function serialize(){}

function parseArgs(argv) {
    const config = {
        inputFile: null,
        outputFile: null,
        delimiter: ",",
        noHeader: false,
        sortFields: [],
        help: false,
    };
}


function fieldsParser(raw) {
    const parts = raw.split(":");
    const name = parts[0]
    const tipo = parts[1] ?? "alpha";
    const orden = parts[2] ?? "asc";
    return {
        name,
        numeric: tipo === "num",
        descending: orden === "desc",
    };
}



// Escribir aqui la solución al enunciado.
// console.log(args);

// const HELP = `

// sortx — Ordena archivos de texto delimitados

// USO:
//     sortx <origen> <destino> [opciones]

// ARGUMENTOS:
//     origen              Archivo que se desea ordenar.
//     destino             Archivo donde se guardará el resultado.

// OPCIONES:
//     -b, --by <criterio> Criterio de ordenamiento. Se puede repetir.
//                         Formato: campo[:tipo[:orden]]
//                         tipo: alpha (predeterminado) o num
//                         orden: asc (predeterminado) o desc

//     -d, --delimiter <c> Delimitador de un solo carácter.
//                         Predeterminado: ","
//                         Usá "\t" para archivos separados por tabulaciones.

//     -nh, --no-header    Indica que el archivo no tiene encabezado.
//                         Los campos se identifican mediante índices desde cero.

//     -h, --help          Muestra esta ayuda.

// EJEMPLOS:
//     sortx empleados.csv ordenados.csv -b apellido
//     sortx empleados.csv salarios.csv -b salario:num:desc
//     sortx empleados.csv resultado.csv -b departamento -b salario:num:desc
//     sortx datos.csv resultado.csv -nh -b 2:num:desc
//     sortx datos.tsv salida.tsv -d "\t" -b nombre
// `
