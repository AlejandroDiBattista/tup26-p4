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

function sortRows(parsedData, config) {
    const criteria = config.sortFields.map(field => {
        let colIndex = -1;

        if (config.noHeader) {
            colIndex = parseInt(field.name, 10);
            if (isNaN(colIndex) || colIndex < 0 || colIndex >= parsedData.rows[0].length) {
                console.error(`Error: El campo solicitado '${field.name}' no existe.`);
                process.exit(1);
            }
        } else {
            colIndex = parsedData.header.indexOf(field.name);
            if (colIndex === -1) {
                console.error(`Error: El campo solicitado '${field.name}' no existe.`);
                process.exit(1);
            }
        }

        return { ...field, index: colIndex };
    });

    for (const crit of criteria) {
        if (crit.numeric) {
            for (const row of parsedData.rows) {
                const value = row[crit.index];
                if (value.trim() === '' || isNaN(Number(value))) {
                    console.error(`Error: Un criterio numérico encuentra un valor no numérico '${value}'.`);
                    process.exit(1);
                }
            }
        }
    }

    parsedData.rows.sort((rowA, rowB) => {
        for (const crit of criteria) {
            const valA = rowA[crit.index];
            const valB = rowB[crit.index];

            let comparason = 0;

            if (crit.numeric) {
                comparason = Number(valA) - Number(valB);
            } else {
                comparason = valA.localeCompare(valB, 'es');
            }

            if (comparason !== 0) {
                return crit.descending ? -comparason : comparason;
            }
        }

        return 0; 
    });

    return parsedData;
}

function serialize(sortedData, config) {
    const lines = [];

    if (sortedData.header) {
        const headerLine = sortedData.header.join(config.delimiter);
        lines.push(headerLine);
    }

    for (const row of sortedData.rows) {
        const dataLine = row.join(config.delimiter);
        lines.push(dataLine);
    }

    return lines.join('\n');
}

function writeOutput(outputFile, finalText) {
    try {
        fs.writeFileSync(outputFile, finalText, 'utf8');
    } catch (error) {
        console.error(`Error: El archivo de destino '${outputFile}' no puede escribirse.`);
        process.exit(1);
    }
}

const config = parseArgs(process.argv.slice(2));
const rawText = readInput(config.inputFile);
const parsedData = parseDelimited(rawText, config);
const sortedData = sortRows(parsedData, config);
const finalText = serialize(sortedData, config);
writeOutput(config.outputFile, finalText);

// console.log(HELP)
