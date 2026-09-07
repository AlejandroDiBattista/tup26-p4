#!/usr/bin/env node

import fs from "node:fs";

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
`;

function parseArgs(argv) {
    const opciones = {
        inputFile: null,
        outputFile: null,
        delimiter: ",",
        noHeader: false,
        sortFields: [],
    };
    const restantes = [];
    let i = 0;

    while (i < argv.length) {
        const arg = argv[i];

        if (arg === "-h" || arg === "--help") {
            console.log(HELP);
            process.exit(0);
        } else if (arg === "-nh" || arg === "--no-header") {
            opciones.noHeader = true;
            i = i + 1;
        } else if (arg === "-b" || arg === "--by") {
            if (i + 1 >= argv.length) {
                console.error("ERROR: falta el valor de -b/--by");
                process.exit(1);
            }

            const crudo = argv[i + 1];
            const partes = crudo.split(":");
            const name = partes[0];
            const tipo = partes[1] || "alpha";
            const orden = partes[2] || "asc";

            if (name === "" || partes.length > 3) {
                console.error("ERROR: criterio --by invalido: \"" + crudo + "\"");
                process.exit(1);
            }
            if (tipo !== "alpha" && tipo !== "num") {
                console.error("ERROR: tipo no valido: \"" + tipo + "\"");
                process.exit(1);
            }
            if (orden !== "asc" && orden !== "desc") {
                console.error("ERROR: orden no valido: \"" + orden + "\"");
                process.exit(1);
            }

            opciones.sortFields.push({
                name: name,
                numeric: tipo === "num",
                descending: orden === "desc",
            });
            i = i + 2;
        } else if (arg === "-d" || arg === "--delimiter") {
            if (i + 1 >= argv.length) {
                console.error("ERROR: falta el valor de -d/--delimiter");
                process.exit(1);
            }

            let delim = argv[i + 1];
            if (delim === "\\t") {
                delim = "\t";
            }
            if (delim.length !== 1) {
                console.error("ERROR: el delimitador tiene que ser un unico caracter");
                process.exit(1);
            }
            opciones.delimiter = delim;
            i = i + 2;
        } else if (arg.startsWith("-")) {
            console.error("ERROR: opcion desconocida: \"" + arg + "\"");
            process.exit(1);
        } else {
            restantes.push(arg);
            i = i + 1;
        }
    }

    if (restantes.length < 1) {
        console.error("ERROR: falta el archivo de origen");
        process.exit(1);
    }
    if (restantes.length < 2) {
        console.error("ERROR: falta el archivo de destino");
        process.exit(1);
    }
    if (opciones.sortFields.length === 0) {
        console.error("ERROR: indique al menos un criterio con --by");
        process.exit(1);
    }

    opciones.inputFile = restantes[0];
    opciones.outputFile = restantes[1];
    return opciones;
}

function readInput(ruta) {
    if (!fs.existsSync(ruta)) {
        console.error("ERROR: el archivo de origen no existe: \"" + ruta + "\"");
        process.exit(1);
    }

    try {
        return fs.readFileSync(ruta, "utf8");
    } catch (error) {
        console.error("ERROR: no se pudo leer el archivo de origen: \"" + ruta + "\"");
        process.exit(1);
    }
}

function parseDelimited(texto, opciones) {
    if (texto.includes("\"")) {
        console.error("ERROR: no se admiten comillas dobles");
        process.exit(1);
    }

    const normalizado = texto.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lineas = normalizado.split("\n");
    if (lineas.length > 0 && lineas[lineas.length - 1] === "") {
        lineas.pop();
    }
    if (lineas.length === 0) {
        console.error("ERROR: el archivo de origen esta vacio");
        process.exit(1);
    }

    const tabla = [];
    for (let i = 0; i < lineas.length; i = i + 1) {
        tabla.push(lineas[i].split(opciones.delimiter));
    }

    const cantidad = tabla[0].length;
    for (let i = 0; i < tabla.length; i = i + 1) {
        if (tabla[i].length !== cantidad) {
            console.error("ERROR: la fila " + (i + 1) + " tiene distinta cantidad de campos");
            process.exit(1);
        }
    }

    let encabezado = null;
    let filas = tabla;
    if (!opciones.noHeader) {
        encabezado = tabla[0];
        filas = tabla.slice(1);
    }

    return { encabezado: encabezado, filas: filas };
}

function main() {
    const opciones = parseArgs(process.argv.slice(2));
    const texto = readInput(opciones.inputFile);
    const datos = parseDelimited(texto, opciones);
    console.log("Se leyeron " + datos.filas.length + " filas. El ordenamiento queda pendiente.");
}

main();
