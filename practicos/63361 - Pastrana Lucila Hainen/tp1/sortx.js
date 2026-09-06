import fs from "node:fs";

function parseArgs() {
    const args = process.argv.slice(2);


    let configuracion = {};

    if (args[0] === "-h"  || args[0] === "--help") { 
        console.log("-b/--by: indica el campo a ordenar");
        console.log("-d/--delimiter: separador para utilizar");
        console.log("-nh/--no-header: muestra que no hay encabezado");
        console.log("-h/--help: muestra ayuda"); 
        return;
    } 


    configuracion.inputFile = args.shift();
    configuracion.outputFile = args.shift();

    if  (configuracion.inputFile === undefined || configuracion.outputFile === undefined) {
        console.log("Indicar el archivo de origen o el archivo de destino");
        return; 

    }


    configuracion.delimiter = ",";
    configuracion.noHeader = false;
     configuracion.sortFields = [];



    while (args.length > 0) {
        let opcion = args.shift();
        
        if (opcion === "-b" || opcion === "--by") {
             let campo = args.shift() ?? "";

         let partes = campo.split(":");

              configuracion.sortFields.push({
                name: partes[0],
                numeric: partes [1] === "num",

                descending: partes[2] === "desc"
            });
        }
        if (opcion === "-d" ||opcion === "--delimiter") {
            configuracion.delimiter = args.shift();
        }

        if (opcion === "-nh" ||opcion === "--no-header") {
            configuracion.noHeader = true;
        }
        
    }

    if (configuracion.sortFields.length === 0) {
            console.log("Escriba indicando el campo que sea ordenar");
            return;
        }


    return configuracion;

}

function readInput(nombre) {
    let texto = fs.readFileSync(nombre, "utf8");
    return texto;
}


function parseDelimited(texto,  delimiter, noHeader) {
    let tabla = {
        header: [],
        rows: [] 
    }; 

   let filas = texto.split(/\r?\n/).map(linea => linea.split(delimiter));
   
   if (!noHeader) {
    tabla.header = filas.shift(); 
    tabla.rows = filas; 

   } else {

    tabla.header = filas[0].map((valor, i) => i);
     tabla.rows = filas; 
   }

    return tabla; 

}

function sortRows(tabla, sortFields) {
    let filas = [...tabla.rows]; 
    filas.sort((a,b) => {

        for (let field of sortFields) {
            let name = field.name;
            let i = tabla.header.indexOf(name);
            
            let varA = a[i];
            let varB = b[i];

            if (field.numeric) {
                let res = varA - varB;

                if (field.descending) {
                    res = res;
                }
                if (res !=0) {
                     return res;
                }
            }
        }

    }); 

    return {
        header: tabla.header,
        rows: filas
    }; 

}

let configuracion = parseArgs();
let texto = readInput(configuracion.inputFile);
let tabla = parseDelimited(texto, configuracion.delimiter, configuracion.noHeader);
let tablaOrdenada = sortRows(tabla, configuracion.sortFields);


console.log(tablaOrdenada);

