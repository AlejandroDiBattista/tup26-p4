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
 
let configuracion = parseArgs();
let texto = readInput(configuracion.inputFile);

console.log(texto); 