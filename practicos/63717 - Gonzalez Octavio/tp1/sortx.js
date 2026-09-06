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
    else if (destino === undefined) {
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

            if (opciones[i + 1] === undefined || opciones[i + 1].startsWith("-")) {
                console.error("La opcion -b debe ir seguida de un criterio de ordenamiento. Consultar help.");
                process.exit(-1);
            }

            let [campo, ...modificador] = opciones[i + 1].split(":");
            const nombre = campo === "" ? undefined : campo;

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
const {columnas, filas} = parseDelimited(input, configuracion)

function parseDelimited(input, config) {


    let lineas =  input.includes("\r\n") ? input.split("\r\n")  : input.split("\n");

    let columnas = lineas[0].split(config.delimiter);
    let filas = [];
    for (let i = 1; i < lineas.length; i++) {
        filas.push(lineas[i].split(config.delimiter));
    }
    return {columnas, filas}
}

function sortRows (filas, columnas, config)
{
 
}

// function serialize (rows, config)
// {

// }
// function writeOutput (output, config)
// {}
