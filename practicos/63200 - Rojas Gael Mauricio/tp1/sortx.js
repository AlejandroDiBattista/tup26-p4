#!/usr/bin/env node

const fs = require("fs");

// Texto de ayuda que se muestra al usar la opción -h o --help
const HELP = `
sortx - Ordena archivos de texto delimitados

USO:
    sortx <origen> <destino> [opciones]

ARGUMENTOS:
    origen              Archivo que se desea ordenar.
    destino             Archivo donde se guardará el resultado.

OPCIONES:
    -b, --by <criterio> Criterio de ordenamiento. Se puede repetir.
                        Formato: campo[:tipo[:orden]]
                        tipo: alpha o num
                        orden: asc o desc

    -d, --delimiter <c> Delimitador de un solo carácter.
                        Predeterminado: ","
                        Usá "\\t" para tabulación.

    -nh, --no-header    Indica que el archivo no tiene encabezado.
                        Los campos se identifican por índice desde cero.

    -h, --help          Muestra esta ayuda.

EJEMPLOS:
    sortx empleados.csv ordenados.csv -b apellido
    sortx empleados.csv salarios.csv -b salario:num:desc
    sortx empleados.csv resultado.csv -b departamento -b salario:num:desc
    sortx datos.csv resultado.csv -nh -b 2:num:desc
    sortx datos.tsv salida.tsv -d "\\t" -b nombre
`;

// Procesa los argumentos de la línea de comandos y devuelve la configuración
function parseArgs(args) {
    if (args.includes("--help") || args.includes("-h")) {
        console.log(HELP);
        process.exit(0);
    }

    let config = {
        inputFile: null,
        outputFile: null,
        delimiter: ",",
        noHeader: false,
        sortFields: []
    };

    let archivos = [];

    for (let i = 0; i < args.length; i++) {
        let arg = args[i];

        if (arg === "-b" || arg === "--by") {

            if (i + 1 >= args.length) {
                throw new Error(
                    "La opción " + arg + " necesita un valor."
                );
            }

            config.sortFields.push(
                parseSortField(args[++i])
            );
        }
        else if (arg === "-d" || arg === "--delimiter") {

            if (i + 1 >= args.length) {
                throw new Error(
                    "La opción " + arg + " necesita un valor."
                );
            }

            let delimiter = args[++i];

            if (delimiter === "\\t" || delimiter === "`t") {
                delimiter = "\t";
            }

            if (delimiter.length !== 1) {
                throw new Error(
                    "El delimitador debe ser un único carácter."
                );
            }

            config.delimiter = delimiter;
        }
        else if (arg === "-nh" || arg === "--no-header") {
            config.noHeader = true;
        }
        else if (arg.startsWith("-")) {
            throw new Error(
                "Opción desconocida: " + arg
            );
        }
        else {
            archivos.push(arg);
        }
    }

    if (archivos.length === 0) {
        throw new Error(
            "Falta el archivo de origen."
        );
    }

    if (archivos.length === 1) {
        throw new Error(
            "Falta el archivo de destino."
        );
    }

    if (archivos.length > 2) {
        throw new Error(
            "Se indicaron demasiados archivos."
        );
    }

    if (config.sortFields.length === 0) {
        throw new Error(
            "Debe indicar al menos un criterio --by."
        );
    }

    config.inputFile = archivos[0];
    config.outputFile = archivos[1];

    return config;
}

// Analiza y valida cada criterio de ordenamiento individual
function parseSortField(texto) {
    let partes = texto.split(":");

    if (partes.length > 3) {
        throw new Error(
            "Criterio inválido: " + texto
        );
    }

    let name = partes[0];
    let tipo = partes[1] || "alpha";
    let orden = partes[2] || "asc";

    if (name === "") {
        throw new Error(
            "El campo de ordenamiento no puede estar vacío."
        );
    }

    if (tipo !== "alpha" && tipo !== "num") {
        throw new Error(
            "Tipo de ordenamiento inválido: " + tipo
        );
    }

    if (orden !== "asc" && orden !== "desc") {
        throw new Error(
            "Orden inválido: " + orden
        );
    }

    return {
        name: name,
        numeric: tipo === "num",
        descending: orden === "desc"
    };
}

// Lee el contenido del archivo de entrada indicado
function readInput(fileName) {
    try {
        return fs.readFileSync(fileName, "utf8");
    }
    catch (error) {
        throw new Error(
            "No se puede leer el archivo de origen: " +
            fileName
        );
    }
}

