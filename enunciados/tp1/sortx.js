
import {readFileSync, writeFileSync} from 'node:fs';

`sortx - Ordena archivos de texto delimitados
USO:
    sortx <origen> <destino> [opciones]
OPCIONES:
    -b, --by <criterio> Criterio de ordenamiento. Se puede repetir.
                        Formato: campo[:tipo[:orden]]
                        tipo: alpha (predeterminado) o num
                        orden: asc (predeterminado) o desc
   -d, --delimiter <c> Delimitador de un solo carácter. Predeterminado: ","
    -nh, --no-header    Indica que el archivo no tiene encabezado.
    -h, --help          Muestra esta ayuda.
`;

function parseArgs(args) {
    if (args.includes('-h') || args.includes('--help')) {
        return {help: true};
    }

    const positional = [];
    const sortFields = [];
    let delimiter = ',';
    let noHeader = false;

    for (let i = 0; i < args.length; i += 1) {
        const arg = args[i];
        if (arg === '-b' || arg === '--by') {
            const value = args[++i];
            if (value === undefined || value.startsWith('-')) {
                throw new Error(`la opción ${arg} requiere un criterio`);
            }
            sortFields.push(parseSortField(value));
        } else if (arg === '-d' || arg === '--delimiter') {
            const value = args[++i];
            if (value === undefined) {
                throw new Error(`la opción ${arg} requiere un delimitador`);
            }
            delimiter = value === '\\t' ? '\t' : value;
            if ([...delimiter].length !== 1) {
                throw new Error('el delimitador debe ser un único carácter');
            }
        } else if (arg === '-nh' || arg === '--no-header') {
            noHeader = true;
        } else if (arg.startsWith('-')) {
            throw new Error(`opción desconocida: ${arg}`);
        } else {
            positional.push(arg);
        }
    }

    if (positional.length < 2) {
        throw new Error('se requieren los archivos de origen y destino');
    }
    if (positional.length > 2) {
        throw new Error(`argumento inesperado: ${positional[2]}`);
    }
    if (sortFields.length === 0) {
        throw new Error('se debe especificar al menos un criterio --by');
    }

    return {
        inputFile: positional[0],
        outputFile: positional[1],
        delimiter,
        noHeader,
        sortFields,
    };
}

function parseSortField(value) {
    const parts = value.split(':');
    if (parts.length > 3 || parts[0] === '') {
        throw new Error(`criterio inválido: ${value}`);
    }
    const [name, type = 'alpha', order = 'asc'] = parts;
    if (type !== 'alpha' && type !== 'num') {
        throw new Error(`tipo inválido en el criterio: ${value}`);
    }
    if (order !== 'asc' && order !== 'desc') {
        throw new Error(`orden inválido en el criterio: ${value}`);
    }
    return {name, numeric: type === 'num', descending: order === 'desc'};
}

function readInput(file) {
    try {
        return readFileSync(file, 'utf8');
    } catch (error) {
        throw new Error(`no se pudo leer el archivo de origen "${file}": ${error.message}`);
    }
}

function parseDelimited(text, delimiter) {
    if (text.includes('"')) {
        throw new Error('la entrada no admite comillas dobles');
    }
    const normalized = text.replace(/\r\n?/g, '\n');
    const lines = normalized.endsWith('\n') ? normalized.slice(0, -1).split('\n') : normalized.split('\n');
    if (lines.length === 1 && lines[0] === '') {
        return [];
    }

    const rows = lines.map((line) => line.split(delimiter));
    const fieldCount = rows[0].length;
    if (rows.some((row) => row.length !== fieldCount)) {
        throw new Error('todas las filas deben tener la misma cantidad de campos');
    }
    return rows;
}

function sortRows(rows, config) {
    const header = config.noHeader ? null : rows.shift();
    const fields = config.sortFields.map((field) => {
        const index = config.noHeader ? parseColumnIndex(field.name) : findHeaderIndex(header, field.name);
        if (index < 0 || index >= (header ?? rows[0] ?? []).length) {
            throw new Error(`el campo solicitado no existe: ${field.name}`);
        }
        return {...field, index};
    });

    for (const field of fields) {
        if (field.numeric) {
            for (const row of rows) {
                if (!Number.isFinite(Number(row[field.index]))) {
                    throw new Error(`el criterio numérico contiene un valor no numérico`);
                }
            }
        }
    }

    const sorted = [...rows].sort((left, right) => {
        for (const field of fields) {
            const comparison = compareValues(left[field.index], right[field.index], field);
            if (comparison !== 0) {
                return comparison;
            }
        }
        return 0;
    });
    return header === null ? sorted : [header, ...sorted];
}

function parseColumnIndex(name) {
    if (!/^\d+$/.test(name)) {
        throw new Error(`sin encabezado, el campo debe ser un índice numérico: ${name}`);
    }
    return Number(name);
}

function findHeaderIndex(header, name) {
    const index = header.indexOf(name);
    if (index === -1) {
        throw new Error(`el campo solicitado no existe: ${name}`);
    }
    return index;
}

function compareValues(left, right, field) {
    let result;
    if (field.numeric) {
        const leftNumber = Number(left);
        const rightNumber = Number(right);
        if (!Number.isFinite(leftNumber) || !Number.isFinite(rightNumber)) {
            throw new Error(`el criterio numérico contiene un valor no numérico`);
        }
        result = leftNumber - rightNumber;
    } else {
        result = left.localeCompare(right);
    }
    return field.descending ? -result : result;
}

function serialize(rows, delimiter) {
    return rows.map((row) => row.join(delimiter)).join('\n');
}

function writeOutput(file, content) {
    try {
        writeFileSync(file, content, 'utf8');
    } catch (error) {
        throw new Error(`no se pudo escribir el archivo de destino "${file}": ${error.message}`);
    }
}

function main() {
    try {
        const config = parseArgs(process.argv.slice(2));
        if (config.help) {
            console.log(HELP);
            return;
        }
        const rows = parseDelimited(readInput(config.inputFile), config.delimiter);
        if (rows.length === 0) {
            throw new Error('el archivo de origen está vacío');
        }
        writeOutput(config.outputFile, serialize(sortRows(rows, config), config.delimiter));
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exitCode = 1;
    }
}

main();
