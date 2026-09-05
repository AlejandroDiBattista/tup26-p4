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
import fs, { readFileSync } from "node:fs";

// Escribir aqui la solución al enunciado.
//1-parseArgs:
function parseArgs(argumentos){
    //aqui voy a guardar todo lo que me mande el usuario
    const opciones={
        arcEntrada:null,
        arcSalida:null,
        ayuda:false,
        delimitador:",",
        sinEncabezado:false,
        reglas:[]
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
            opciones.delimitador=argumentos[i];
        }
        //si no tiene encabezado
        else if(arg==="-nh"||arg==="--no-header"){
            opciones.sinEncabezado=true;
        }
        // si es para ordenar, uso la regla
        else if (arg==="-b"||arg==="--by") {
            //avanzo para guardar el dato siguientee
            i++;
            const valor=argumentos[i];
            if (valor) {
                //desarmo el texto separado por los dos puntos
                const partes=valor.split(":");
                opciones.reglas.push({
                    nombre:partes[0],
                    tipo:partes.includes("num"),
                    orden: partes.includes("desc")
            }); 
            }
        //si no tiene guión, es porque es un archivo
        }else if(!arg.startsWith("-")){
            valores.push(arg);
        }
    }
    //el primero que pasen es el archivo a leer
        if(valores.length>0){
            opciones.arcEntrada=valores[0];
        }
        //si pasan otro, es el de salida
        if(valores.length>1){
            opciones.arcSalida=valores[1];
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
console.log(HELP)