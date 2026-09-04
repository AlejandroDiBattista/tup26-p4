#!/usr/bin/env node

import fs from 'node:fs'

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
                        Usá "\\t" para archivos separados por tabulaciones.

    -nh, --no-header    Indica que el archivo no tiene encabezado.
                        Los campos se identifican mediante índices desde cero.

    -h, --help          Muestra esta ayuda.

EJEMPLOS:
    sortx empleados.csv ordenados.csv -b apellido
    sortx empleados.csv salarios.csv -b salario:num:desc
    sortx empleados.csv resultado.csv -b departamento -b salario:num:desc
    sortx datos.csv resultado.csv -nh -b 2:num:desc
    sortx datos.tsv salida.tsv -d "\\t" -b nombre
`

function fail(message) {
    return new Error(message)
}
function parseArgs(argv) {
    if (argv.includes('-h') || argv.includes('--help')) {
        console.log(HELP);
        process.exit(0)
    }
    if (argv.length < 2) {
        throw fail('falta el archivo de origen o el archivo de destino')
    }
    const[inputFile, outputFile]=argv
    if (inputFile.startsWith('-') || outputFile.startsWith('-')) {
        throw fail('falta el archivo de origen o el archivo de destino');
    }
    const config = {
        inputFile,
        outputFile,
        delimiter:',',
        noHeader: false,
        sortFields:[],
    }
    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
    
        switch (arg) {
            case '-b':
            case '--by': {
                const value = argv[i + 1];
                if (value === undefined) {
                throw fail(`la opción "${arg}" no recibió su valor.`);
                }
                config.sortFields.push(parseSortField(value));
                i++;
                break;
            }
        
            case '-d':
            case '--delimiter': {
                const value = argv[i + 1];
                if (value === undefined) {
                throw fail(`la opción "${arg}" no recibió su valor.`);
                }
                config.delimiter = resolveDelimiter(value);
                i++;
                break;
            }
        
            case '-nh':
            case '--no-header':
                config.noHeader = true;
                break;
        
            default:
                throw fail(`opción desconocida: "${arg}".`);
        }
    }
    if (config.sortFields.length === 0) {
        throw fail('no se especificó ningún criterio --by.');
    }
    
    return config;
}
    function parseSortField(raw) {
        const parts = raw.split(':');
        if (parts.length > 3 || parts[0] === '') {
            throw fail(`criterio de ordenamiento inválido: "${raw}".`);
        }
        
        const [name, tipo = 'alpha', orden = 'asc'] = parts;
        
        if (tipo !== 'alpha' && tipo !== 'num') {
            throw fail(`tipo inválido en "${raw}" (debe ser "alpha" o "num").`);
        }
        if (orden !== 'asc' && orden !== 'desc') {
            throw fail(`orden inválido en "${raw}" (debe ser "asc" o "desc").`);
        }
        
        return { name, numeric: tipo === 'num', descending: orden === 'desc' };
    }
    
    function resolveDelimiter(value) {
        const resolved = value === '\\t' ? '\t' : value;
        if (resolved.length !== 1) {
            throw fail('el delimitador no es un único carácter.');
        }
        return resolved;
        }
        

function readInput(config) {
    try {
        return fs.readFileSync(config.inputFile, 'utf8')
    } catch (err) {
        throw fail(`no se pudo leer el archivo de origen "${config.inputFile}": ${err.message}`)
    }
}

function parseDelimited(text, config) {
    const lines = text.split(/\r\n|\n/)
    if (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop()
    }

    if (lines.length === 0) {
        throw fail('el archivo de origen está vacío.')
    }

    for (const line of lines) {
        if (line.includes('"')) {
            throw fail('la entrada contiene comillas dobles, que no están admitidas.')
        }
    }

    const allRows = lines.map((line) => line.split(config.delimiter))
    const expectedFieldCount = allRows[0].length

    allRows.forEach((row, idx) => {
        if (row.length !== expectedFieldCount) {
            throw fail(`la fila ${idx + 1} tiene ${row.length} campo(s), se esperaban ${expectedFieldCount}.`)
        }
    })

    const header = config.noHeader ? null : allRows[0]
    const rows = config.noHeader ? allRows : allRows.slice(1)

    return { header, rows }
}


function resolveFieldIndex(field, header, config, columnCount) {
    if (config.noHeader) {
        const index = Number(field)
        if (!Number.isInteger(index) || index < 0 || index >= columnCount) {
            throw fail(`el campo solicitado no existe: "${field}".`)
        }
        return index
    }

    const index = header.indexOf(field)
    if (index === -1) {
        throw fail(`el campo solicitado no existe: "${field}".`)
    }
    return index
}

function sortRows(rows, config, header) {
    const columnCount = header ? header.length : (rows[0] ? rows[0].length : 0)

    const fields = config.sortFields.map((sf) => ({
        ...sf,
        index: resolveFieldIndex(sf.name, header, config, columnCount),
    }))

    for (const field of fields) {
        if (!field.numeric) continue
        for (const row of rows) {
            const raw = row[field.index].trim()
            if (raw === '' || Number.isNaN(Number(raw))) {
                throw fail(`valor no numérico "${row[field.index]}" en el campo "${field.name}".`)
            }
        }
    }

    return [...rows].sort((a, b) => {
        for (const field of fields) {
            const valueA = a[field.index]
            const valueB = b[field.index]

            const cmp = field.numeric
                ? Number(valueA) - Number(valueB)
                : valueA.localeCompare(valueB, 'es', { sensitivity: 'base' })

            if (cmp !== 0) {
                return field.descending ? -cmp : cmp
            }
        }
        return 0
    })
}


function serialize(header, rows, config) {
    const lines = []
    if (header) {
        lines.push(header.join(config.delimiter))
    }
    for (const row of rows) {
        lines.push(row.join(config.delimiter))
    }
    return lines.join('\n') + '\n'
}

function writeOutput(config, text) {
    try {
        fs.writeFileSync(config.outputFile, text, 'utf8')
    } catch (err) {
        throw fail(`no se pudo escribir el archivo de destino "${config.outputFile}": ${err.message}`)
    }
}

        function main() {
        try {
            const config = parseArgs(process.argv.slice(2));
            const rawText = readInput(config);
            const { header, rows } = parseDelimited(rawText, config);
            const sortedRows = sortRows(rows, config, header);
            const outputText = serialize(header, sortedRows, config);
            writeOutput(config, outputText);
        } catch (err) {
            console.error(`Error: ${err.message}`);
            process.exit(1);
        }
    }

main();