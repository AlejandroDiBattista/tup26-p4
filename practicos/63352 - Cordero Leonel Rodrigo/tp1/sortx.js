#!/usr/bin/env node

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

const config = parseArgs(process.argv.slice(2));
console.log(config);

console.log(HELP)