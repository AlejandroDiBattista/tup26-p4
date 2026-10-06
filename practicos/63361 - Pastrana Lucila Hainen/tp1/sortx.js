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

    if  (configuracion.inputFile === undefined) { 
        console.log("Indicar el archivo de origen");
        process.exitCode = 1;
        return;
    
    }

    if(configuracion.outputFile === undefined) {
        console.log("Indicar el archivo de destino");
        process.exitCode = 1;
        return;
    }


    configuracion.delimiter = ",";
    configuracion.noHeader = false;
     configuracion.sortFields = [];



    while (args.length > 0) {
        let opcion = args.shift();
        
        if (opcion === "-b" || opcion === "--by") {
             let campo = args.shift();

             if (campo === undefined) {
                console.log("Falta indicar el campo para ordenar");
                process.exitCode = 1;
                return;
             }

         let partes = campo.split(":");

         if (partes[1] !== undefined && partes[1] !== "alpha" && partes[1] !== "num") {
            console.log("Tipo de orden inválido");
            process.exitCode = 1;
            return;
         }

         if (partes[2] !== undefined) {
            if (partes[2] !== "asc" && partes[2] !== "desc") {
                console.log("Orden inválido");
                process.exitCode = 1;
                return;
            }
         
            
         }

              configuracion.sortFields.push({
                name: partes[0],
                numeric: partes [1] === "num",

                descending: partes[2] === "desc"
            });
        }
        else if (opcion === "-d" ||opcion === "--delimiter") {
            let delimiter = args.shift();

            if (delimiter === undefined) {
                console.log("No indicó el delimitador");
                process.exitCode = 1;
                return;
            }

            if(delimiter === "\\t") {
                delimiter = "\t"; 
            }

            if (delimiter.length !== 1) {
                console.log("El delimitador debe poseer un solo carácter");
                process.exitCode = 1;
                return; 
            }

            configuracion.delimiter = delimiter;
        }

        else if (opcion === "-nh" ||opcion === "--no-header") {
            configuracion.noHeader = true;
        }

        else {
            console.log("Opción no válida");
            process.exitCode = 1;
            return;
        }
        
    }

    if (configuracion.sortFields.length === 0) {
            console.log("Escriba indicando el campo que sea ordenar");
            process.exitCode = 1;
            return;
        }


    return configuracion;

}

function readInput(nombre) {
    if (!fs.existsSync(nombre)) {
        console.log("No se pudo leer el archivo de origen");
        process.exitCode= 1;
        return;
    }

    let texto = fs.readFileSync(nombre, "utf8");
    return texto;


}


function parseDelimited(texto,  delimiter, noHeader) {
    let tabla = {
        header: [],
        rows: [] 
    }; 

   let filas = texto.split(/\r?\n/).map(linea => linea.split(delimiter));


   let cantidadCampos = filas[0].length;

   for (let fila of filas) {
     if (fila.length !== cantidadCampos) {
        console.log("Las filas poseen distinta cantidad de campos");
        process.exitCode = 1;
        return;
     }
   }

    for (let fila of filas) {
        for (let campo of fila) {
            if (campo.includes('"')) {
                console.log("No se permiten campos entre comillas");
                process.exitCode = 1;
                return;
            }
        }
    }
   
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

    for (let field of sortFields) {
            let name = field.name;
            let i = tabla.header.indexOf(name);

            if (i === -1) {
                i = tabla.header.indexOf(Number(name));

            }
            
            if (i === -1) {
                console.log("El campo marcado no existe");
                process.exitCode = 1;
                return;
            }
            
        


        if (field.numeric) {
            for (let fila of tabla.rows) {
                if (isNaN(fila[i])) {
                    console.log("Este campo posee un valor no numérico");
                    process.exitCode = 1;
                    return;
                }
            }
        }
    }
           filas.sort((a,b) => {

            for (let field of sortFields) {
            let name = field.name;
            let i = tabla.header.indexOf(name);

            if (i === -1) {
                i = tabla.header.indexOf(Number(name));

            }

            let varA = a[i];
            let varB = b[i];
            let res;

            if (field.numeric) {
   
                res = varA - varB;
            } else{ 
                res= varA.localeCompare(varB);
            }

                if (field.descending) {
                    res = -res;
                }
                if (res !=0) {
                     return res;
                }
            
        }

    }); 

    return {
        header: tabla.header,
        rows: filas
    }; 

}

function serialize(tabla, delimiter,noHeader){
let texto = "";

if (!noHeader) {
    texto = tabla.header.join(delimiter) + "\n"; 
}

texto = texto + tabla.rows.map(linea => linea.join(delimiter)).join("\n");
return texto;
}

function writeOutput(nombre, texto) {
    try {

        fs.writeFileSync(nombre, texto);
    } catch (error) {
        console.log("No se pudo escribir el archivo de destino");
        process.exitCode = 1;
        return;
    }    
}

let configuracion = parseArgs();

if (configuracion !== undefined) {
    let texto = readInput(configuracion.inputFile);

    if (texto !== undefined) {
        let tabla = parseDelimited(texto, configuracion.delimiter, configuracion.noHeader);
        
        if ( tabla !== undefined) {
            let tablaOrdenada = sortRows(tabla, configuracion.sortFields);
            
            if (tablaOrdenada !== undefined) {
                let textoSalida = serialize(tablaOrdenada, configuracion.delimiter, configuracion.noHeader);
                writeOutput(configuracion.outputFile, textoSalida);
            }
        }
    }
}



