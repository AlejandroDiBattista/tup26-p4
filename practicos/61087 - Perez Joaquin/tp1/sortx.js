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

import fs from 'node:fs';



let argumento= process.argv.slice(2)

function parseArgs() {
    
    let sortfields = []

    let delimiter = ',';
    for (let i = 0; i < argumento.length; i++) {
        switch (argumento[i]) {
            case '-d':
            case '--delimiter':
                if (!delimiter || delimiter.startsWith('-')) {
                    console.log("Error: Debe especificar un delimitador después de -d o --delimiter.");
                    process.exit(1);
                }
                break;
        }
    }

    let noHeader = false;
    for (let i = 0; i < argumento.length; i++) {
        switch (argumento[i]) {
            case '-nh':
            case '--no-header':
                noHeader = true;
                break;
        }
    }

    if (argumento.includes('-h') || argumento.includes('--help')) {
        console.log(HELP);
        process.exit(0);
    }
    if (argumento.length < 2) {
        console.log("Error: falta el archivo de origen o destino.");
        process.exit(1);
    }


    for (let i = 0; i < argumento.length; i++) {
        let arg = argumento[i];
        //console.log(arg);
        switch (arg) {
            case '-b':
            case '--by':
            let criterio = argumento[i + 1]
            if (!criterio || criterio.startsWith('-')) {
                console.log("Error: Debe especificar un criterio de ordenamiento después de -b o --by.");
                process.exit(1);
            }
            console.log("Criterio:", criterio.split(':'));
            sortfields.push({ name: criterio.split(':')[0], numeric: criterio.split(':')[1] === 'num', descending: criterio.split(':')[2] === 'desc' });

            break;
        }
        
    }
    if (sortfields.length === 0) {
        console.log("Error: Debe especificar al menos un criterio de ordenamiento");
        process.exit(1);
    }

    console.log(sortfields);

    const configuracion = {
        inputFile: argumento[0],
        outputFile: argumento[1],
        delimiter: delimiter,
        noHeader: noHeader,
        sortFields: sortfields
    }
    return configuracion;
}

const configuracion = parseArgs();
console.log(configuracion);


function readInput(inputFile) {
    return fs.readFileSync(inputFile, 'utf8');
}
readInput(configuracion.inputFile);
let data = readInput(configuracion.inputFile);
console.log(data);

function parseDelimited(data, delimiter) {
    let filas = data.split('\r\n');
    let parseData = filas.map(fila => fila.split(delimiter));  
    return parseData;
}
let parseData = parseDelimited(data, configuracion.delimiter);
console.log(parseData);


function sortRows(parseData, configuracion) {
    let header = [];
    if (!configuracion.noHeader) {
        header = parseData.shift();
    }
    
    let criterios = configuracion.sortFields.map(campo => {
        let indice ;
        if(configuracion.noHeader){
            indice = Number(campo.name)
        }else{
            indice = header.indexOf(campo.name);
        }

        if (indice === -1 || Number.isNaN(indice)) {
            console.log(`Error: El campo "${campo.name}" no se encuentra en el encabezado.`);
            process.exit(1);
        }

        return { ...campo, indice };
    });

    parseData.sort((a, b) => {
        for (let criterio of criterios) {
            let valorA = a[criterio.indice];
            let valorB = b[criterio.indice];

            let comparacion;

            if (criterio.numeric) {
                comparacion = Number(valorA) - Number(valorB);

            } else {
                comparacion = valorA.localeCompare(valorB);
            }
            if (criterio.descending) {
                comparacion *= -1;
            }
            if (comparacion !== 0) {
                return comparacion;
            }
        }
        return 0;
    });
    
    let filasOrdenadas = [];
    if (!configuracion.noHeader){
        filasOrdenadas.push(header)
    }
    filasOrdenadas.push(...parseData)
    return filasOrdenadas
                
}
const filasOrdenadas = sortRows(parseData,configuracion)
console.log(filasOrdenadas)

function serialize (filasOrdenadas,delimiter ){
    let lineas = [];
    for (let linea of filasOrdenadas) {
        lineas.push(linea.join(delimiter))
    }
    let arreglo = lineas.join('\n')
    return arreglo
}  

let arreglo = serialize(filasOrdenadas,configuracion.delimiter)
console.log(arreglo)
    









//node .\sortx.js empleados.csv ordenados.csv -b apellido

