#!/usr/bin/env node

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
                console.error(`error: la opciom "${opcion}" requiere un valor.`);
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







let verConfiguracion = parseArgs(process.argv.slice(2));
console.log(verConfiguracion);
