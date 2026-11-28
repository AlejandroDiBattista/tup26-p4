#!/usr/bin/env node

import fs from 'node:fs';

const HELP = `sortx - Ordena archivos de texto delimitados

Uso:
  sortx origen destino [opciones]

Opciones:
  -b, --by <campo[:tipo[:orden]]>  Criterio de ordenamiento; se puede repetir.
                                   tipo: alpha (predeterminado) o num
                                   orden: asc (predeterminado) o desc
  -d, --delimiter <carácter>       Delimitador de un carácter (predeterminado: ,).
                                   Usa "\\t" para tabulación.
  -nh, --no-header                 Indica que el archivo no tiene encabezado.
  -h, --help                       Muestra esta ayuda.

Ejemplos:
  sortx empleados.csv ordenados.csv -b apellido
  sortx empleados.csv salarios.csv -b salario:num:desc
  sortx empleados.csv resultado.csv -b departamento -b salario:num:desc
  sortx datos.csv resultado.csv -nh -b 2:num:desc
  sortx datos.tsv salida.tsv -d "\\t" -b nombre
`;

function parseArgs(args) {
    if (args.includes('-h') || args.includes('--help')) {
        return { help: true };
    }

    if (args.length < 2 || args[0].startsWith('-') || args[1].startsWith('-')) {
        throw new Error('Se requieren los archivos de origen y destino.');
    }

    const config = {
        inputFile: args[0],
        outputFile: args[1],
        sortFields: [],
        delimiter: ',',
        noHeader: false,
    };

    for (let index = 2; index < args.length; index += 1) {
        const option = args[index];
        if (option === '-b' || option === '--by') {
            const value = args[index + 1];
            if (value === undefined || value.startsWith('-')) {
                throw new Error(`La opción ${option} requiere un criterio.`);
            }
            config.sortFields.push(parseSortField(value));
            index += 1;
        } else if (option === '-d' || option === '--delimiter') {
            const value = args[index + 1];
            if (value === undefined || value.startsWith('-')) {
                throw new Error(`La opción ${option} requiere un delimitador.`);
            }
            config.delimiter = value === '\\t' ? '\t' : value;
            index += 1;
        } else if (option === '-nh' || option === '--no-header') {
            config.noHeader = true;
        } else {
            throw new Error(`Opción desconocida: ${option}`);
        }
    }

    if (config.sortFields.length === 0) {
        throw new Error('Debes especificar al menos un criterio con -b o --by.');
    }
    if (Array.from(config.delimiter).length !== 1) {
        throw new Error('El delimitador debe ser un único carácter.');
    }
    return config;
}

function parseSortField(value) {
    const parts = value.split(':');
    if (parts.length > 3 || parts[0] === '') {
        throw new Error(`Criterio inválido: ${value}. Usa campo[:tipo[:orden]].`);
    }

    const [name, type = 'alpha', order = 'asc'] = parts;
    if (type !== 'alpha' && type !== 'num') {
        throw new Error(`Tipo de ordenamiento inválido en el criterio: ${value}.`);
    }
    if (order !== 'asc' && order !== 'desc') {
        throw new Error(`Orden inválido en el criterio: ${value}.`);
    }
    return { name, numeric: type === 'num', descending: order === 'desc' };
}

function readInput(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        throw new Error(`No se pudo leer el archivo de origen "${filePath}": ${error.message}`);
    }
}

function parseDelimited(text, delimiter, noHeader) {
    if (text.includes('"')) {
        throw new Error('La entrada no puede contener comillas dobles.');
    }

    const normalizedText = text.replace(/^\uFEFF/, '');
    const lines = normalizedText.split(/\r?\n/);
    if (lines[lines.length - 1] === '') {
        lines.pop();
    }

    const rows = lines.map((line) => line.split(delimiter));
    if (rows.length === 0) {
        return { header: [], rows: [] };
    }

    const header = noHeader ? [] : rows.shift();
    const expectedColumns = noHeader ? rows[0]?.length : header.length;

    if (expectedColumns !== undefined) {
        const firstDataLine = noHeader ? 1 : 2;
        for (let index = 0; index < rows.length; index += 1) {
            if (rows[index].length !== expectedColumns) {
                throw new Error(
                    `La fila ${firstDataLine + index} tiene ${rows[index].length} campos; se esperaban ${expectedColumns}.`,
                );
            }
        }
    }

    return { header, rows };
}

function sortRows(header, rows, sortFields, noHeader) {
    const fields = sortFields.map((field) => {
        let columnIndex;
        if (noHeader) {
            if (!/^\d+$/.test(field.name) || !Number.isSafeInteger(Number(field.name))) {
                throw new Error(`Con --no-header, el campo "${field.name}" debe ser un índice numérico desde cero.`);
            }
            columnIndex = Number(field.name);
        } else {
            columnIndex = header.indexOf(field.name);
            if (columnIndex === -1) {
                throw new Error(`No existe el campo "${field.name}".`);
            }
        }

        if (rows.some((row) => columnIndex >= row.length)) {
            throw new Error(`No existe la columna de índice ${columnIndex}.`);
        }
        return { ...field, columnIndex };
    });

    for (const field of fields) {
        if (!field.numeric) {
            continue;
        }
        for (let index = 0; index < rows.length; index += 1) {
            const value = rows[index][field.columnIndex];
            if (value.trim() === '' || !Number.isFinite(Number(value))) {
                const lineNumber = index + (noHeader ? 1 : 2);
                throw new Error(
                    `El valor "${value}" de la fila ${lineNumber} no es numérico para el campo "${field.name}".`,
                );
            }
        }
    }

    return rows
        .map((row, originalIndex) => ({ row, originalIndex }))
        .sort((left, right) => {
            for (const field of fields) {
                const valueA = left.row[field.columnIndex];
                const valueB = right.row[field.columnIndex];
                const comparison = field.numeric
                    ? Number(valueA) - Number(valueB)
                    : valueA.localeCompare(valueB);
                if (comparison !== 0) {
                    return field.descending ? -comparison : comparison;
                }
            }
            return left.originalIndex - right.originalIndex;
        })
        .map(({ row }) => row);
}

function serialize(header, rows, delimiter, noHeader) {
    const outputRows = noHeader ? rows : [header, ...rows];
    return outputRows.map((row) => row.join(delimiter)).join('\n');
}

function writeOutput(filePath, text) {
    try {
        fs.writeFileSync(filePath, text, 'utf8');
    } catch (error) {
        throw new Error(`No se pudo escribir el archivo de destino "${filePath}": ${error.message}`);
    }
}

function main() {
    try {
        const config = parseArgs(process.argv.slice(2));
        if (config.help) {
            process.stdout.write(HELP);
            return;
        }

        const text = readInput(config.inputFile);
        const { header, rows } = parseDelimited(text, config.delimiter, config.noHeader);
        const sortedRows = sortRows(header, rows, config.sortFields, config.noHeader);
        const output = serialize(header, sortedRows, config.delimiter, config.noHeader);
        writeOutput(config.outputFile, output);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exitCode = 1;
    }
}

main();
