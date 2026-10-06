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
import fs, { readFileSync, writeFileSync } from "node:fs";

// Escribir aqui la solución al enunciado.
//1-parseArgs:
function parseArgs(argumentos){
    //aqui voy a guardar todo lo que me mande el usuario
    const opciones={
        inputFile:null,
        outputFile:null,
        ayuda:false,
        delimiter:",",
        noHeader:false,
        sortFields:[]
    };
    
    const valores=[];
    //recorro todo lo que escribieron
    for(let i=0; i<argumentos.length;i++){
        const arg=argumentos[i];
        //verifico si pidio ayuda o no
        if(arg==="-h"||arg==="--help"){
            opciones.ayuda=true;
        }
        //si pasa el delimitador
       else if(arg==="-d"||arg==="--delimiter"){
            i++;
        let delim = argumentos[i];
          if (delim === "\\t") {
                delim = "\t";
         }
            opciones.delimiter = delim;
        }
        //si no tiene encabezado
        else if(arg==="-nh"||arg==="--no-header"){
            opciones.noHeader=true;
        }
        // si es para ordenar, uso la regla
        else if (arg==="-b"||arg==="--by") {
            //avanzo para guardar el dato siguientee
            i++;
            const valor=argumentos[i];
            if (valor) {
                //desarmo el texto separado por los dos puntos
                const partes=valor.split(":");
                opciones.sortFields.push({
                    name:partes[0],
                    numeric:partes.includes("num"),
                    descending: partes.includes("desc")
            }); 
            }
        //si no tiene guión, es porque es un archivo
        }else if(!arg.startsWith("-")){
            valores.push(arg);
        }
    }
    //el primero que pasen es el archivo a leer
        if(valores.length>0){
            opciones.inputFile=valores[0];
        }
        //si pasan otro, es el de salida
        if(valores.length>1){
            opciones.outputFile=valores[1];
        }
        return opciones;
    
}
// 2-readInput:
function readInput(rutaArchivo) {
    try {
        //leo todo el texto del archivo en fromato utf-8
        let texto= readFileSync(rutaArchivo,"utf-8");
        //cambio los saltos de lineas de windows por saltos comuness
        return texto.replaceAll("\r\n","\n");
    } catch (error) {
        //si el archivo no esxiste o no se puede abrir, muestra el error y salgo
        console.error(`Error: el archivo "${rutaArchivo}" no se puede leer o no existe.`)
        process.exit(1);
    }
}
//3-parseDelimited
function parseDelimited(texto, delimitador=",",sinEncabezado= false){
    //separo el texto por renglones y descarto lineas vacias
    let lineas= texto.split("\n").filter(linea=>linea.trim()!=="");
    //si el archivo estaba vacio, devuelvo arrays vacios
    if (lineas.length===0) {
        return {encabezado:[],filas: [] };
    }
    let encabezado=[];
    let lineasDatos=lineas;
    //si el archivo tiene encabezado, extraigo la primera linea
    if(!sinEncabezado){
        encabezado=lineas[0].split(delimitador).map(celda=>celda.trim());
        lineasDatos= lineas.slice(1);
    }
    //convertir cada linea restante en un array de valores
    const filas= lineasDatos.map(linea=>linea.split(delimitador).map(celda=>celda.trim()));
    return {encabezado, filas};
}
//4-sortRows
function sortRows(filas, reglas,encabezado=[]){
    //si no se definieron criterios con -b, devuelve las filas como llegaron
    if (!reglas||reglas.length===0) {
        return filas;
    }
    //usamos [...filas] para copiar y asi no alterar el array original
    return [...filas].sort((filaA,filaB)=>{
        //evaluamos cada regla en el orden que fue paasda
       for(const regla of reglas){
        let indice=-1;
        //si hay encabezado, buscamos la posicion por nombre de columna
        if (encabezado.length>0) {
            indice= encabezado.indexOf(regla.name);
        }else{
            //si no hay encabezado (-nh), el nombre es directamente el indice
            indice= parseInt(regla.name,10);
        }
        //si la columna no existe en la fila, se ignora la regla
        if (indice === -1 || indice>=filaA.length) {
            continue;
        }
        const valA=filaA[indice];
        const valB=filaB[indice];
        let diferencia = 0;
        if (regla.numeric) {
            //en orden numerico
            const numA= Number(valA);
            const numB= Number(valB);
            diferencia= numA-numB;
        }else{
            //en orden alfabetico con acentos, mayusculas y minusculas
            diferencia= valA.localeCompare(valB);
        }
        //si no son iguales, se aplica ascendente o descendente
        if (diferencia!==0) {
            if (regla.descending) {
                return -diferencia;//si es desc
            }
            else{
                return diferencia;//si es asc
            }
        }
        //si son iguales, continua el for con otra regla
    }
    return 0;
    });
}
//5-serialize
function serialize(filas, encabezado=[],delimitador=","){
    const lineas=[];
    //si hay encabezado va en la primera linea
    if (encabezado && encabezado.length>0) {
        lineas.push(encabezado.join(delimitador));
    }
    //transformo cada fila en texto uniendo celdas
    for(const fila of filas){
        lineas.push(fila.join(delimitador));
    }
    // unir todo con saltos de linea y agregamos el salto final
    return lineas.join("\n");
}
//6-writeOutput
function writeOutput(rutaArc, contenido){
    try {
        //intentamos guardar el texto usando utf-8
        writeFileSync(rutaArc,contenido,"utf-8")
    } catch (error) {
        //si no es valido, avisamos y salimos
       console.error(`Error: no se pudo escribir en el archivo "${rutaArc}".`);
      process.exit(1);  
    }
}
// Punto de entrada para ejecutar todo
const args = process.argv.slice(2);
const config = parseArgs(args);

// Si se pasó -h o --help
if (config.ayuda) {
    console.log(HELP.trim());
    process.exit(0);
}

// 1. Lee el archivo de origen
const textoEntrada = readInput(config.inputFile);

// 2. Parsea el contenido
const { encabezado, filas } = parseDelimited(textoEntrada, config.delimiter, config.noHeader);

// 3. Ordena las filas
const filasOrdenadas = sortRows(filas, config.sortFields, encabezado);

// 4. Reconstruye el texto
const salidaTexto = serialize(filasOrdenadas, encabezado, config.delimiter);

// 5. Escribe el archivo final
writeOutput(config.outputFile, salidaTexto);
//console.log(HELP)