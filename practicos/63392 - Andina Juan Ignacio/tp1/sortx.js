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

// Escribir aqui la solución al enunciado.
function main() {
    if (process.args.includes('-h') || process.args.includes('--help')) {
        console.log(HELP);
        process.exit(0);
    }

    try {
        const config = parseArgs(process.argv.slice(2));
    } catch (error) {
        
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
            config.sortFields.push(parseSortField(args[i]));
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

function parseSortField(sortFields) {
    const [campo, tipo = 'alpha', orden = 'asc'] = sortFields.split(':');

    return {
        name: campo, 
        numeric: tipo === 'num',
        descendig: orden === 'desc',
    }
}
