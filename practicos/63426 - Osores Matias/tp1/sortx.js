#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

const HELP = String.raw`

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

function parseArgs(args) {
    if (args.includes("--help") || args.includes("-h")) {
        console.log(HELP);
        return;
    }

    if (!args[0] || args[0].startsWith("-")) {
        throw new Error("Falta el archivo de origen");
    }

    if (!args[1] || args[1].startsWith("-")) {
        throw new Error("Falta el archivo de destino");
    }

    const config = {
        inputFile: args[0],
        outputFile: args[1],
        delimiter: ",",
        noHeader: false,
        sortFields: []
    };

    for (let i = 2; i < args.length; i++) {
        if (args[i] === "-b" || args[i] === "--by") {
            if (!args[i + 1] || args[i + 1].startsWith("-")) {
                throw new Error("Falta el valor de --by");
            }

            const partes = args[i + 1].split(":");
            const campo = partes[0];
            const tipo = partes[1] === undefined ? "alpha" : partes[1];
            const orden = partes[2] === undefined ? "asc" : partes[2];

            if (!campo || partes.length > 3) {
                throw new Error("Criterio inválido: " + args[i + 1]);
            }
            if (tipo !== "alpha" && tipo !== "num") {
                throw new Error("Tipo inválido: " + tipo + ". Usá alpha o num");
            }
            if (orden !== "asc" && orden !== "desc") {
                throw new Error("Orden inválido: " + orden + ". Usá asc o desc");
            }

            config.sortFields.push({
                name: campo,
                numeric: tipo === "num",
                descending: orden === "desc"
            });
            i++;
        } else if (args[i] === "-d" || args[i] === "--delimiter") {
            if (args[i + 1] === undefined || /^--?[a-z]/i.test(args[i + 1])) {
                throw new Error("Falta el valor de --delimiter");
            }
            config.delimiter = args[i + 1] === "\\t" ? "\t" : args[i + 1];
            if (Array.from(config.delimiter).length !== 1 ||
                config.delimiter === "\n" || config.delimiter === "\r" ||
                config.delimiter === '"') {
                throw new Error("El delimitador debe ser un único carácter, distinto de comillas dobles o saltos de línea");
            }
            i++;
        } else if (args[i] === "-nh" || args[i] === "--no-header") {
            config.noHeader = true;
        } else {
            throw new Error("Opción desconocida: " + args[i]);
        }
    }

    if (config.sortFields.length === 0) {
        throw new Error("Falta indicar al menos un criterio con --by");
    }

    return config;
}

function readInput(inputFile) {
    try {
        return readFileSync(inputFile, "utf8");
    } catch (error) {
        throw new Error("No se pudo leer el archivo de origen " + inputFile + " (" + error.code + ")");
    }
}

function parseDelimited(texto, config) {
    if (texto.includes('"')) {
        throw new Error("La entrada contiene comillas dobles, que no están admitidas");
    }

    texto = texto.replace(/^\uFEFF/, "");
    if (texto.length === 0) {
        throw new Error("El archivo de origen está vacío");
    }

    const lineas = texto.split(/\r\n|\n|\r/);
    if (lineas[lineas.length - 1] === "") {
        lineas.pop();
    }

    const filas = [];
    const cantidadCampos = lineas[0].split(config.delimiter).length;

    for (let i = 0; i < lineas.length; i++) {
        const campos = lineas[i].split(config.delimiter);
        if (campos.length !== cantidadCampos) {
            throw new Error("La fila " + (i + 1) + " tiene " + campos.length +
                " campos; se esperaban " + cantidadCampos);
        }
        filas.push(campos);
    }

    let encabezado = null;
    if (!config.noHeader) {
        encabezado = filas.shift();
    }

    return { encabezado, filas, cantidadCampos };
}

function sortRows(datos, config) {
    const criterios = [];

    for (let i = 0; i < config.sortFields.length; i++) {
        const campo = config.sortFields[i];
        let indice;

        if (config.noHeader) {
            if (!/^\d+$/.test(campo.name)) {
                throw new Error("Sin encabezado, el campo debe ser un índice desde cero: " + campo.name);
            }
            indice = Number(campo.name);
        } else {
            indice = datos.encabezado.indexOf(campo.name);
        }

        if (!Number.isSafeInteger(indice) || indice < 0 || indice >= datos.cantidadCampos) {
            throw new Error("El campo solicitado no existe: " + campo.name);
        }

        if (campo.numeric) {
            for (let j = 0; j < datos.filas.length; j++) {
                const valor = datos.filas[j][indice];
                if (valor.trim() === "" || !Number.isFinite(Number(valor))) {
                    const numeroFila = j + (config.noHeader ? 1 : 2);
                    throw new Error("Valor no numérico en la fila " + numeroFila +
                        ", campo " + campo.name + ": " + valor);
                }
            }
        }

        criterios.push({ indice, numeric: campo.numeric, descending: campo.descending });
    }

    datos.filas.sort(function (filaA, filaB) {
        for (let i = 0; i < criterios.length; i++) {
            const criterio = criterios[i];
            const valorA = filaA[criterio.indice];
            const valorB = filaB[criterio.indice];
            let comparacion;

            if (criterio.numeric) {
                comparacion = Number(valorA) - Number(valorB);
            } else {
                comparacion = valorA.localeCompare(valorB, "es");
            }

            if (comparacion !== 0) {
                return criterio.descending ? -comparacion : comparacion;
            }
        }
        return 0;
    });

    return datos;
}

function serialize(datos, config) {
    const lineas = [];
    if (datos.encabezado !== null) {
        lineas.push(datos.encabezado.join(config.delimiter));
    }
    for (let i = 0; i < datos.filas.length; i++) {
        lineas.push(datos.filas[i].join(config.delimiter));
    }
    return lineas.join("\n");
}

function writeOutput(outputFile, texto) {
    try {
        writeFileSync(outputFile, texto, "utf8");
    } catch (error) {
        throw new Error("No se pudo escribir el archivo de destino " + outputFile + " (" + error.code + ")");
    }
}
