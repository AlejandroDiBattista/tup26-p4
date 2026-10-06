#!/usr/bin/env node
import { error } from "console";
import fs from "fs";
import { delimiter, join } from "path";
import { exit } from "process";
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

function parseArgs() {
    const inputFile = process.argv[2];
    const outputFile = process.argv[3];
    let delimiter = ",";
    let noHeader = false;
    const sortFields = [];

    if (process.argv[2] === "-h" || process.argv[2] === "--help") {
        console.log(HELP)
        process.exit(0);
    }

    if (inputFile === undefined || outputFile === undefined) {
        console.log("error, no existe")
        process.exit(1);

    };

    for (let i = 4; i < process.argv.length; i++) {

        if (process.argv[i] === "-b" || process.argv[i] === "--by") {
            if (process.argv[i + 1] === undefined) {
                console.log("error, no hay datos")
                process.exit(1)
            };
            const criterio = process.argv[i + 1].split(":");
            if (criterio[1] === undefined) {
                criterio[1] = "alpha"
            } if (criterio[2] === undefined) {
                criterio[2] = "asc"
            }
            if (criterio[1] !== "alpha" && criterio[1] !== "num") {
                console.log("error, los datos son distintos")
                process.exit(1)
            }
            if (criterio[2] !== "asc" && criterio[2] !== "desc") {
                console.log("error, los datos son distintos")
                process.exit(1)
            }
            const campo = {
                name: criterio[0],
                numeric: criterio[1] === "num",
                descending: criterio[2] === "desc",
            }
            sortFields.push(campo);
            i++

        } else if (process.argv[i] === "-d" || process.argv[i] === "--delimiter") {
            if (process.argv[i + 1] === undefined) {
                console.log("error, no hay datos")
                process.exit(1)
            };
            delimiter = process.argv[i + 1];
            if (delimiter === "\\t") {
                delimiter = "\t";
            }
            i++

        } else if (process.argv[i] === "-nh" || process.argv[i] === "--no-header") {
            noHeader = true
        } else {
            console.log("Error, desconocido")
            process.exit(1)
        }

    }

    if (sortFields.length === 0 || delimiter.length !== 1) {
        console.log("error")
        process.exit(1)
    }
    return {
        inputFile,
        outputFile,
        delimiter,
        noHeader,
        sortFields
    };
}

function readInput(inputFile) {
    fs.readFileSync(inputFile, "utf-8");
    return fs.readFileSync(inputFile, "utf-8");
}

function parseDelimited(contenido, delimiter, noHeader) {

    const lineas = contenido.split("\n");
    const filas = [];

    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i].trim();
        if (linea.includes('"')) {
            console.log("Error, no se permiten campos entre comillas")
            process.exit(1)
        }
        const fila = linea.split(delimiter)
        filas.push(fila);
        if (filas[i].length !== filas[0].length) {
            console.log("Error, el numero de filas y columnas no concuerda")
            process.exit(1)

        }
    }

    console.log(filas)
    return filas


}

function sortRows(filas, sortFields, noHeader) {
    let indice
    let filasDatos
    let resultado

    if (noHeader === true) {
        filasDatos = filas
    } else {
        filasDatos = filas.slice(1)
    }
    filasDatos.sort((a, b) => {
        for (let i = 0; i < sortFields.length; i++) {

            if (noHeader === true) {
                indice = Number(sortFields[i].name)
                if (indice >= filas[0].length || indice < 0) {
                    console.log("No existe el campo");
                    process.exit(1);
                }

            } else {
                indice = filas[0].indexOf(sortFields[i].name)
                if (indice === -1) {
                    console.log("No existe el campo");
                    process.exit(1);
                }
            }
            if (sortFields[i].numeric === true) {
                if (Number.isNaN(Number(a[indice])) || Number.isNaN(Number(b[indice]))) {
                    console.log("No es un numero");
                    process.exit(1);
                }
                resultado = Number(a[indice]) - Number(b[indice])
            } else {
                resultado = a[indice].localeCompare(b[indice]);
            }
            if (resultado !== 0) {
                if (sortFields[i].descending === true) {
                    resultado = resultado * -1
                }
                return resultado
            }
        }
        return 0;

    });
    if (noHeader === false) {
        filasDatos.unshift(filas[0]);
    }

    return filasDatos


}


function serialize(filas, delimiter) {
    let lineas = []
    for (let i = 0; i < filas.length; i++) {
        const linea = filas[i].join(delimiter)
        lineas.push(linea);
    }
    return lineas.join("\n")
}

function writeOutput(texto, outputFile) {
    fs.writeFileSync(outputFile, texto)
}


const configuracion = parseArgs();
const contenido = readInput(configuracion.inputFile);
const filas = parseDelimited(
    contenido,
    configuracion.delimiter,
    configuracion.noHeader
);
const ordenados = sortRows(filas, configuracion.sortFields, configuracion.noHeader);
const texto = serialize(ordenados, configuracion.delimiter);



console.log(texto);
writeOutput(texto, configuracion.outputFile);