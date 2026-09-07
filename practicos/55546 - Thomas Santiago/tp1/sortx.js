#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

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
`;


function parseArgs(args) {

    let config = {
        delimiter: ",",
        inputFile: null,
        outputFile: null,
        noHeader: false,
        sortFields: []
    };

    if (args[0] === "-h" || args[0] === "--help") {
        console.log(HELP);
        process.exit(0);
    }

    if (args.length === 0) {
        throw new Error("Falta el archivo de origen");
    }

    config.inputFile = args.shift();

    if (args.length === 0) {
        throw new Error("Falta el archivo de destino");
    }

    config.outputFile = args.shift();


    while (args.length !== 0) {

        let opc = args.shift();


        if (opc === "-b" || opc === "--by") {

            if (args.length === 0) {
                throw new Error("Falta el criterio de ordenamiento");
            }

            let info = args.shift();

            let [name, numeric = "alpha", descending = "asc"] =
                info.split(":");

            if (numeric !== "alpha" && numeric !== "num") {
                throw new Error("El tipo debe ser alpha o num");
            }

            if (descending !== "asc" && descending !== "desc") {
                throw new Error("El orden debe ser asc o desc");
            }

            let field = {
                name: name,
                numeric: numeric === "num",
                descending: descending === "desc"
            };

            config.sortFields.push(field);
        }


        else if (opc === "-d" || opc === "--delimiter") {

            if (args.length === 0) {
                throw new Error("Falta el delimitador");
            }

            config.delimiter = args.shift();

            if (config.delimiter === "\\t") {
                config.delimiter = "\t";
            }

            if (config.delimiter.length !== 1) {
                throw new Error("El delimitador debe ser de un caracter");
            }
        }


        else if (opc === "-nh" || opc === "--no-header") {

            config.noHeader = true;
        }


        else {

            throw new Error("Opcion desconocida: " + opc);
        }
    }


    if (config.sortFields.length === 0) {
        throw new Error("Falta indicar un criterio de ordenamiento con -b");
    }


    return config;
}



function readInput(nombre) {

    try {

        let texto = readFileSync(nombre, "utf-8");

        return texto;

    }
    catch {

        throw new Error("No se pudo leer el archivo " + nombre);
    }
}



function parseDelimited(texto, delimiter, noHeader) {

    let data = {
        header: [],
        rows: []
    };


    if (texto.includes('"')) {
        throw new Error("El archivo contiene comillas dobles");
    }


    texto = texto.replace(/\r\n/g, "\n");
    texto = texto.replace(/\r/g, "\n");


    if (texto.endsWith("\n")) {
        texto = texto.slice(0, -1);
    }


    if (texto.length === 0) {
        throw new Error("El archivo esta vacio");
    }


    let rows = texto
        .split("\n")
        .map(fila => fila.split(delimiter));


    let cantidadCampos = rows[0].length;


    for (let fila of rows) {

        if (fila.length !== cantidadCampos) {

            throw new Error(
                "Las filas tienen diferente cantidad de campos"
            );
        }
    }


    if (noHeader) {

        data.header = rows[0].map((_, i) => String(i));
    }

    else {

        data.header = rows.shift();
    }


    data.rows = rows;


    return data;
}



function sortRows(data, sortFields) {

    let criterios = [];


    for (let field of sortFields) {

        let index = data.header.indexOf(field.name);


        if (index === -1) {

            throw new Error(
                "El campo solicitado no existe: " + field.name
            );
        }


        criterios.push({
            index: index,
            numeric: field.numeric,
            descending: field.descending
        });
    }


    data.rows.sort((filaA, filaB) => {

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
                    Number.isNaN(numeroA) ||
                    Number.isNaN(numeroB)
                ) {

                    throw new Error(
                        "Se encontro un valor no numerico"
                    );
                }


                resultado = numeroA - numeroB;
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


    return data;
}



function serialize(data, delimiter, noHeader) {

    let rows = [];


    if (!noHeader) {

        rows.push(data.header);
    }


    rows.push(...data.rows);


    let texto = rows
        .map(fila => fila.join(delimiter))
        .join("\n");


    return texto;
}



function writeOutput(nombre, texto) {

    try {

        writeFileSync(nombre, texto, "utf-8");

    }
    catch {

        throw new Error(
            "No se pudo escribir el archivo " + nombre
        );
    }
}



try {

    const argumentos = process.argv.slice(2);

    let config = parseArgs(argumentos);

    let texto = readInput(config.inputFile);

    let data = parseDelimited(
        texto,
        config.delimiter,
        config.noHeader
    );

    data = sortRows(
        data,
        config.sortFields
    );

    let resultado = serialize(
        data,
        config.delimiter,
        config.noHeader
    );

    writeOutput(
        config.outputFile,
        resultado
    );

    console.log("Archivo ordenado correctamente");

}
catch (error) {

    console.error("Error:", error.message);

    process.exit(1);
}
