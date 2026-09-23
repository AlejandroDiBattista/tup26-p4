#!/usr/bin/env node
import { resolve } from "node:dns";
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
function main() {
    if (process.argv.includes('-h') || process.argv.includes('--help')) {
        console.log(HELP);
        process.exit(0);
    } 
     
    const comandLineOptions = [];
    for (const option of process.argv.slice(2)) {
        comandLineOptions.push(option);
    }

    try {
        const config = parseArgs(comandLineOptions);
        const text = readInput(config.inputFile);
        const table = parseDelimited(text, config.delimiter, config.noHeader);
        const sortedRows = sortRows(table.header, table.rows, config.sortFields, config.noHeader);

    } catch (error) {
        
    }
}

function sortRows(header, rows, sortFields, noHeader) {
    // obtener indice de columnas,
    const resolveFields = [];
    for (const field of sortFields) {
        sortFields.push({
            name: field.name,
            numeric: field.numeric,
            descendig: field.descendig,
            columna: resolveFieldIndex(field.name, header, noHeader)
        });        
    }
}

function resolveFieldIndex(name, header, noHeader) {
    if (noHeader) {
        const column = Number(name);
        if (!Number.isInteger(column) || column < 0) {
            throw new Error('índice de campo inválido: "' + name + '"');
        }

        return column;
    }

    const column = header.indexOf(name);
    if (column === - 1) {
        throw new Error('el campo no existe: "' + name + '"');
    }

    return column;
}

function parseDelimited(text, delimiter, noHeader) {
    const splitedText = text.split('\n');
    
    let lineCaunt = splitedText.length;
    if (lineCaunt > 0 && splitedText[lineCaunt - 1] === '') {
        lineCaunt--;
    }

    const lines = [];
    for (const line of splitedText.slice(0, lineCaunt)) {
        lines.push(line);
    }

    for (const line of lines) {
        if (line.includes('"')) {
            throw new Error("No se permiten comillas dobles");
        }
    }

    let header = null;
    let firsDataLine = 0;
    if (!noHeader) { 
        header = lines[0].split(delimiter);
        firsDataLine = 1;
    }

    const rows = [];
    for (const line of lines.slice(firsDataLine)) {
        rows.push(line.split(delimiter));    
    }

    let columsCount = 0;
    if (header !== null) {
        columsCount = header.length; 
    } else if (rows.length > 0) {
        columsCount = rows[0].length;
    }

    for (const [index, row] of rows.entries()) {
        if (row.length !== columsCount) {
            throw new Error(
				"la fila " +
				(index + 1) +
				" tiene una cantidad de campos distinta a las demás",
			);
        }   
    }

    return { header, rows };
    // return {
    //     header: [ "nombre", "apellido", "edad" ],
    //     rows: [ [ "jose", "lanza", "38"], ["Juan Ignacio", "Andina", "27" ] ]
    // }
}

function readInput(path) {
    try {
        return new TextDecoder('utf-8').decode(readFileSync(path));
    } catch (error) {
        throw new Error('No se puedo leer el archivo');
    }
}

function parseArgs(args) {
    const config = {
        inputFile: null, 
        outputFile: null,
        delimiter: ",",
        noHeader: false,
        sortFields: []
    };
    const positional = [];

    for (let i = 0; i < args.length; i++) {    
        const argumento = args[i];
        
        if (argumento === '-b' || argumento === '--by') {
            i++;
            if (i >= args.length) {
                throw new Error('Falta el criterio de ordenamiento después de ' + argumento);
            }
            config.sortFields.push(parseSortFields(args[i]));
        }
        else if (argumento === '-d' || argumento === '--delimiter') {
            i++;
            if (i >= args.length) {
                throw new Error('Falta el delimitador después de ' + argumento); 
            }
            config.delimiter =  resolveDelimiter(args[i]);
            if(config.delimiter.length !== 1) 
                throw new Error('El delimitador debe ser un solo carácter.'); 
                
        } else if (argumento === '-nh' || argumento === '--no-header') {
            config.noHeader = true;
        } else if (argumento.startsWith('-')) {
            throw new Error('Opción desconocida: ' + argumento);
        } else positional.push(argumento);

    }
    if (positional.length < 2) {
        throw new Error('Faltan argumentos posicionales.');
    }
    config.inputFile = positional[0];
    config.outputFile = positional[1];
    return config;
} 

function parseSortFields(sortFields) {
    const [campo, tipo = 'alpha', orden = 'asc'] = sortFields.split(':');

    return {
        name: campo, 
        numeric: tipo === 'num',
        descendig: orden === 'desc',
    }
}

main();
