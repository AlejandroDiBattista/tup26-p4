#!/usr/bin/env node
import {readFileSync, writeFileSync} from 'node:fs';

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

function errur(mensaje) {
    console.error('sortx: ' + mensaje);

    process.exit(1);
}




//1

function interpretarDelimitador(valor) {
    let delimitador = valor;

    if (valor === '\\t') {
        delimitador = '\t';
    }

    if (valor === '\\n') {

        delimitador = '\n';
    }

    if (delimitador.length !== 1) {

        errur('el delimitador debe ser un caracter noma: "' + valor + '"');
    }


    return delimitador;
}




function parseCriterio(valor) {

    const partes = valor.split(':');

    if (partes.length > 3) {

        errur('criterio invalido: "' + valor + '"');
    }

    const campo = partes[0];

    let tipo = 'alpha';

    let orden = 'asc';

    if (partes.length >= 2) {

        tipo = partes[1];

    }

    if (partes.length >= 3) {
        
        orden = partes[2];

    }

    if (campo === '') {

        errur('el criterio "' + valor + '" no indica ningun campo');

    }
    if (tipo !== 'alpha' && tipo !== 'num') {

        errur('tipo de comparacion desconocido: "' + tipo + '"');

    }
    if (orden !== 'asc' && orden !== 'desc') {
        errur('sentido de ordenamiento desconocido: "' + orden + '"');
    }



    const criterio = {

        name: campo,
        numeric: false,
        descending: false,

    };

    if (tipo === 'num') {
        
        criterio.numeric = true;
    }

    if (orden === 'desc') {

        criterio.descending = true;

    }
    return criterio;
}



function parseArgs(arrayDeStrings) {
    const config = {
        inputFile: null,
        outputFile: null,
        delimiter: ',',
        noHeader: false,
        sortFields: [],
        help: false,
    };


    const posicionales = [];
    let i = 0;


    while (i < arrayDeStrings.length) {
        const arg = arrayDeStrings[i];


        if (arg === '-h' || arg === '--help') {
            config.help = true;
            return config;
        }



        if (arg === '-nh' || arg === '--no-header') {
            config.noHeader = true;
            i += 1;
            continue;
        }

        if (arg === '-b' || arg === '--by') {
            if (arrayDeStrings[i + 1] === undefined) {
                errur(`la opción "${arg}" requiere un criterio de ordenamiento`);
            }
            config.sortFields.push(parseCriterio(arrayDeStrings[i + 1]));
            i += 2;
            continue;
        }


        if (arg === '-d' || arg === '--delimiter') {
            if (arrayDeStrings[i + 1] === undefined) {
                errur(`la opción "${arg}" requiere un delimitador`);
            }
            config.delimiter = interpretarDelimitador(arrayDeStrings[i + 1]);
            i += 2;
            continue;
        }


        if (arg.startsWith('-')) errur(`opción desconocida: "${arg}"`);


        posicionales.push(arg);
        i += 1;
    }


    if (posicionales.length === 0) errur('falta el archivo de origen');
    if (posicionales.length === 1) errur('falta el archivo de destino');
    if (posicionales.length > 2) errur(`argumento inesperado: "${posicionales[2]}"`);
    if (config.sortFields.length === 0) errur('falta indicar al menos un criterio con --by');


    config.inputFile = posicionales[0];
    config.outputFile = posicionales[1];

    return config;
}

const config = parseArgs(process.argv.slice(2));
const texto = readInput(config.inputFile);
console.log(parseDelimited(texto, config.delimiter));






//2
function readInput(inputFile) {
    try {
        return readFileSync(inputFile, 'utf8');
    } catch (error) {
        errur('no se pudo leer el archivo: "' + inputFile + '"');
    }
}








//3

function parseDelimited(texto, delimiter) {

    if (texto.includes('"')) {
        errur('las comillas dobles no estan permitidas');

    }

    let limpio = texto.split('\r\n').join('\n');


    while (limpio.endsWith('\n')) {

        limpio = limpio.slice(0, limpio.length - 1);
    }


    if (limpio === '') {
        
        errur('el archivo de origen esta vacio');
    }


    const lineas = limpio.split('\n');

    const filas = [];


    for (let f = 0; f < lineas.length; f = f + 1) {

        filas.push(lineas[f].split(delimiter));

    }

    const ancho = filas[0].length;

    for (let f = 0; f < filas.length; f = f + 1) {

        if (filas[f].length !== ancho) {
            errur('la fila ' + (f + 1) + ' tiene ' + filas[f].length + ' campos y se esperaban ' + ancho);
        }


    }
    return filas;
}








//4


function aNumero(valor, campo) {
    if (valor.trim() === '') {
        errur('el campo "' + campo + '" contiene un valor no numerico: "' + valor + '"');
    }

    const numero = Number(valor);


    if (Number.isNaN(numero)) {
        errur('el campo "' + campo + '" contiene un valor no numerico: "' + valor + '"');
    }


    return numero;
}



function resolverIndices(sortFields, header, ancho) {
    const criterios = [];


    for (let c = 0; c < sortFields.length; c = c + 1) {
        const campo = sortFields[c];
        let indice;


        if (header === null) {
            indice = Number(campo.name);


            if (Number.isInteger(indice) === false) {
                errur('sin encabezado los campos se indican por indice: "' + campo.name + '"');
            }

        } else {

            indice = header.indexOf(campo.name);
        }

        if (indice < 0 || indice >= ancho) {

            errur('el campo "' + campo.name + '" no existe');

        }

        criterios.push({

            name: campo.name,
            numeric: campo.numeric,
            descending: campo.descending,
            indice: indice,

        });
    }


    return criterios;
}



function sortRows(filas, sortFields, header) {

    let ancho;

    if (header === null) {

        ancho = filas[0].length;

    } else {

        ancho = header.length;

    }

    const criterios = resolverIndices(sortFields, header, ancho);

    const copia = filas.slice();


    copia.sort(function (filaA, filaB) {


        for (let c = 0; c < criterios.length; c = c + 1) {

            const criterio = criterios[c];
            const izquierda = filaA[criterio.indice];
            const derecha = filaB[criterio.indice];
            let comparacion;

            if (criterio.numeric) {

                comparacion = aNumero(izquierda, criterio.name) - aNumero(derecha, criterio.name);

            } else {

                comparacion = izquierda.localeCompare(derecha, 'es');

            }
            if (comparacion !== 0) {

                if (criterio.descending) {
                    return -comparacion;

                }
                return comparacion;
            }

        }


        return 0;
    });


    return copia;
}

//console.log(HELP)