#!/usr/bin/env node

import fs from 'fs';
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
    //console.log(HELP)
    
// Escribir aqui la solución al enunciado.
function parseArgs() {
    const args = process.argv.slice(2);
    const inputFile = args[0];
    const outputFile = args[1];
    const sortFields = [];
    let delimiter = ",";
    let noHeader = false;
    for (let i = 0; i <args.length; i++) {
        if (args[i] === '-b' || args[i] === '--by') {
            const criterio = args[i + 1];
            sortFields.push(criterio);
        }if (args[i] === '-d' || args[i] === '--delimiter') {
            const delim = args[i + 1];
            delimiter = delim;
        }
        if (args[i] === '-nh' || args[i] === '--no-header') {
            noHeader = true;
        }
    }
    return {inputFile,outputFile,sortFields,delimiter,noHeader};
}
const {inputFile,outputFile,sortFields,delimiter,noHeader} = parseArgs();
console.log(inputFile,outputFile,sortFields,delimiter,noHeader);


function readInput(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data;
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        process.exit(1);
    }
}
const inputData = readInput(inputFile);
console.log(inputData);


function parseDelimited(text,delimiter) {
    const lines = text.split('\n').map(line=> line.trimEnd());
    const parsedData = lines.map(line => line.split(delimiter));
    return parsedData;
}
const parsedData = parseDelimited(inputData, delimiter);
console.log(parsedData);


function sortRows(data, sortFields, noHeader) {
    const header = noHeader ? [] : data[0];
    const rows = noHeader ? data : data.slice(1);
    
    rows.sort((a, b) => {
        for (let i = 0; i < sortFields.length; i++) {
            const [field, type = 'alpha', order = 'asc'] = sortFields[i].split(':');
            const fieldIndex = noHeader ? parseInt(field) : header.indexOf(field);
            const valorA = a[fieldIndex];
            const valorB = b[fieldIndex];
            
            if(type === "num"){
                const numA = parseFloat(valorA);
                const numB = parseFloat(valorB);
                if(numA < numB) return order === "asc" ? -1 :1;
                if(numA > numB) return order === "asc" ? 1 :-1;
            } else {
               const resultado = valorA.localeCompare(valorB);
               if (resultado !== 0) return order === "asc" ? resultado : -resultado;
            }
        }
    });
    return noHeader ? rows : [header, ...rows];
}

const sortedData= sortRows(parsedData, sortFields,noHeader);
console.log(sortedData);


