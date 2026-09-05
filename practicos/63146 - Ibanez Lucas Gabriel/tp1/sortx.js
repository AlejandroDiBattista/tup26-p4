#!/usr/bin/env node
import fs from "fs";
function parseArgs(argv) {
    let configuracion = {
        delimiter: ",",
        noHeader: false,
        sortFields: [],
    }

    let posiciones = []
    while (argv.length > 0) {
        const opcion = argv.shift();

        if (opcion === "-b" || opcion === "--by") {
            let campos = argv.shift();
            if (campos === undefined) {
                console.error(`error: la opcion "${opcion}" requiere un valor.`);
                process.exit(1);
            }
            let partes = campos.split(":");

            let field = { name: partes[0], numeric: partes[1] === "num", descending: partes[2] === "desc" };
            configuracion.sortFields.push(field);
        } else if (opcion === "-d" || opcion === "--delimiter") {
            let valor = argv.shift();
            if (valor === undefined) {
                console.error(`error: la opcion "${opcion}" requiere un valor.`);
                process.exit(1);
            }
            configuracion.delimiter = valor;

        } else if (opcion === "-nh" || opcion === "--no-header") {
            configuracion.noHeader = true;
        }
        else if (opcion === "-h" || opcion === "--help") {
            console.log("Uso: sortx [opciones] <archivo_entrada> <archivo_salida>");
            console.log("Opciones:");
            console.log("  -b, --by <campo>      Campo por el cual ordenar");
            console.log("  -d, --delimiter <delim> Delimitador de campos");
            console.log("  -nh, --no-header      No hay encabezado en el archivo");
            console.log("  -h, --help            Mostrar esta ayuda");
            process.exit(0);
        } else if (opcion.startsWith("-")) { // aqui si viene con solo guio cierra el program
            console.error(`error: solo acepta comandos que estan en help "${opcion}" .`);
            process.exit(1);
        }
        else {
            posiciones.push(opcion);
        }
    }

    configuracion.inputFile = posiciones[0];
    configuracion.outputFile = posiciones[1];
    if (configuracion.inputFile === undefined) {
        console.error("error: falta el archivo de origen.");
        process.exit(1);
    }
    if (configuracion.outputFile === undefined) {
        console.error("error: falta el archivo de destino.");
        process.exit(1);
    }
    if (configuracion.sortFields.length === 0) {
        console.error("error: debe especificar --by.");
        process.exit(1);
    }
    if (configuracion.delimiter === "\\t") {
        configuracion.delimiter = "\t";
    }
    if (configuracion.delimiter.length !== 1) {
        console.error(`error: el delimitador debe ser un unico caracter"`);
        process.exit(1);
    }

    return configuracion;
}


/// Leer archivo

function readInput(filePath) {
    try {
        let texto = fs.readFileSync(filePath, "utf8");
        return texto;
    } catch (err) {
        console.error(`error: no se pudo leer el archivo de origen`);
        process.exit(1);
    }
}

// convertir el texto 

function parseDelimited (texto, delimiter, noHeader) {
    if (texto.includes('"')) {
        console.error(`error: el archivo contiene comillas dobles`);
        process.exit(1);
    } 

    let data = {header:[], rows:[]};
    let lineas = texto.replace(/\r\n/g, "\n").split("\n");
    if (lineas[lineas.length - 1] === "") {
        lineas.pop();
    }
    let rows = lineas.map(linea=>linea.split(delimiter));
    let cantidad = rows[0].length;
    for (let i = 0; i < rows.length; i++) { /// este for va a checkear que todas las filas tengan la misma cantidad de campos
        if (rows[i].length !== cantidad) {
            console.error(`error: la fila ${i + 1} tiene distinta cantidad de campos`);
            process.exit(1);
        }
    }
    if(!noHeader){
        data.header = rows.shift();
    }else{
        data.header = rows[0].map((valor, i)=>i)
    }
    data.rows = rows;
    return data;
}


// Logica del sortx para acomodar las filas

function sortRows (tabla, header, sortFields) {
    let filas = [...tabla.rows]
    filas.sort((a, b) => {
        for (let field of sortFields) {
        let name= field.name, numeric= field.numeric, descending= field.descending;
        let index = tabla.header.indexOf(name);
        let valorA = a[index];
        let valorB = b[index];
        let diff;

        if(numeric ) {
            diff = number(valorA) - number(valorB);
        }else{
            diff = valorA.localeCompare(valorB, "es");
        }

        if(descending) {
            diff= -diff;
        }
        if(diff !== 0) {
            return diff;
        }
        
  }
  return 0
        })
        
    return filas
}

/// rescontruye el texto en su estructura necesario
function serialize (tabla, delimiter, noHeader){
    let cabezera = noHeader ? "" : tabla.header.join(delimiter) + "\n";
    let filas = tabla.rows.map(fila => fila.join(delimiter)).join("\n");
    return cabezera + filas + "\n";
    return cabezera + filas;
}










let verConfiguracion = parseArgs(process.argv.slice(2));
let texto = readInput(verConfiguracion.inputFile);
let datos = parseDelimited(texto, verConfiguracion.delimiter, verConfiguracion.noHeader);
let filasOrdenadas = sortRows(datos, datos.header, verConfiguracion.sortFields);

let tablaOrdenada = { header: datos.header, rows: filasOrdenadas };
let salidaDatos = serialize(tablaOrdenada, verConfiguracion.delimiter, verConfiguracion.noHeader);

console.log(salidaDatos);
