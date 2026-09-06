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
// console.log(HELP);
import fs from "fs";

function parseArgs() {
    const inputFile = process.argv[2];
    const outputFile = process.argv[3];

    if (!inputFile || !outputFile) {
        throw new Error("Faltan el archivo de origen o destino");
    }

    let delimiter = ",";
    let noHeader = false;
    const sortFields = [];

    for (let i = 4; i < process.argv.length; i++) {

        if (process.argv[i] === "-b" || process.argv[i] === "--by") {
            const criterio = process.argv[i + 1];

            if (!criterio) {
                throw new Error("La opción --by necesita un valor");
            }

            const partes = criterio.split(":");
            const nombre = partes[0];
            const tipo = partes[1] || "alpha";
            const orden = partes[2] || "asc";

            if (tipo !== "alpha" && tipo !== "num") {
                throw new Error("El tipo debe ser alpha o num");
            }

            if (orden !== "asc" && orden !== "desc") {
                throw new Error("El orden debe ser asc o desc");
            }

            const numeric = tipo === "num";
            const descending = orden === "desc";
            const campo = {
                name: nombre,
                numeric: numeric,
                descending: descending
            };

            sortFields.push(campo);

            i++;
        }

        else if (process.argv[i] === "-d" || process.argv[i] === "--delimiter") {
            const valor = process.argv[i + 1];

            if (!valor) {
                throw new Error("La opción --delimiter necesita un valor");
            }

            if (valor === "\\t") {
                delimiter = "\t";
            } else {
                delimiter = valor;
            }

            if (delimiter.length !== 1) {
                throw new Error("El delimitador debe tener un solo carácter");
            }

            i++;
        }

        else if (process.argv[i] === "-nh" || process.argv[i] === "--no-header") {
            noHeader = true;
        }

        else if (process.argv[i] === "-h" || process.argv[i] === "--help") {
            console.log(HELP);
            process.exit(0);
        }

        else {
            throw new Error("Opción desconocida: " + process.argv[i]);
        }
    }

    if (sortFields.length === 0) {
        throw new Error("Debe especificarse al menos un criterio con --by");
    }

    return {
        inputFile: inputFile,
        outputFile: outputFile,
        delimiter: delimiter,
        noHeader: noHeader,
        sortFields: sortFields
    };

}
function readInput(inputFile) {
    try {
        const contenido = fs.readFileSync(inputFile, "utf8");
        return contenido;
    } catch (error) {
        throw new Error("No se pudo leer el archivo de entrada");
    }
}
function parseDelimited(contenido, delimiter, noHeader) {
    const lineas = contenido.split(/\r?\n/);
    const filas = [];

    if (lineas.length === 0) {
        throw new Error("El archivo está vacío");
    }

    const cantidadCampos = lineas[0].split(delimiter).length;

    for (let i = 0; i < lineas.length; i++) {

        if (lineas[i] === "") {
            continue;
        }
        if (lineas[i].includes('"')) {
            throw new Error("No se permiten comillas dobles");
        }

        const fila = lineas[i].split(delimiter);
        if (fila.length !== cantidadCampos) {
            throw new Error("Las filas tienen distinta cantidad de campos");
        }

        filas.push(fila);
    }

    if (filas.length === 0) {
        throw new Error("El archivo está vacío");
    }

    return filas;
}

function sortRows(filas, sortFields, noHeader) {
    let inicio = 0;

    if (!noHeader) {
        inicio = 1;
    }
    const datos = filas.slice(inicio);

    let encabezado = [];

if (!noHeader) {
    encabezado = filas[0];
}
for (let i = 0; i < sortFields.length; i++) {
    const campo = sortFields[i];
    let posicion = -1;

    if (noHeader) {
        posicion = Number(campo.name);
    } else {
        posicion = encabezado.indexOf(campo.name);
    }
    if (posicion === -1) {
    throw new Error("No existe el campo: " + campo.name);
    }
 }
}

const config = parseArgs();
const contenido = readInput(config.inputFile);
const filas = parseDelimited(contenido, config.delimiter, config.noHeader);
console.log(filas);