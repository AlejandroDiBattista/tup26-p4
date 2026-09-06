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

const argumentos = [
    "empleados.csv",
    "ordenados.csv",
    "-d",
    "--delimiter",
    ",",
    "-nh",
    "--noHeader",
    "-b",
    "--by",
    "salario:num:desc",
    "-b",
    "--by",
    "apellido"
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
    let delimiter = null;
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
          const campo = ParseCampo(argumentos[i + 2]);
            sortFields.push(campo);
            i += 2;
       } 
       else{
        i++;
       }
    }
    return{inputFile,outFile,delimiter,noHeader,sortFields}
}

console.log(ParseArg(argumentos));