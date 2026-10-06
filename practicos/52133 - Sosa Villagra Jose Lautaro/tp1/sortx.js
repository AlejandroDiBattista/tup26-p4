#!/usr/bin/env node

import { copyFile, readFileSync, writeFileSync } from "node:fs";
import { config } from "node:process";

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
    const [ name, type = "alpha", direction = "asc" ] = sortFields.split(":");
        
    // campo:tipo:orden
    // salario:num:desc
    // { name: "salario", numeric: true, descending: true }
    return  {
        name,
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
        return new TextDecoder("utf-8").decode(readFileSync(path));
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
        rows.push(line.split(delimiter));
    }
    
    // Cantidad de columnas a determinar
    let columnCount = 0;
    if (header !== null) {
        columnCount = header.length;
    }
    else if (rows.length > 0) {
        columnCount = rows[0].length
    }

    // Valida que todas las filas tengan esa cantidad de campos.
	for (const [index, row] of rows.entries()) {
		if (row.length !== columnCount) {
			throw new Error(
				"la fila " +
				(index + 1) +
				" tiene una cantidad de campos distinta a las demás",
			);
		}
	}

    return { header, rows }
}

function resolveFieldIndex(fieldName, header, noHeader) {
    if (noHeader) {
        // Sin el encabezado el campo "noHeader" la primera fila ya es el indice
        const column = Number(fieldName);
        if (!Number.isInteger(column) || column < 0) {
            throw new Error('índice de campo inválido: "' + fieldName + '"');
        }

        return column;
    }

    // Si el encabezado es un nombre busca el indice
    const column = header.indexOf(fieldName); 
    if (column === -1) {
        throw new Error('el campo no existe: "' + fieldName + '"');
    }
    return column;
}

function sortRows(header, rows, sortFields, noHeader) {
    // Resolver indice de la columna de cada criterio de ordenamiennto
    const resolveFields = [];
    for (const field of sortFields) {
        resolveFields.push({
            ...field,
            column: resolveFieldIndex(field.name, header, noHeader)
        })
    }

    // Comparacion de filas // FirstRow y SecondRow no hacen referencia a la primera o segunda fila del array rowsToSort
    const compare = (firstRow, secondRow) => {
        for (const field of resolveFields) {
            const column = field.column;
            const firstValue = firstRow[column];
            const secondValue = secondRow[column];
            let comparison;
            if (field.numeric) {
                const firstNumber = Number(firstValue);
                const secondNumber = Number(secondValue);
                if (Number.isNaN(firstNumber) || Number.isNaN(secondNumber)) {
                    throw new Error('el campo "' + field.name + '" tiene un valor no numérico');
                }
                comparison = firstNumber - secondNumber;
            }
            else {
                // Comparacion segun el orden del español
                comparison = firstValue.localeCompare(secondValue, "es");
            }

            // Invierte el signo si el criterio es descendiente 
            if (field.descending) {
                comparison = -comparison;
            }
            
            if (comparison !== 0) {
                return comparison;
            }
        }
        return 0;
    }

    const rowsToSort = [];
    for (const row of rows) {
        rowsToSort.push(row);
    }

    return rowsToSort.sort(compare);
}

// Reconstruccion de texto a partir de encabezado y filas
function serialize(header, rows, delimiter, noHeader) {
    const lines = [];
    if (!noHeader) {
        lines.push(header.join(delimiter));
    }
    
    for (const row of rows) {
        lines.push(row.join(delimiter));
    }

    return lines.join("\n");
}

function writeOutput(filePath, text) {
    try {
		writeFileSync(filePath, text, "utf8");
	} catch (error) {
		throw new Error(
			'no se pudo escribir el archivo de destino: "' + filePath + '"',
		);
	}
}

function main() {
    if (process.argv.includes('-h') || process.argv.includes('--help')) {
        console.log(HELP);
        process.exit(0);
    }

    // Toma los argumentos del usuario desde el indice 2
    const commandLineArgs = [];
    for (const argument of process.argv.slice(2)) {
        commandLineArgs.push(argument);
    }

    try {
        const config = parseArgs(commandLineArgs);
        const text = readFile(config.inputFile);
        const table = parseDelimitedFile(text, config.delimiter, config.noHeader);
        const sortedRows = sortRows(table.header, table.rows, config.sortFields, config.noHeader);
        const outputText = serialize(table.header, sortedRows, config.delimiter, config.noHeader);
        writeOutput(config.outputFile, outputText);
    } catch (error) {
        console.error("Error: " + error.message);
	    process.exit(1);
    }
}

main();