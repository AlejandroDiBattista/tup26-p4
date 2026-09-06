#!/usr/bin/env node
import fs from "fs";
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

function parseArgs() {
     const args = process.argv.slice(2);
     const inputFile = args[0];
     const outputFile = args[1];
     if(inputFile === undefined) {
        throw new Error("Falta indicar el archivo de origen");
     }
     if (outputFile === undefined) {
        throw new Error("Falta indicar el archivo de destino");
     }
     const sortFields = [];
     let noHeader = false;
     for (let i = 2; i < args.length; i++) {
          if (args[i] === "-b" || args[i] === "--by") {
            if (args[i + 1] === undefined) {
                throw new Error("Falta el valor de --by");
            }
            const criterio = args[i+1];
            const partes = criterio.split(":");
            const name = partes[0];
            const tipo = partes[1] || "alpha";
            const orden = partes[2] || "asc";
            const numeric = tipo === "num";
            const descending = orden === "desc";
            const campo = {name: name, numeric: numeric, descending: descending,};
            sortFields.push(campo);    
        }
        if(args[i] === "-nh" || args[i] === "--no-header"){
            noHeader = true;
        }
       
}
    return {inputFile: inputFile, outputFile: outputFile, delimiter: ",", noHeader: noHeader, sortFields: sortFields};
}
const config = parseArgs();


function readInput(inputFile){
    const contenido = fs.readFileSync(inputFile, "utf8");
    return contenido;
}
const contenido = readInput(config.inputFile);
const rows = parseDelimited(contenido, config.delimiter);
const sortedRows = sortRows(rows, config);

 
function parseDelimited(contenido, delimiter) {
    if (contenido.includes('"')) {
        throw new Error("El archivo contiene comillas dobles");
    }
    const filas = contenido.trim().split("\n");
    const rows = [];
    let cantidadColumnas;
    for (let i = 0; i < filas.length; i++) {
    const fila = filas[i].replace(/\r$/, "");
    const columnas = fila.split(delimiter);
    if (i === 0) {
        cantidadColumnas = columnas.length;
    }
    if (columnas.length !== cantidadColumnas) {
        throw new Error("Las filas tienen distinta cantidad de columnas");
    }
    rows.push(columnas); 
    }
 return rows;
    
}
 
function sortRows(rows, config) {
    const headers = config.noHeader ? null : rows[0];
    const dataRows = config.noHeader ? rows : rows.slice(1);
    dataRows.sort((a, b) => {
        for (let i = 0; i < config.sortFields.length; i++){
            const criterio = config.sortFields[i];
            let indice;
            if (config.noHeader) {
                indice = Number(criterio.name);
            } else {
                indice = headers.indexOf(criterio.name);
            }

            if (indice === -1) {
                throw new Error("El campo solicitado no existe");
            }
        
        if (criterio.numeric) {
            const valorA = Number(a[indice]);
            const valorB = Number(b[indice]);
            if (Number.isNaN(valorA) || Number.isNaN(valorB)){
                throw new Error("El criterio numerico contiene un valor no numerico");
            }

            if(valorA < valorB) {
                return criterio.descending ? 1 : -1;
            }

            if (valorA > valorB) {
                return criterio.descending ? -1 : 1;
            }
            
        }
        
        if (!criterio.numeric) {
            const comparacion = a[indice].localeCompare(b[indice], "es");

        if(comparacion !==0) {
        if (criterio.descending) {
            return -comparacion;
        }
        
        return comparacion;
        }
    }
        return 0;

}

    });

    if (config.noHeader) {
        return dataRows;
    }
 return [headers, ...dataRows];

}

function serialize(rows, delimiter) {
    const filas = rows.map((fila) => {
        return fila.join(delimiter);
        

    });
    return filas.join("\n");
}

const texto = serialize(sortedRows, config.delimiter);
writeOutput(config.outputFile, texto);

function writeOutput(outputFile, contenido){
    fs.writeFileSync(outputFile, contenido, "utf8");
}






console.log(HELP)

