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
//console.log(HELP)//
import fs from "fs";

function parseArgs(args) {
    if (args.includes("-h") || args.includes("--help")) {
        return { help: true };
    }
    const config = {
        inputFile: args[0],
        outputFile: args[1],
        delimiter: ",",
        noHeader: false,
        sortFields: []
    };
    if (!config.inputFile || !config.outputFile) {
        throw new Error("Falta indicar el archivo de origen o destino");
    }
    let i = 2;
    while (i < args.length) {
        const opcion = args[i];
        if (opcion === "-b" || opcion === "--by") {
            const valor = args[i + 1];
            if (!valor) {
                throw new Error("Falta indicar el criterio de ordenamiento");
            }
            const partes = valor.split(":");
            if (partes.length > 3) {
                throw new Error(`criterio invalido: ${valor}`);
            }
            const nombre = partes[0];
            const tipo = partes[1] || "alpha";
            const orden = partes[2] || "asc";
            if (!nombre){
                throw new Error("el campo de ordenamiento no puede estar vacio");
            }
            if (tipo !== "alpha" && tipo !== "num") {
                throw new Error(`Tipo de ordenamiento invalido: ${tipo}`);
            }
            if (orden !== "asc" && orden !== "desc") {
                throw new Error(`Orden invalido: ${orden}`);
            }
            config.sortFields.push({
                name: nombre,
                numeric: tipo === "num",
                descending: orden === "desc"
            });
            i += 2;
        } else if (opcion === "-d" || opcion === "--delimiter") {
            const valor = args[i + 1];
            if (!valor) {
                throw new Error("Falta indicar el delimitador");
            }
            if (valor === "\\t") {
                config.delimiter = "\t";
            } else {
                config.delimiter = valor;
            }
            if (config.delimiter.length !== 1) {
                throw new Error(
                    "El delimitador debe tener exactamente un caracter"
                );
            }
            i += 2;
        } else if (opcion === "-nh" || opcion === "--no-header") {
            config.noHeader = true;
            i++;
        } else {
            throw new Error(`Opcion desconocida: ${opcion}`);
        }
    }
    if (config.sortFields.length === 0) {
        throw new Error("Debe indicar al menos un criterio con --by");
    }
    return config;
}
function readInput(file) {
    return fs.readFileSync(file, "utf8");
}
function parseDelimited(text, delimiter){
    if (text.includes('"')){
        throw new Error("el archivo contiene comillas dobles, que no estan soportadas");
    }
    const lineas = text.trim().split(/\r?\n/);
    const filas = lineas.map(linea => linea.split(delimiter));
    const cantidadCampos = filas[0].length;
    for (const fila of filas) {
        if (fila.length !== cantidadCampos) {
            throw new Error("las filas tienen distintas cantidades de campos");
        }
    }
    return filas;
}

function sortRows(rows, config) {
    let header = [];
    let data = rows;

    if(!config.noHeader){
        header = rows[0];
        data = rows.slice(1);
    }
    data.sort((a, b) => {
        for (const campo of config.sortFields) {
            let indice;
            if(config.noHeader) {
                if (!/^\d+$/.test(campo.name)){
                    throw new Error(`indice de campo invalido: ${campo.name}`);
                }
                indice = Number(campo.name);
            } else {
                indice = header.indexOf(campo.name);
            }

            if (indice < 0 || indice >= 
                a.length || Number.isNaN(indice)) {
                    throw new Error(`no existe el campo: ${campo.name}`);
            }

            const valorA = a[indice];
            const valorB = b[indice];

            let resultado;
            if (campo.numeric) {
                const numeroA = Number(valorA);
                const numeroB = Number(valorB);

                if (Number.isNaN(numeroA) || 
                Number.isNaN(numeroB)){
                    throw new Error(`el campo ${campo.name} contiene un valor no numerico`);
                }
                resultado = numeroA - numeroB;
            } else {
                resultado = valorA.localeCompare(valorB);
            }

            if (resultado !== 0) {
                if (campo.descending) {
                    resultado = -resultado;
                }
                return resultado;
            }

        }
        return 0;
    });
    if (!config.noHeader) {
        return [header, ...data];
    }
    return data;
}
function serialize(rows, delimiter) {
    return rows.map(row => 
        row.join(delimiter)).join("\n");
}
function writeOutput(file, text) {
    fs.writeFileSync(file, text, "utf8");
}
function main(){
try{
        const config = parseArgs(process.argv.slice(2));
        if(config.help){
            console.log(HELP);
            return;
        }
        const texto =
         readInput(config.inputFile);
        const filas =
        parseDelimited(texto, config.delimiter);
        const ordenadas = 
        sortRows(filas, config);
        const resultado = 
        serialize(ordenadas, config.delimiter);

        writeOutput(config.outputFile, resultado);
    } catch (error) {
        console.error("Error:",
            error.message);
        process.exit(1);
    }
}
main();