// Separa el texto en filas y columnas según el delimitador especificado
function parseDelimited(texto, delimiter) {
    texto = texto.replace(/\r\n/g, "\n");
    texto = texto.replace(/\r/g, "\n");

    if (texto.endsWith("\n")) {
        texto = texto.slice(0, -1);
    }

    if (texto.length === 0) {
        return [];
    }

    if (texto.includes('"')) {
        throw new Error(
            "La entrada contiene comillas dobles y no están permitidas."
        );
    }

    let lineas = texto.split("\n");
    let filas = [];

    let cantidadCampos = null;

    for (let i = 0; i < lineas.length; i++) {
        let fila = lineas[i].split(delimiter);

        if (cantidadCampos === null) {
            cantidadCampos = fila.length;
        }

        if (fila.length !== cantidadCampos) {
            throw new Error(
                "La fila " +
                (i + 1) +
                " tiene una cantidad diferente de campos."
            );
        }

        filas.push(fila);
    }

    return filas;
}

// Ordena las filas del archivo basándose en las opciones recibidas
function sortRows(filas, config) {
    if (filas.length === 0) {
        return filas;
    }

    let header = null;
    let datos = filas;

    if (!config.noHeader) {
        header = filas[0];
        datos = filas.slice(1);
    }

    let criterios = [];

    for (let criterio of config.sortFields) {
        let indice;

        if (config.noHeader) {

            if (!/^\d+$/.test(criterio.name)) {
                throw new Error(
                    "Sin encabezado, el campo debe ser un índice numérico: " +
                    criterio.name
                );
            }

            indice = Number(criterio.name);
        }
        else {
            indice = header.indexOf(criterio.name);

            if (indice === -1) {
                throw new Error(
                    "El campo solicitado no existe: " +
                    criterio.name
                );
            }
        }

        if (indice < 0 || indice >= filas[0].length) {
            throw new Error(
                "El índice de columna no existe: " +
                criterio.name
            );
        }

        criterios.push({
            index: indice,
            numeric: criterio.numeric,
            descending: criterio.descending
        });
    }

    datos.sort(function (filaA, filaB) {

        for (let criterio of criterios) {

            let valorA = filaA[criterio.index];
            let valorB = filaB[criterio.index];

            let resultado = 0;

            if (criterio.numeric) {

                let numeroA = Number(valorA);
                let numeroB = Number(valorB);

                if (
                    valorA.trim() === "" ||
                    valorB.trim() === "" ||
                    !Number.isFinite(numeroA) ||
                    !Number.isFinite(numeroB)
                ) {
                    throw new Error(
                        "Un criterio numérico encontró un valor no numérico."
                    );
                }

                if (numeroA < numeroB) {
                    resultado = -1;
                }
                else if (numeroA > numeroB) {
                    resultado = 1;
                }
            }
            else {
                resultado = valorA.localeCompare(valorB);
            }

            if (resultado !== 0) {

                if (criterio.descending) {
                    resultado = resultado * -1;
                }

                return resultado;
            }
        }

        return 0;
    });

    if (!config.noHeader) {
        return [header, ...datos];
    }

    return datos;
}

// Convierte la estructura de datos ordenada de nuevo a un texto delimitado
function serialize(filas, delimiter) {
    let lineas = [];

    for (let fila of filas) {
        lineas.push(
            fila.join(delimiter)
        );
    }

    if (lineas.length === 0) {
        return "";
    }

    return lineas.join("\n") + "\n";
}

// Guarda el texto resultante en el archivo de salida
function writeOutput(fileName, texto) {
    try {
        fs.writeFileSync(
            fileName,
            texto,
            "utf8"
        );
    }
    catch (error) {
        throw new Error(
            "No se puede escribir el archivo de destino: " +
            fileName
        );
    }
}

// Función principal que coordina la ejecución de todo el programa
function main() {
    try {
        let config = parseArgs(
            process.argv.slice(2)
        );

        let texto = readInput(
            config.inputFile
        );

        let filas = parseDelimited(
            texto,
            config.delimiter
        );

        let filasOrdenadas = sortRows(
            filas,
            config
        );

        let resultado = serialize(
            filasOrdenadas,
            config.delimiter
        );

        writeOutput(
            config.outputFile,
            resultado
        );

        console.log(
            "Archivo ordenado correctamente: " +
            config.outputFile
        );
    }
    catch (error) {
        console.error(
            "Error: " + error.message
        );

        process.exit(1);
    }
}

main();