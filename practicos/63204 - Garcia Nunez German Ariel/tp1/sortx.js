#!/usr/bin/env node
import fs from 'node:fs';
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
console.log(HELP)


//funciones a realizar:
//1. parseArgs      → leer los argumentos y construir la configuración
function parseArgs(args) {
//validamos que contenfa el help
if (args.includes('-h') || args.includes('--help')) {
    return {
        showHelp: true
    }
}
//validar que tenga el origen y destino
const origen = args[0]
const destino = args[1]

if (!origen || !destino) {
    throw new Error('faltan datos de origen y/o destino')
}
//validar que tenga el delimitador
let delimiter = ','
 
if (args.includes('-d') || args.includes('--delimiter')) {
    const index = args.indexOf('-d') !== -1 ? args.indexOf('-d') : args.indexOf('--delimiter')
    delimiter = args[index + 1]
    if(delimiter.length !== 1 && delimiter !== "\\t") {
        throw new Error('el delimitador debe ser un solo caracter')
    }
}
//corroborar el encabezado
const noencabezado = args.includes('-nh') || args.includes('--no-header')

// corroborar el criterio de ordenamiento
const criterios = [];
for (let i = 0; i < args.length; i++) {
    if (args[i] === '-b' || args[i] === '--by') {
        const criterio = args[i + 1];
        if(!criterio){
            throw new Error('la opcion --by requiere un argumento');
        }
        const partes = criterio.split(':');
        
        criterios.push({
            name: partes[0],
            numeric: partes[1] === 'num',
            descending: partes[2] === 'desc'
        });
    }
}

if (criterios.length === 0) {
    throw new Error('Se requiere al menos un criterio de ordenamiento');
}

return {
    inputFile: origen,
    outputFile: destino,
    delimiter: delimiter === "\\t" ? "\t" : delimiter,
    noHeader: noencabezado,
    sortFields: criterios 
};
}


//2. readInput      → leer el archivo de origen
function readInput(rutadelarchivo) {
    //leeremos el archivo con try catch para manejar errores
    try {
        const contenido = fs.readFileSync(rutadelarchivo, 'utf-8');
        return contenido;
    } catch (error) {
        throw new Error(`Error al leer el archivo: ${error.message}`);
    }
}
//3. parseDelimited → convertir el texto en filas y columnas
//4. sortRows       → ordenar las filas
//5. serialize      → reconstruir el texto delimitado
//6. writeOutput    → escribir el archivo de destino
function writeOutput(rutadelarchivo, contenido) {
    try {
        fs.writeFileSync(rutadelarchivo, contenido, 'utf-8');
    } catch (error) {
        throw new Error(`Error al escribir el archivo: ${error.message}`);
    }
}
