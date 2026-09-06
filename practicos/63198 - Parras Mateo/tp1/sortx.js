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

import fs from "node:fs"

function parseArgs(argv){
    const opciones = {
        inputFile:null,
        outputFile: null,
        delimiter: ",",
        noHeader: false,
        sortFields: []
    }
    const restantes=[]
    let i = 0;

    while (i<argv.length){
        const arg =argv[i]

        if (arg === "-h" || arg === "--help"){
            console.log(HELP);
            process.exit(0);
        } else if (arg === "-nh"|| arg === "--no-header"){
            opciones.noHeader=true;
            i++;
        }else if (arg === "-b" || arg === "--by") {
            if (i+1 >= argv.length) {
                console.error ("ERROR: -b/--by no tiene valor");
                process.exit(1)
            }
            const partes= argv[i+1].split(":");
            const name= partes[0];
            const tipo= partes [1] || "alpha";
            const orden= partes [2] || "asc";
            if (!name){
                console.error("ERROR: falta completar un campo --by")
                process.exit(1)
            }
            if (tipo !== "alpha" && tipo !== "num") {
                console.error("ERROR: tipo no reconocido: \"" + tipo + "\"" )
                process.exit(1);
            }
            if (orden !== "asc" && orden !== "desc"){
                console.error("ERROR: orden no reconocido: \"" + orden + "\"")
                process.exit(1)
            }

            opciones.sortFields.push({
                name: name,
                numeric: tipo === "num",
                descending: orden === "desc",
            })
            i+=2
        } else if (arg === "-d" || arg === "--delimiter"){
            if (i + 1 >=argv.length) {
                console.error ("ERROR: -d/--dlimiter no tiene valor")
                process.exit(1)
            }
            let delim=argv[i+1]
            if (delim === "\\t") delim = "\t"
            if (delim === "\\n") delim = "\n"
            if (delim === "\\r") delim = "\r"
            opciones.delimiter= delim;
            i+= 2
        } else if (arg.startsWith("-")){
            console.error("ERROR: opcion desconocida: \"" + arg + "\"")
            process.exit(1)
        }else {
            restantes.push(arg)
            i++
        }
    }

    if (restantes.length < 1){
        console.error("ERROR: falta el archivo de origen")
        process.exit(1)
    }
    if (restantes.length < 2){
        console.error("ERROR: falta el archivo de destino")
        process.exit(1)
    }
    opciones.inputFile= restantes[0]
    opciones.outputFile= restantes[1]
    if (opciones.sortFields.length === 0){
        console.error("ERROR: indique porlomenos 1 criterio con --by")
        process.exit(1)
    }
    if (opciones.delimiter.lenght !==1){
        console.error("ERROR: tiene que ser 1 (un) caracter")
        process.exit(1)
    }

    return opciones
}

function readInput(ruta){
    if (!fs.existsSync(ruta)){
        console.error("ERROR: el archivo no existe: \"" + ruta + "\"")
        process.exit(1)
    }
    try {
        return fs.readFileSync(ruta, "utf8")
    }catch (error){
        console.error("ERROR: no se pudo leer el archivo \"" + ruta + "\"")
        process.exit(1)
    }
}

function parseDelimited(texto, opciones) {
    if (texto.includes ('"')){
        console.error("ERROR: no se admiten comillas dobles")
        process.exit(1)
    }
    let lineas= texto.split("\n");
    if (lineas[lineas.length - 1] === ""){
        lineas.pop()
    }
    
    const filas = []
    for (let i = 0; i <lineas.length; i++){
        filas.push(lineas[i].split(opciones.delimiter))
    }

    const cantidadDeColumnas = filas.length > 0 ? filas[0].length : 0
    for (let i= 0; i < filas.length; i++){
        if (filas[i].length !== cantidadDeColumnas){
            console.error("ERROR: la fila " + (i + 1) + " tiene una cantidad distinta de campos");
            process.exit(1);
        }
    }
    let header= null;
    let rows = filas;

    if (!opciones.noHeader) {
        header = filas[0];
        rows= filas.slice(1)
    }

    for (const criterio of opciones.sortFields) {
        if (!opciones.noHeader && header.indexOf(criterio.name) === -1) {
            console.error ("ERROR: el campo solicitado no existe: \"" + criterio.name + "\"");
            process.exit(1)
        }
    }
return {header: header, rows: rows};
}

function sortRows(datos, opciones){
    const header = datos.header;
    const noHeader = opciones.noHeader;

    const criteriosConIndice = []
    for (const criterio of opciones.sortFields) {
        let indice;
        if (noHeader){
            indice= Number(criterio.name)
            if (Number.isNaN(indice)) {
                console.error("ERROR: este indice de columna \"" + criterio.name + "\" no es valido")
                process.exit(1);
            }
        }else {
            indice= header.indexOf(criterio.name);
        }
        
        criteriosConIndice.push({
            name: criterio.name,
            numeric: criterio.numeric,
            descending: criterio.descending,
            indice: indice
        })
    }

    const filasOrdenadas = datos.rows.slice();
    filasOrdenadas.sort((filaA, filaB) => {
        for (const criterio of criteriosConIndice){
            const valorA= filaA [criterio.indice];
            const valorB= filaB [criterio.indice];
            let resultado = 0;

            if (criterio.numeric) {
                const numA = Number(valorA)
                const numB = Number(valorB)
                if (Number.isNaN (numA) || Number.isNaN(numB)){
                    console.error("ERROR: ingrese un valor numerico en: \"" + criterio.name + "\"")
                    process.exit(1)
                }
                resultado = numA - numB;
            }else {
                resultado= valorA.localeCompare(valorB);
            }
            if (criterio.descending){
                resultado = resultado * -1;
            }

            if (resultado !==0){
                return resultado;
            }
        }
        return 0;
    });
    return filasOrdenadas
}

function serialize(datos, filasOrdenadas, opciones) {
    const lineas = [];

    if (!opciones.noHeader) {
        lineas.push(datos.header.join(opciones.delimiter));
    }
    for (const fila of filasOrdenadas) {
        lineas.push(fila.join(opciones.delimiter))
    }
    return lineas.join("\n");
}

function writeOutput(ruta, contenido) {
    try{
        fs.writeFileSync(ruta, contenido, "utf8");
    }catch (error){
        console.error("ERROR: no se puede guardar el archivo: \"" + ruta + "\"")
        process.exit(1);
    }
}

function main() {
    const opciones= parseArgs(process.argv.slice(2));
    const texto= readInput(opciones.inputFile);
    const datos= parseDelimited(texto, opciones);
    const filasOrdenadas= sortRows(datos, opciones);
    const salida= serialize(datos, filasOrdenadas, opciones);
    writeOutput(opciones.outputFile, salida);
    console.log("listo se genero \"" + opciones.outputFile + "\".")
}

main();
