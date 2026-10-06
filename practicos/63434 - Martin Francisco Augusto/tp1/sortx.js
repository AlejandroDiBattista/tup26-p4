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
    if (restantes.length > 2) {
        console.error("ERROR: sobran argumentos");
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

function sortRows(datos, opciones) {
    const cantidadColumnas = datos.filas.length > 0 ? datos.filas[0].length : 0;
    const criterios = [];

    for (let i = 0; i < opciones.sortFields.length; i = i + 1) {
        const criterio = opciones.sortFields[i];
        let indice;

        if (opciones.noHeader) {
            indice = Number(criterio.name);
            if (!Number.isInteger(indice) || String(indice) !== criterio.name) {
                console.error("ERROR: el campo solicitado no existe: \"" + criterio.name + "\"");
                process.exit(1);
            }
            if (indice < 0 || indice >= cantidadColumnas) {
                console.error("ERROR: el campo solicitado no existe: \"" + criterio.name + "\"");
                process.exit(1);
            }
        } else {
            indice = datos.encabezado.indexOf(criterio.name);
            if (indice === -1) {
                console.error("ERROR: el campo solicitado no existe: \"" + criterio.name + "\"");
                process.exit(1);
            }
        }

        criterios.push({
            name: criterio.name,
            numeric: criterio.numeric,
            descending: criterio.descending,
            indice: indice,
        });
    }

    if (!opciones.noHeader) {
        for (let i = 0; i < criterios.length; i = i + 1) {
            const criterio = criterios[i];
            if (!criterio.numeric) {
                continue;
            }
            for (let j = 0; j < datos.filas.length; j = j + 1) {
                const valor = datos.filas[j][criterio.indice];
                if (Number.isNaN(Number(valor))) {
                    console.error("ERROR: se encontro un valor no numerico en \"" + criterio.name + "\"");
                    process.exit(1);
                }
            }
        }
    }

    const filasOrdenadas = datos.filas.slice();
    filasOrdenadas.sort(function (filaA, filaB) {
        for (let i = 0; i < criterios.length; i = i + 1) {
            const criterio = criterios[i];
            const valorA = filaA[criterio.indice];
            const valorB = filaB[criterio.indice];
            let resultado = 0;

            if (criterio.numeric) {
                const numA = Number(valorA);
                const numB = Number(valorB);
                if (Number.isNaN(numA) || Number.isNaN(numB)) {
                    if (!opciones.noHeader) {
                        console.error("ERROR: se encontro un valor no numerico en \"" + criterio.name + "\"");
                        process.exit(1);
                    }
                    const a = Number.isNaN(numA) ? Number.NEGATIVE_INFINITY : numA;
                    const b = Number.isNaN(numB) ? Number.NEGATIVE_INFINITY : numB;
                    resultado = a - b;
                } else {
                    resultado = numA - numB;
                }
            } else {
                resultado = String(valorA).localeCompare(String(valorB));
            }

            if (criterio.descending) {
                resultado = resultado * -1;
            }
            if (resultado !== 0) {
                return resultado;
            }
        }
        return 0;
    });

    return filasOrdenadas;
}

function serialize(datos, filasOrdenadas, opciones) {
    const lineas = [];
    if (!opciones.noHeader) {
        lineas.push(datos.encabezado.join(opciones.delimiter));
    }
    for (let i = 0; i < filasOrdenadas.length; i = i + 1) {
        lineas.push(filasOrdenadas[i].join(opciones.delimiter));
    }
    return lineas.join("\n");
}

function writeOutput(ruta, contenido) {
    try {
        fs.writeFileSync(ruta, contenido, "utf8");
    } catch (error) {
        console.error("ERROR: no se puede escribir el archivo de destino: \"" + ruta + "\"");
        process.exit(1);
    }
}

function main() {
    const opciones = parseArgs(process.argv.slice(2));
    const texto = readInput(opciones.inputFile);
    const datos = parseDelimited(texto, opciones);
    const filasOrdenadas = sortRows(datos, opciones);
    const salida = serialize(datos, filasOrdenadas, opciones);
    writeOutput(opciones.outputFile, salida);
    console.log("listo se genero \"" + opciones.outputFile + "\".");
}

main();