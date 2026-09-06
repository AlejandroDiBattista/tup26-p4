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
// console.log(HELP);
import fs from "fs";

function parseArgs(args){
    if (args.includes('-h') || args.includes('--help')) {
        printHelp();
        process.exit(0);
    }

    const positional = [];
    const sortFieldsRaw = [];
    let delimiter = ',';
    let noHeader = false;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '-b' || arg === '--by') {
            const valor = args [++i];

            if(!valor || valor.startsWith('-')) {
                throw new Error('Falta el valor de la opción -b.');
            }
            
            const partes = valor.split(':');
            
            const campo = partes[0];
            const tipo = partes[1] || "alpha";
            const orden = partes [2] || "asc";

            if (!campo) {
                throw new Error('Falta el nombre del campo en -b')
            }
            if (tipo !== 'alpha' && tipo !== 'num') {
                throw new Error ('el tipo debe ser num o alpha')
            }
            if (orden !== 'asc' && orden !== 'desc') {
                throw new Error ('orden deberia ser desc o asc')
            }

            sortFieldsRaw.push({ campo, tipo, orden });
        }   else if (arg ==='-d' || arg === '--delimiter') {
                const val = args[++i];

                if (!val) {
                    throw new Error('Falta el delimitador para -d');
                }
                delimiter = val;

        }   else if (arg === '-nh' || arg === '--no-header') {
            noHeader = true;

        }   else if (!arg.startsWith('-')) {
            positional.push(arg);
        }
    }

    const sortFields = [];
    for (let i = 0; i <sortFieldsRaw.length; i++) {
        const item = sortFieldsRaw[i];
        sortFields.push({
        name: item.campo,
        numeric: item.tipo === 'num',
        descending: item.orden === 'desc'
        });
    }

    return {
        inputFile: positional [0],
        outputFile: positional [1],
        delimiter: delimiter,
        sortFields: sortFields,
        noHeader: noHeader
    }; 

}