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

import fs from "fs";

function parseArgs() {

    if (process.argv[2] === "-h" || process.argv[2] === "--help") {
        console.log(HELP);
        process.exit(0);
    }

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

            if (!criterio || criterio.startsWith("-")) {
                throw new Error("La opción --by necesita un valor");
            }

        const partes = criterio.split(":");

            if (partes.length > 3) {
                throw new Error("El criterio de ordenamiento no es valido");
            }

            const nombre = partes[0];
            const tipo = partes[1] || "alpha";
            const orden = partes[2] || "asc";

            if (!nombre) {
                throw new Error("El criterio necesita un campo");
            }

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

            if (!valor || valor.startsWith("-")) {
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

    if (contenido.trim() === "") {
        throw new Error("El archivo está vacío");
    }

    let cantidadCampos = -1;

    for (let i = 0; i < lineas.length; i++) {

        if (lineas[i] === "") {
            continue;
        }

        if (lineas[i].includes('"')) {
            throw new Error("No se permiten comillas dobles");
        }

        const fila = lineas[i].split(delimiter);

        if (cantidadCampos === -1) {
            cantidadCampos = fila.length;
        }

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

            if (!/^\d+$/.test(campo.name)) {
                throw new Error("El campo debe ser un índice numérico");
            }

            posicion = Number(campo.name);

            if (posicion < 0 || posicion >= filas[0].length) {
                throw new Error("No existe el campo: " + campo.name);
            }

        } else {
            posicion = encabezado.indexOf(campo.name);

            if (posicion === -1) {
                throw new Error("No existe el campo: " + campo.name);
            }
        }

        campo.position = posicion;
    }

    datos.sort(function(a, b) {

        for (let i = 0; i < sortFields.length; i++) {

            const campo = sortFields[i];
            const posicion = campo.position;

            let resultado = 0;

            if (campo.numeric) {

                const numeroA = Number(a[posicion]);
                const numeroB = Number(b[posicion]);

                if (Number.isNaN(numeroA) || Number.isNaN(numeroB)) {
                    throw new Error("El valor no es numérico");
                }

                if (numeroA < numeroB) {
                    resultado = -1;
                } else if (numeroA > numeroB) {
                    resultado = 1;
                }

            } else {

                resultado = a[posicion].localeCompare(b[posicion]);
            }

            if (resultado !== 0) {

                if (campo.descending) {
                    resultado = resultado * -1;
                }

                return resultado;
            }
        }

        return 0;
    });

    if (!noHeader) {
        return [encabezado, ...datos];
    }

    return datos;
}

function serialize(filas, delimiter) {

    let lineas = [];

    for (let i = 0; i < filas.length; i++) {
        lineas.push(filas[i].join(delimiter));
    }

    return lineas.join("\n");
}

function writeOutput(outputFile, texto) {

    try {
        fs.writeFileSync(outputFile, texto, "utf8");
    } catch (error) {
        throw new Error("No se pudo escribir el archivo de salida");
    }
}

try {

    const config = parseArgs();

    const contenido = readInput(config.inputFile);

    const filas = parseDelimited(
        contenido,
        config.delimiter,
        config.noHeader
    );

    const filasOrdenadas = sortRows(
        filas,
        config.sortFields,
        config.noHeader
    );

    const texto = serialize(
        filasOrdenadas,
        config.delimiter
    );

    writeOutput(
        config.outputFile,
        texto
    );

} catch (error) {

    console.error("Error:", error.message);
    process.exit(1);
}