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

    const filas = lineas.map(linea =>
        linea.split(delimitador)
    );

    return filas;
}

function sortRows(datos, encabezado, criterios) {
    datos.sort((filaA, filaB) => {

        for (const criterio of criterios) {
            const partes = criterio.split(":");

            const campo = partes[0];
            const tipo = partes[1] || "alpha";
            const orden = partes[2] || "asc";

            const indiceColumna = encabezado.indexOf(campo);

            let resultado;

            if (tipo === "num") {
                const valorA = Number(filaA[indiceColumna]);
                const valorB = Number(filaB[indiceColumna]);

                resultado = valorA - valorB;
            } else {
                const valorA = filaA[indiceColumna];
                const valorB = filaB[indiceColumna];

                resultado = valorA.localeCompare(valorB);
            }

            if (orden === "desc") {
                resultado = resultado * -1;
            }

            if (resultado !== 0) {
                return resultado;
            }
        }

        return 0;
    });

    return datos;
}

function serialize(encabezado, datos, delimitador) {
    const filas = [];

    if (encabezado !== null) {
        filas.push(encabezado.join(delimitador));
    }

    for (const fila of datos) {
        filas.push(fila.join(delimitador));
    }

    return filas.join("\n");
}

function writeOutput(destino, contenido) {
    fs.writeFileSync(destino, contenido, "utf8");
}


// EJECUCIÓN PRINCIPAL

const args = process.argv.slice(2);

const config = parseArgs(args);

const contenido = readInput(config.origen);

const filas = parseDelimited(
    contenido,
    config.delimitador
);

let encabezado;
let datos;

if (config.noHeader) {
    encabezado = null;
    datos = filas;
} else {
    encabezado = filas[0];
    datos = filas.slice(1);
}

const datosOrdenados = sortRows(
    datos,
    encabezado,
    config.criterios
);

const textoSalida = serialize(
    encabezado,
    datosOrdenados,
    config.delimitador
);

writeOutput(
    config.destino,
    textoSalida
);

console.log(
    "Archivo generado correctamente:",
    config.destino
);
// console.log(HELP);