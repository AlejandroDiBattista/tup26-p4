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
//console.log(HELP)//
import fs from "fs";

function parseArgs(args) {
    if (args.includes("-h") || 
args.includes("--help")){
    return {help:true};
}
const config = {
    inputFile: args[0],
    outputFile: args[1],
    delimiter: ",",
    noHeader: false,
    sortFields: []
};
let i = 2;
while (i < args.length) {
    const opcion = args[i];

    if (opcion === "-b" || opcion === "--by"){
        const valor = args[i + 1];
        if (valor) {
            config.sortFields.push({
                name: valor,
                numeric: false,
                descending:false
            });
        }
        i += 2;
    } else if (opcion === "-d" || opcion === "--delimiter"){
        i += 2;
    } else if(opcion === "-nh" || opcion === "--no-header") {
        config.noHeader = true;
        i++;
    } else {
        i++;
    }
}
return config;
}
function readInput(file) {
    return fs.readFileSync(file, "utf8");
}
function parseDelimited(text, delimiter){
    const lineas = text.split(/\r?\n/);
    return lineas.map(linea => linea.split(delimiter));
}
function sortRows(rows, config) {
    return rows;
}
function serialize(rows, delimiter) {
    return rows.map(row => row.join(delimiter)).join("\n");
}
function writeOutput(file, text) {
    fs.writeFileSync(file, text, "utf8");
}
function main() {
    try{
        const config = parseArgs(process.argv.slice(2));
        if(config.help){
            console.log(HELP);
            return;
        }
        const texto =
         readInput(config.inputFile);
        const filas =
        parseDelimited(texto, config.delimiter);
        const ordenadas = 
        sortRows(filas, config);
        const resultado = 
        serialize(ordenadas, config.delimiter);

        writeOutput(config.outputFile, resultado);
    } catch (error) {
        console.error("Error:",
            error.message
        );
        process.exit(1);
    }
}
main();