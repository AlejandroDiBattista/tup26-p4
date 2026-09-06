#!/usr/bin/env node
import fs from 'node:fs';

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
function parseArgs(args) {
    if (args.includes('-h') || args.includes('--help')) {
        console.log("Uso: sortx origen destino [-b|--by campo[:tipo[:orden]]]... [-d|--delimiter delimitador] [-nh|--no-header] [-h|--help]");
        process.exit(0);
    }

    const inputFile = args.shift();
    const outputFile = args.shift();

    if (!inputFile || !outputFile || inputFile.startsWith('-') || outputFile.startsWith('-')) {
        console.error("Error: Faltan el archivo de origen o destino.");
        process.exit(1);
    }

    const config = {
        inputFile: inputFile,
        outputFile: outputFile,
        delimiter: ",",
        noHeader: false,
        sortFields: []
    };

    while (args.length > 0) {
        const arg = args.shift();

        if (arg === '-nh' || arg === '--no-header') {
            config.noHeader = true;
        }
        else if (arg === '-d' || arg === '--delimiter') {
            const delim = args.shift();
            if (!delim) {
                console.error("Error: La opción --delimiter requiere un valor.");
                process.exit(1);
            }

            const finalDelim = delim === "\\t" ? "\t" : delim;

            if (finalDelim.length !== 1) {
                console.error("Error: El delimitador no es un único carácter.");
                process.exit(1);
            }
            config.delimiter = finalDelim;
        }
        else if (arg === '-b' || arg === '--by') {
            const byValue = args.shift();
            if (!byValue) {
                console.error("Error: La opción --by requiere un valor.");
                process.exit(1);
            }

            const parts = byValue.split(':');
            config.sortFields.push({
                name: parts[0],
                numeric: parts[1] === 'num',
                descending: parts[2] === 'desc'
            });
        }
        else {
            console.error(`Error: Se indica una opción desconocida '${arg}'.`);
            process.exit(1);
        }
    }

    if (config.sortFields.length === 0) {
        console.error("Error: No se especifica ningún criterio --by.");
        process.exit(1);
    }

    return config;
}

function readInput(inputFile) {
    try {
        const content = fs.readFileSync(inputFile, 'utf8');
        return content;
    } catch (error) {
        console.error(`Error: El archivo de origen '${inputFile}' no existe o no puede leerse.`);
        process.exit(1);
    }
}

function parseDelimited(rawText, config) {
    if (rawText.includes('"')) {
        console.error("Error: La entrada contiene comillas dobles.");
        process.exit(1);
    }

    const lines = rawText.replace(/\r/g, '').split('\n').filter(line => line.length > 0);

    if (lines.length === 0) {
        return { header: null, rows: [] };
    }

    const allRows = lines.map(line => line.split(config.delimiter));
    const expectedColumnCount = allRows[0].length;

    for (let i = 1; i < allRows.length; i++) {
        if (allRows[i].length !== expectedColumnCount) {
            console.error("Error: Las filas tienen diferente cantidad de campos.");
            process.exit(1);
        }
    }

    let header = null;
    let dataRows = allRows;

    if (!config.noHeader) {
        header = allRows.shift(); 
        dataRows = allRows; 
    }

    return {
        header: header,
        rows: dataRows
    };
}

const config = parseArgs(process.argv.slice(2));
const rawText = readInput(config.inputFile);
const parsedData = parseDelimited(rawText, config);

// console.log(HELP)
