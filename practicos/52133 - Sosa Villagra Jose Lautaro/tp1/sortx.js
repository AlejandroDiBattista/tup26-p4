#!/usr/bin/env node

import { readFileSync } from "node:fs";

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

// Lectura de argumentos y construccion de la configuracion
function parseArgs(argv){
    
    const config = {
        inputFile: null,
        outputFile: null,
        delimiter: ',',
        noHeader: false,
        sortFields: [],
    };

    const positionalArgs = [];

    for (let index = 0; index < argv.length; index++) {
        const token = argv[index];
        
        
        if (token === '-b' || token === '--by') {
            index++;
            if (index >= argv.length) throw new Error("La opcion --by requiere un valor");
            config.sortFields.push(parseSortArguments(argv[index]));
        }
        else if (token === '-nh' || token === '--no-header') {
            config.noHeader = true;
        }
        else if (token === '-d' || token === '--delimiter') {
            index++;
            // aca tambien aplicamos manejos de errores
            if (index >= argv.length) throw new Error ("La opcion --delimiter requiere un valor");
            config.delimiter = resolveDelimiter(argv[index]);
            if(config.delimiter.length !== 1) throw new Error ("El delimitador debe ser un unico caracter");
        }
        else if (token.startsWith('-')) {
            throw new Error('opcion desconocida: "' + token + '"');
        }
        else {
            positionalArgs.push(token);
        } 
    }

    if (positionalArgs.length < 1) throw new Error("Falta el archivo de origen");

    if (positionalArgs.length < 2) throw new Error("Falta el archivo de destino");

    config.inputFile = positionalArgs[0];
    
    config.outputFile = positionalArgs[1];

    if (config.sortFields.length === 0 ) throw new Error("No especifico ningun criterio --by");

    return config;
}

function parseSortArguments(sortFields){
    const fields = sortFields.split(":");

    // Valores por defecto 
    let type = "alpha";
    let direction = "asc";
    
    if (fields.length > 1) type = fields[1];
    
    if (fields.length > 2) direction = fields[2];
    
    // campo:tipo:orden
    // salario:num:desc
    // { name: "salario", numeric: true, descending: true }
    return  {
        name: fields[0], 
        numeric: type === "num", 
        descending: direction === "desc"
    }
}

// Esta funcion se usa para resolver cuando un delimitador es una tabulacion
function resolveDelimiter(text) {
    if (text === '\\t') return '\t'
    return text;
}

function readFile(path) {
    try {
        return readFileSync(path, "utf8");
    } catch (error) {
        throw new Error('no se pudo leer el archivo: "' + path + '"');
    }

}

function  parseDelimitedFile(text, delimiter, noHeader) {
    // Normalizacion del texto para distintos sistemas operativos
    const normalized = text.split("\r\n").join("\n");
    const allLines = normalized.split("\n");
    
    // Limpiar ultima linea vacia
    let lineCount = allLines.length;
    if (lineCount > 0 && allLines[lineCount - 1] === "") {
        lineCount--;
    }
    
    const lines = [];

    for (const line of allLines.slice(0, lineCount)) {
        lines.push(line);
    }
    
    // No se permiten comillas dobles en el archivo
    // throw new Error("No se permiten comillas dobles");
    for (const line of lines) {
        if (line.includes('"')) {
            throw new Error("No se permiten comillas dobles");
        }
    }

    // Validacion del no header
    let header = null;
    let firstDataLine = 0;
    if (!noHeader) {
        header = lines[0].split(delimiter);
        firstDataLine = 1;
    }
    
    // Construccion de filas con datos
    const rows = [];
    for (const line of lines.slice(firstDataLine)) {
        rows.push()
    }
}