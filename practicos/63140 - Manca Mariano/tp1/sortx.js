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
// 1. parseArgs      → leer los argumentos y construir la configuración
import fs from "fs";



function parseArgs() {
let configuracion = {
    inputFile: null,
    outputFile: null,
    delimiter: ",",
    noHeader: false,
    sortFields: []
  };
const args = process.argv.slice(2);

if (args[0] === "-h" || args[0] === "--help") {
    console.log(HELP);
    process.exit(0);}


configuracion.inputFile = args.shift();
if (!configuracion.inputFile) {
    throw new Error("Falta el archivo de origen"); 
}

configuracion.outputFile = args.shift();
if (!configuracion.outputFile) {
    throw new Error("Falta el archivo de destino"); 
}
    
while (args.length !==0) {
    let opcion = args.shift();
    
        if (opcion === "-b" || opcion === "--by") {
        let field = args.shift();
        if (!field) {
    throw new Error("una opción no recibe su valor"); 
}
        let partes = field.split(":");
        let name = partes[0];
        let numerico = partes[1];
        let descending = partes[2];
        let temp = { name: name, numeric: numerico === "num", descending: descending === "desc" };
       
        configuracion.sortFields.push(temp);
       
}
    else if (opcion === "-d" || opcion === "--delimiter") {
    configuracion.delimiter = args.shift();
    if (!configuracion.delimiter) {
        throw new Error("una opción no recibe su valor");
    }
    }
    else if (opcion === "-nh" || opcion === "--no-header") {
        configuracion.noHeader = true;

    }
    else {
        throw new Error("se indica una opción desconocida");
       
    }
}

 if (configuracion.sortFields.length === 0) {
            throw new Error("no se especifica ningún criterio --by");
        
    }

     if ( configuracion.delimiter.length !== 1) {
            throw new Error("el delimitador no es un único carácter ");
    } 

return configuracion;
}

function readInput  (inputFile) {
    try {
        let texto = fs.readFileSync(inputFile, "utf-8");
        return texto;
    } catch (error) {
        throw new Error("el archivo de origen no existe o no puede leerse");
    }
    
}
