#!/usr/bin/env node

/* const HELP = `

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
` */

// Escribir aqui la solución al enunciado.
//console.log(HELP)

//prueba_1

/* let array = process.argv.slice(2);

//console.log(array);

for(let i = 0; i < array.length; i++){
  if(array[i].startsWith("--")){console.log(array[i],":es una bandera")}
  else{console.log(array[i])
  }
}

 */

import fs from "fs";


const argumentos = [
    "empleados.csv",
    "ordenados.csv",
    "-d", ",",
    "-b", "salario:num:desc",
    "-b", "apellido"
]

function ParseCampo(texto){
 const partes = texto.split(":");
 const name = partes[0];

 let numeric = false;
 let descending = false;

 if (partes[1] === "num") {
        numeric = true;
    }
    if (partes[2] === "desc") {
        descending = true;
    }
    
    return { name, numeric, descending };

}

function ParseArg(argumentos){
    let inputFile = null;
    let outFile = null;
    let delimiter = ",";
    let noHeader = false;
    let sortFields = [];


    let i = 0;
    while(i < argumentos.length){
       if(!argumentos[i].startsWith("-")){
        if(inputFile === null){
            inputFile = argumentos[i];
        }
        else if(outFile === null){
            outFile = argumentos[i];
        } i++
       }
       else if(argumentos[i] === "-d" || argumentos[i] === "--delimiter"){
           delimiter = argumentos[i + 1];
           i+=2;
       } 
       else if(argumentos[i] === "-nh" || argumentos[i] === "--noHeader"){
           noHeader = true;
           i++;
       } 
       else if(argumentos[i] === "-b" || argumentos[i] === "--by"){
          const campo = ParseCampo(argumentos[i + 1]);
            sortFields.push(campo);
            i += 2;
       } 
       else{
        i++;
       }
    }
    return{inputFile,outFile,delimiter,noHeader,sortFields}
}

//console.log(ParseArg(argumentos));

function readInput(texto) {
  try {
    return fs.readFileSync(texto, "utf-8");
  } catch (error) {
        console.log("No se pudo leer el archivo.");
}
}

function parseDelimited(texto, delimiter, noHeader = false  ) {
    const textoNormalizado = texto.replace(/\r\n/g, "\n");
    const lineas = textoNormalizado.split("\n").filter(linea => linea !== "");
    const filas = lineas.map(linea => linea.split(delimiter));
   if(noHeader){
    return  {header:null, rows:filas};
   }
    const header = filas[0];
    const rows = filas.slice(1);
 
    return {header,rows};
}

function PosicionArray(campo,header,noHeader){
    if(noHeader){
        return parseInt(campo,10);
    }
    return header.indexOf(campo);
}

function sortRows(rows,sortFields,header,noHeader){
    const comando = sortFields.map(comando =>({
        posicion : PosicionArray(comando.name,header,noHeader),
        numeric : comando.numeric,
        descending : comando.descending
    }));
    
    return rows.slice().sort((a,b)=>{
        for(const{posicion,numeric,descending} of comando){
            const compara = numeric
            ? Number(a[posicion]) - Number(b[posicion])
            : a[posicion].localeCompare(b[posicion]);
            if (compara !== 0) return descending ? -compara : compara;     
        }
        return 0;
    });
}  

const confi = ParseArg(argumentos);
const texto = readInput(confi.inputFile);
const tabla =  parseDelimited(texto,confi.delimiter,confi.noHeader);
const ordenfilas = sortRows(tabla.rows,confi.sortFields,tabla.header,confi.noHeader);
const tablafinal = {header: tabla.header,
    rows: ordenfilas
};

console.log(tablafinal);

