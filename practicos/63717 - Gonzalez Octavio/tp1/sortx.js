#!/usr/bin/env node
import { captureRejectionSymbol } from "node:events";
import { writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";


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
const argumentos = process.argv.slice(2); // array c/argumentos desde el indice indicado 

// Llamada a funciones ————————————————————————————————————————————————————————————————

const configuracion = parseArgs(argumentos);
const input = await readInput(configuracion.inputFile);
const { columnas, filas } = parseDelimited(input, configuracion);
const output = sortRows(columnas, filas, configuracion.noHeader, configuracion.sortfields);

// Funciones ————————————————————————————————————————————————————————————————————————

function parseArgs(args) {
    const [entrada, destino, ...opciones] = args;

    if (entrada === "h" || entrada === "help" || entrada === "-h" || entrada === "--help") {
        console.clear();
        console.log(HELP);
        process.exit(0);
    }

    if (entrada === undefined && destino === undefined) {
        console.error("Debe especificar un archivo de origen y de entrada, sino help para obtener ayuda.");
        process.exit(-1);
    }
    else if (destino === undefined || destino.startsWith("-")) {
        console.error("Debe especificar un archivo de destino.");
        process.exit(-1);
    }
    if (entrada.startsWith("'")) {
        console.error(`
            La ruta debe escribirse como 'ruta', no "ruta" 
            `);
        process.exit(-1);
    }
    if (destino.startsWith('"')) {
        console.error(`
                La ruta debe escribirse como 'ruta', no "ruta"
                `);
        process.exit(-1);
    }

    // CONFIGURACION ------------------------------------
    let config = { inputFile: entrada, outputFile: destino, sortfields: [], delimiter: ",", noHeader: false }
    // ------------------------------------

    for (let i = 0; i < opciones.length; i++) {
        if (opciones[i] === "-b" || opciones[i] === "--by") {
            if (opciones[i + 1] === undefined
                || opciones[i + 1].startsWith("-")
                || opciones[i + 1].startsWith("--")
                || opciones[i + 1] === ""
                || opciones[i + 1].startsWith("\n")
            ) {
                console.error("La opcion -b debe ir seguida de un criterio de ordenamiento. Consultar help.");
                process.exit(-1);
            }

            let [campo, ...modificador] = opciones[i + 1].split(":");
            const nombre = campo === "" ? undefined : campo;

            if (modificador[0] !== undefined && modificador[0] !== "num" && modificador[0] !== "alpha") {
                console.error("No se puede ordenar por: '" + modificador[0] + "', solo alpha (alfabético) y num (numérico)");
                process.exit(-1);
            }
            if (modificador[1] !== undefined && modificador[1] !== "asc" && modificador[1] !== "desc") {
                console.error("No se puede ordenar por: '" + modificador[1] + "', solo asc (ascendente) y desc (descendente)");
                process.exit(-1);
            }
            if (nombre != undefined) {
                config.sortfields.push({
                    name: nombre,
                    numeric: modificador.includes("num"),
                    descending: modificador.includes("desc")
                });
            }
            i++;
            continue;

        }
        if (opciones[i] === "-d" || opciones[i] === "--delimiter") {
            const valor = opciones[i + 1];
            if (valor === '\\t') config.delimiter = "\t";

            else if (valor === undefined || valor.startsWith("-") || valor.length != 1) {
                console.error("Debe especificar un delimitador. Consultar help."
                );
                process.exit(-1);
            }
            else { config.delimiter = valor; }
            i++;
            continue;
        }
        if (opciones[i] === "-nh" || opciones[i] === "--no-header") {
            config.noHeader = true;
            continue;
        }

        if ((opciones[i] !== "-b" && opciones[i] !== "--by" &&
            opciones[i] !== "-d" && opciones[i] !== "--delimiter" &&
            opciones[i] !== "-nh" && opciones[i] !== "--no-header")) {
            console.log(`
                            Opcion invalida: ${opciones[i]}. Consultar help.`);
            process.exit(-1);
        }
    }
    if (config.sortfields.length === 0) {
        console.error("Debe especificar al menos un criterio de ordenamiento. Consultar help.");
        process.exit(-1);
    }
    return config;
}

async function readInput(entrada) {
    try {
        return await readFile(entrada, "utf-8");
    } catch (error) {
        console.error("Error al leer el archivo porque la ruta es incorrecta");
        process.exit(-1);
    }
}

function parseDelimited(input, config) {
    let lineas = input.includes("\r\n") ? input.split("\r\n") : input.split("\n")
    if (lineas[lineas.length - 1] === "") {
        lineas.pop();
    }
    let filas = [];
    let columnas = [];
    for (let i = 0; i < lineas.length - 1; i++) {
        if (lineas[i].split(config.delimiter).length !== lineas[i + 1].split(config.delimiter).length) {
            console.error("No todas las filas tienen la misma cantidad");
            process.exit(-1);
        }
    }
    for (let i = 0; i < lineas.length; i++) {
        if (lineas[i].includes('"')) {
            console.error("El archivo no puede contener comillas dobles");
            process.exit(-1);
        }
    }
    if (config.noHeader == false) {
        columnas = lineas[0].split(config.delimiter);
        for (let i = 1; i < lineas.length; i++) {
            filas.push(lineas[i].split(config.delimiter))
        }
    }
    else {
        for (let i = 0; i < lineas.length; i++) {
            filas.push(lineas[i].split(config.delimiter));
        }
    }
    return { columnas, filas }
}

function sortRows(columnas, filas, noheader, campos = []) {

    for (let i = 0; i < campos.length; i++) {
        const campo = campos[i];
        if (noheader == false) {
            if (!columnas.includes(campo.name)) {
                console.error("No se puede ordenar por este campo, ya que no lo contiene la tabla");
                process.exit(-1);
            }
            campo.indice = columnas.indexOf(campo.name);
        } else {
            campo.indice = Number(campo.name);
            if (Number.isNaN(campo.indice)
                || campo.indice < 0
                || (filas.length > 0 && campo.indice >= filas[0].length)) {
                console.error("Indice no valido");
                process.exit(-1);
            }
        }
    }

    filas.sort((a, b) => {
        for (let i = 0; i < campos.length; i++) {
            const campo = campos[i];
            const indice = campo.indice;
            let resultado = 0;


            if (campo.numeric == true) {
                const colA = Number(a[indice]);
                const colB = Number(b[indice]);
                if (campo.descending == true) {
                    if (colA < colB) resultado = 1;
                    else if (colA > colB) resultado = -1;
                    else resultado = 0;
                } else {
                    if (colA < colB) resultado = -1;
                    else if (colA > colB) resultado = 1;
                    else resultado = 0;
                }
            }

            // Comparación Alfabética
            else {
                const colA = a[indice] ?? "";
                const colB = b[indice] ?? "";
                const comp = colA.localeCompare(colB, "es");
                if (campo.descending == true) {
                    if (comp < 0) resultado = 1;
                    else if (comp > 0) resultado = -1;
                    else resultado = 0;
                } else {
                    if (comp < 0) resultado = -1;
                    else if (comp > 0) resultado = 1;
                    else resultado = 0;
                }
            }

            if (resultado !== 0) {
                return resultado;
            }
        }
        return 0; 
    });
    console.log(filas);
    return filas;
}

