#!/usr/bin/env node
import fs from 'node:fs';
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
function parseArgs(args){
    const config = {
    inputFile: null,
    outputFile: null,
    delimiter: ",",
    noHeader: false,
    sortFields: [ ]
    };
    for (let i =0; i < args.length; i++ ){
        const arg = args[i];
        if (arg==="-nh" || arg === "--no-header"){
        config.noHeader = true;
        }
        else if (arg === "-b" || arg ==="--by"){
            if (i + 1 >= args.length) {
                console.error("Error: falta especificar el criterio despues de -b o --by");
                process.exit(1);
            }


            i++;
            const expresion= args[i];
            const partes = expresion.split(':');

            const nombreCampo = partes[0];
            let esNumerico = false;
            let esDescendente = false;
            if (partes[1]=== "num") {
                esNumerico= true;
            }

            if (partes[2]=== "desc") {
                esDescendente= true;
            }
            const newCampo = {
                name: nombreCampo,
                numeric:esNumerico,
                descending:esDescendente
            };
            config.sortFields.push(newCampo);
        }
        else if (arg === "-d" || arg === "--delimiter") {
            if (i + 1 >= args.length) {
                console.error("Error: falta especificar el delimitador despues de -d o --delimiter");
                process.exit(1);
            }
            i++;
            config.delimiter =args[i]
        }
            else if(arg.startsWith("-")){
            console.error(`Error: opcion desconocida "${arg}"`);
            process.exit(1);
        }
        else{

            if (config.inputFile === null) {
                config.inputFile = arg;
            }
            else if (config.outputFile === null) {
                config.outputFile = arg;
        }
    }}
            if (config.inputFile === null || config.outputFile === null){
            console.error("Error: falta el archivo de origen o de destino");
            process.exit(1);
        }

            if(config.delimiter.length !== 1){
            console.error("Error:el delimitador debe ser un unico caracter");
            process.exit(1);
            }

            if (config.sortFields.length === 0){
            console.error("Error: no se especifico ningun criterio de ordenamiento (-b o --by)");
            process.exit(1);
            }

    return config
}
function readInput(rutaArchivo){
    try{
    const contenidoTexto = fs.readFileSync(rutaArchivo,'utf-8');
    return contenidoTexto;
    }catch(error){
    console.error("Error: el archivo de origen no existe o no se puede leer");
    process.exit(1);
    }

}
        function parseDelimited(textoCrudo,delimitador){
        if (!textoCrudo || textoCrudo.trim() === "") {
        console.error("Error: el archivo de origen esta vacio");
        process.exit(1);
        }

        const lineas = textoCrudo.split(/\r?\n/);
        const matrizFilas =[];
        for (let i = 0; i < lineas.length; i++) {
            const linea = lineas[i];
            if (i === lineas.length - 1 && linea === "")continue; {
            }
            if (linea.includes('"')) {
                console.error("Error: la entrada contiene comillas dobles, formato no admitido");
                process.exit(1);
            }
            const columnas = linea.split(delimitador);

            if (i > 0 && columnas.length !== matrizFilas[0].length) {
                console.error("error: las filas tienen diferente cantidad de campos");
                process.exit(1);
            }

        matrizFilas.push(columnas);
    }
    return matrizFilas;
}

        function sortRows(filas,config){

        let encabezado = null;
        let datosParaOrdenar = [];
        if(config.noHeader === false){
        encabezado= filas[0]
        datosParaOrdenar= filas.slice(1);
}   else {
        datosParaOrdenar=filas.slice(0);
}

    datosParaOrdenar.sort((filaA,filaB) =>{
    for(let i =0; i < config.sortFields.length; i++ ){
    const criterio = config.sortFields[i];
    let indiceColumna = -1
    if (config.noHeader){
        if (!/^\d+$/.test(criterio.name)) {
            console.error(`Error: el indice de columna "${criterio.name}" debe ser un numero entero no negativo `);
            process.exit(1);
        }
    indiceColumna = parseInt(criterio.name, 10);

    if (indiceColumna>=filaA.length) {
        console.error(`Error: el indice de columna "${indiceColumna}" esta fuera de los limites del archivo`);
        process.exit(1);
    }
    } else{
        indiceColumna = encabezado.indexOf(criterio.name);
    }
        if (indiceColumna === -1 ){
    console.error(`Error: el campo solicitado "${criterio.name}" no existe`);
    process.exit(1);
    }
        const valorA = filaA[indiceColumna];
        const valorB = filaB[indiceColumna];

        if(criterio.numeric){

            if (!/^-?\d+(\.\d+)?$/.test(valorA) || !/^-?\d+(\.\d+)?$/.test(valorB)) {
                console.error("Error: los parametros deben ser estrictamente numericos ");
                process.exit(1);
            }
            const numA= parseFloat(valorA);
            const numB = parseFloat(valorB);

            if(numA < numB) return criterio.descending ? 1 : -1;
            if(numA > numB) return criterio.descending ? -1 : 1;

        }else {
            const comparacion =valorA.localeCompare(valorB,'es',{sensitivity: 'accent'});

            if (comparacion !== 0) {
                return criterio.descending ? -comparacion : comparacion;
            }
        }

    }
    });


    if(encabezado !== null){
    datosParaOrdenar.unshift(encabezado);
    }
return datosParaOrdenar;

}
    function serialize(filas,delimitador){

    const lineasTexto=[];

    for(let i = 0 ; i <filas.length; i++){
    const filaUnida = filas[i].join(delimitador);
    lineasTexto.push(filaUnida);
    }
    return lineasTexto.join('\n');

    }

    function writeOutput(rutaArchivo,contenidoTexto){
        try{
            fs.writeFileSync(rutaArchivo,contenidoTexto,'utf-8');
        }catch(error){
            console.error(`No se pudo escribir en el archivo "${rutaArchivo}":`, error.message);
            process.exit(1);
        }

    }

    function main() {
        const argumentoUsuario = process.argv.slice(2);

        if (argumentoUsuario.includes("-h") || argumentoUsuario.includes("--help")) {
            console.log(HELP);
            process.exit(0);
        }
        const config = parseArgs(argumentoUsuario);
        const textoDelArchivo = readInput(config.inputFile);
        const matrizDatos = parseDelimited (textoDelArchivo,config.delimiter);
        const matrizOrdenada = sortRows(matrizDatos,config);
        const textoDestino = serialize(matrizOrdenada,config.delimiter);

        writeOutput(config.outputFile,textoDestino);

}
main();

