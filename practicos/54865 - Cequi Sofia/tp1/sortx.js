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

let args = process.argv.slice(2);

function parseArgs(args) {

    const config = {
        inputFile: null,
        outputFile: null,
        delimiter: ",",
        noHeader: false,
        sortFields: []
    };

    const positionals = [];

    for (let indice = 0; indice < args.length; indice++) {
        let valor = args[indice];

        if (valor === "-h" || valor === "--help") {
            console.log(`Opciones: 
                -b, --by campo[:tipo[:orden]]  Indica el criterio de ordenación.
                -d, --delimiter delimitador    Especifica el delimitador de campos.
                -nh, --no-header               Indica que los archivos no tienen cabecera.
                -h, --help                     Muestra este mensaje de ayuda.
                `);
            process.exit(0);
        }

        else if (valor === "-b" || valor === "--by") {
            let fields = args[indice + 1];
            if (fields === undefined) {
                throw new Error("La opción -b --by requiere un valor.");
            }
            let parts = fields.split(":");
            let criterion = { name: parts[0], numeric: false, descending: false };

            if (parts[1] === "num") {
                criterion.numeric = true;
            }
            if (parts[2] === "desc") {
                criterion.descending = true;
            }

            config.sortFields.push(criterion);
            indice++;
        }

        else if (valor === "-nh" || valor === "--no-header") {
            config.noHeader = true;
        }

        else if (valor === "-d" || valor === "--delimiter") {
            let delimiter = args[indice + 1];
            if (delimiter === undefined) {
                throw new Error("La opción -d --delimiter requiere un valor.");
            }

            if (delimiter === "\\t") {
                delimiter = "\t";
            }

            if (delimiter.length !== 1) {
                throw new Error("El delimitador debe ser un únicp caracter.");
            }

            config.delimiter = delimiter;
            indice++;
        }

        else if (valor.startsWith("-")) {
            throw new Error(`Opción no válida`);
        }

        else {
            positionals.push(valor);
        }
    }

    if (positionals.length < 2) {
        throw new Error("Faltan los archivos de origen o destino.");
    }

    config.inputFile = positionals[0];
    config.outputFile = positionals[1];

    if (config.sortFields.length === 0) {
        throw new Error("Debe especificarse al menos un criterio -b --by.");
    }

    return config;
}

parseArgs(args);
console.log(parseArgs(args));

//function readInput(){}
//function parseDelimited(){}
//function sortRows(){} 
//function serialize() {}
//function writeOutput(){}