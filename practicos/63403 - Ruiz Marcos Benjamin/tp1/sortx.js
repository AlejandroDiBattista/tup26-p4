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
// 1. parseArgs      → leer los argumentos y construir la configuración
// 2. readInput      → leer el archivo de origen
// 3. parseDelimited → convertir el texto en filas y columnas
// 4. sortRows       → ordenar las filas
// 5. serialize      → reconstruir el texto delimitado
// 6. writeOutput    → escribir el archivo de destino



function parseArgs() {
let inputFile = process.argv[2];
let outputFile = process.argv[3];
let delimiter = ',';
let noHeader = false;
let sortFields = [];

if (process.argv[2] === "-h" || process.argv[2] === "--help") {
        console.log(HELP);
        process.exit(0);
    }

for (let i = 4; i < process.argv.length; i++) {
    const arg = process.argv[i];    
    //console.log(arg);
if (arg === "-b" || arg === "--by") {
    const valor = process.argv[i + 1];
    //console.log(valor);
    const partes = valor.split(':');
    //console.log(partes);
    const tipo = partes[1] || "alpha";
    const orden = partes[2] || "asc";
    const numeric = tipo === "num";
    const descending = orden === "desc";
    sortFields.push({ name: partes[0], numeric, descending });
    }
else if (arg === "-nh" || arg === "--no-header") {
        noHeader = true;
    }
else if (arg === "-d" || arg === "--delimiter") {
        delimiter = process.argv[i + 1];
    }
else if (arg === "-h" || arg === "--help") {
        console.log(HELP);
        process.exit(0);
    }

}
return { inputFile, outputFile, delimiter, noHeader, sortFields };
}

//console.log(parseArgs());

function readInput(archivo) {
    const contenido = readFileSync(archivo, 'utf8');
    return(contenido);
}   

//console.log(readInput('empleados.csv'));

function parseDelimited(texto, delimitador){
const lineas = texto.split('\r\n');
const filas = [];
for (let i = 0; i < lineas.length; i++) {
const fila = lineas[i];
const columnas = fila.split(delimitador);
filas.push(columnas);}
return filas;
}

//console.log(parseDelimited(readInput('empleados.csv'), ','));

function sortRows(filas, sortFields, noHeader) {
let datos;
let encabezado;
const criterios =[];
if (noHeader) {
     encabezado = null;
     datos = filas;
 }
 else {
     encabezado = filas[0];
     datos = filas.slice(1);
 }
for (let i = 0; i < sortFields.length; i++) {
const campos = sortFields[i];
let indice;
if (noHeader) {
    indice = Number(campos.name);
}
else {
    indice = encabezado.indexOf(campos.name);

}
criterios.push({ indice, numeric: campos.numeric, descending: campos.descending });
}

datos.sort((a, b) => {
for (let i = 0; i < criterios.length; i++) {
const criterio = criterios[i];
let resultado;
if (criterio.numeric) {
  resultado = Number(a[criterio.indice]) - Number(b[criterio.indice]);
} else {
  resultado = a[criterio.indice].localeCompare(b[criterio.indice]);
}
if (criterio.descending) {
  resultado = -resultado;
}
if (resultado !== 0) {
  return resultado;
}

}
return 0;
});
if (encabezado !== null) {
    datos.unshift(encabezado);
}
return datos;
}


//const config = parseArgs();
//const contenido = readInput(config.inputFile);
//const filas = parseDelimited(contenido, config.delimiter);
//const filasOrdenadas = sortRows(filas, config.sortFields, config.noHeader);
//console.log(filasOrdenadas);

function serialize(filas, delimitador) {
const lineas = [];
for (let i = 0; i < filas.length; i++) {
const fila = filas[i];
const linea = fila.join(delimitador);
lineas.push(linea);
}
return lineas.join('\r\n');
}

const config = parseArgs();
const contenido = readInput(config.inputFile);
const filas = parseDelimited(contenido, config.delimiter);
const filasOrdenadas = sortRows(filas, config.sortFields, config.noHeader);
const resultado = serialize(filasOrdenadas, config.delimiter);
console.log(resultado);