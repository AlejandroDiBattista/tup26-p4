#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
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
            if (config.delimiter === "\\t") {
                config.delimiter = '\t'
            }

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


function sortRows(filasDeDatos, encabezado, config) {

    let criterios = config.sortFields.map((criterio) => {

        let partes = criterio.split(':')

        let name = partes[0]
        let tipo = partes[1] || 'alpha'
        let orden = partes[2] || 'asc'
        let  numeric = tipo === 'num'
        let descending = orden === 'desc'

        let index;
        if (config.noHeader) {
            index = Number(name)
        } else {
            index = encabezado.indexOf(name)
        }

        return { name, numeric, descending, index}


    }); 
    
    filasDeDatos.sort((filaA, filaB) => {

        for (let criterio of criterios) {

            let valorA = filaA[criterio.index]
            let valorB = filaB[criterio.index]

            if (criterio.numeric) {
                valorA = Number(valorA)
                valorB = Number(valorB)
            }

            let resultado;

            if (criterio.numeric) {
                resultado = valorA - valorB;
            } else {
                resultado = valorA.localeCompare(valorB);
            }

            if (criterio.descending) {
                resultado = resultado * -1;
            }

            if (resultado !== 0) {
                return resultado;
            }

            
        }
        return 0
        
        
    });
    return filasDeDatos


}

function serialize(encabezado, filasDeDatos, config) {

    let lineasDeDatos = filasDeDatos.map((fila) => fila.join(config.delimiter))

    if (encabezado !== null) {
    lineasDeDatos.unshift(encabezado.join(config.delimiter))
    }

    let textoFinal = lineasDeDatos.join('\n')
    return textoFinal

}

function writeOutput(config, texto) {

    return writeFileSync(config.outputFile, texto, 'utf8')

}

let config = parseArgs()
let texto = readInput(config)
let resultado = parseDelimited(texto, config)
let ordenadas = sortRows(resultado.filasDeDatos, resultado.encabezado, config)
let textoSalida = serialize(resultado.encabezado, ordenadas, config)
writeOutput(config, textoSalida)







