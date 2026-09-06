#!/usr/bin/env node
import { readFileSync } from 'node:fs';
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

//console.log(process.argv)

function parseArgs(){

    let items = process.argv.slice(2)
    let config = {
        inputFile: null,
        outputFile: null,
        delimiter: ",",
        noHeader: false,
        sortFields: []
    };

    let i = 0 
    while (i < items.length) {
        if (items[i] === '-h' || items[i] === '--help') {

            console.log(HELP)
            process.exit(0)

        } else if (items[i] === '-b' || items[i] === '--by') {

            config.sortFields.push(items[i + 1])
            i = i + 2
            

        } else if (items[i] === '-d' || items[i] === '--delimiter') {

            config.delimiter = items[i + 1]
            i = i + 2

        } else if (items[i] === '-nh' || items[i] === '--no-header') {

            config.noHeader = true
            i = i + 1

        } else {

            if (config.inputFile === null) {

                config.inputFile = items[i]
                
            } else {

                config.outputFile = items[i]
            }

            i = i + 1
        }
        


    }
    return config;
}


function readInput(config) {
    return readFileSync(config.inputFile, 'utf8')
}


function parseDelimited(texto, config) {

    let lineas = texto.split(/\r?\n/)
    let filas = lineas.map((linea) => linea.split(config.delimiter));
    let encabezado;
    let filasDeDatos;

    if (config.noHeader) {
        encabezado = null;
        filasDeDatos = filas;           
    } else {
        encabezado = filas[0];          
        filasDeDatos = filas.slice(1);  
}

    return { encabezado, filasDeDatos }
}









