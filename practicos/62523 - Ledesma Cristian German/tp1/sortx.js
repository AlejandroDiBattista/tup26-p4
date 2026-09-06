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
        else if (arg === "-b" || arg ==="--by"){ i++;
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
            i++;
            config.delimiter =args[i]
        }
        else{

            if (config.inputFile === null) {
                config.inputFile = arg;
            }
            else if (config.outputFile === null) {
                config.outputFile = arg;
        }
    }}
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
    const lineas = textoCrudo.trim().split('\n');
    const matrizFilas =[];

    for (let i = 0; i < lineas.length; i++) {
        const lineaLimpia = lineas[i].replace('\r','');
        const columnas = lineaLimpia.split(delimitador);


        if (i>0 && columnas.length !==matrizFilas[0].length) {
            console.error("Error:las filas tienen diferente cantidad de campos");
            process.exit(1);
        }
        matrizFilas.push(columnas);
    }
    return matrizFilas
    }

    function sortRows(filas,config){
    let encabezado = null;
    let datosParaOrdenar = [];
    if(config.noHeader === false){
    encabezado= filas[0]
    datosParaOrdenar= filas.slice(1);
}else {
    datosParaOrdenar=filas.slice(0);
    }

    datosParaOrdenar.sort((filaA,filaB) =>{
    for(let i =0; i < config.sortFields.length; i++ ){
    const criterio = config.sortFields[i];
    let indiceColumna = -1
    if (config.noHeader){
    indiceColumna = parseInt(criterio.name);
    } else{
        indiceColumna = encabezado.indexOf(criterio.name);
    }
    if (indiceColumna === -1 ){
    console.error(`Error: el campo solicitado "${criterio.name}" no existe`);
    process.exit(1);
    }
    let valorA = filaA[indiceColumna];
    let valorB = filaB[indiceColumna];

    if (criterio.numeric){
    const numA = parseFloat(valorA);
    const numB =parseFloat(valorB);
    if (isNaN(numA) || isNaN(numB)){
        console.error("Error: los parametros deben ser numericos para poder continuar");
        process.exit(1);
    }
    valorA = numA;
    valorB = numB;
    }
    if (valorA<valorB){
    return criterio.descending ? 1: -1;
    }
    if(valorA>valorB){
    return criterio.descending ? -1 : 1;
    }
    }
    return 0;
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
    const resultadoConfig =parseArgs(argumentoUsuario);

    console.log("TEST DE CONFIGURACION");
    console.log(resultadoConfig);

    console.log("TEST DE LECTURA");

    if(resultadoConfig.inputFile){
        const textoDelArchivo = readInput(resultadoConfig.inputFile);

    console.log("contenido leido con exito:\n",textoDelArchivo);

    console.log("TEST MATRIZ");
    const matrizDatos = parseDelimited(textoDelArchivo, resultadoConfig.delimiter);

    console.log(matrizDatos);

    console.log("TEST DE FILAS ORDENADAS");
    const matrizOrdenada = sortRows(matrizDatos,resultadoConfig);
    console.log(matrizOrdenada);

}else{
    console.error("Error: No se especifico un archivo de entrada");
}
}
main();

