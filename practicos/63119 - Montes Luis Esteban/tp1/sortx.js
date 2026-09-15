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
    if (args.length === 0) {
        console.error("Error: falta el archivo de origen.");
        process.exit(1);
    }

    if (args.length === 1) {
        console.error("Error: falta el archivo de destino.");
        process.exit(1);
    }

    const origen = args[0];
    const destino = args[1];

    const criterios = [];
    let delimitador = ",";
    let noHeader = false;

    for (let i = 2; i < args.length; i++) {
        if (args[i] === "-b" || args[i] === "--by") {
            if (args[i + 1] === undefined) {
                console.error("Error: falta el criterio después de -b.");
                process.exit(1);
            }

            criterios.push(args[i + 1]);
            i++;
        }

        else if (args[i] === "-d" || args[i] === "--delimiter") {
            if (args[i + 1] === undefined) {
                console.error("Error: falta el delimitador después de -d.");
                process.exit(1);
            }

            delimitador = args[i + 1];
            i++;
        }

        else if (args[i] === "-nh" || args[i] === "--no-header") {
            noHeader = true;
        }

        else if (args[i] === "-h" || args[i] === "--help") {
            console.log(HELP);
            process.exit(0);
        }

        else {
            console.error("Error: opción desconocida:", args[i]);
            process.exit(1);
        }
    }

    if (criterios.length === 0) {
        console.error("Error: debe indicar al menos un criterio con -b.");
        process.exit(1);
    }

    if (delimitador.length !== 1) {
        console.error("Error: el delimitador debe tener un solo carácter.");
        process.exit(1);
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

function sortRows(datos, encabezado, criterios, noHeader) {

    datos.sort((filaA, filaB) => {

        for (const criterio of criterios) {
            const partes = criterio.split(":");

            const campo = partes[0];
            const tipo = partes[1] || "alpha";
            const orden = partes[2] || "asc";

            if (tipo !== "alpha" && tipo !== "num") {
                console.error("Error: tipo inválido:", tipo);
                process.exit(1);
            }

            if (orden !== "asc" && orden !== "desc") {
                console.error("Error: orden inválido:", orden);
                process.exit(1);
            }

            let indiceColumna;

            if (noHeader) {
                indiceColumna = Number(campo);

                if (
                    !Number.isInteger(indiceColumna) ||
                    indiceColumna < 0 ||
                    indiceColumna >= filaA.length
                ) {
                    console.error("Error: índice de columna inválido:", campo);
                    process.exit(1);
                }

            } else {
                indiceColumna = encabezado.indexOf(campo);

                if (indiceColumna === -1) {
                    console.error("Error: campo inexistente:", campo);
                    process.exit(1);
                }
            }

            let resultado;

            if (tipo === "num") {
                const valorA = Number(filaA[indiceColumna]);
                const valorB = Number(filaB[indiceColumna]);

                if (Number.isNaN(valorA) || Number.isNaN(valorB)) {
                    console.error(
                        "Error: valor no numérico en el campo:",
                        campo
                    );
                    process.exit(1);
                }

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
    config.criterios,
    config.noHeader
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