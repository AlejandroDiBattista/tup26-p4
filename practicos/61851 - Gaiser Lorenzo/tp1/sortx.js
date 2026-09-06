#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs"
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


//console.log(process.argv)

const datosUsuarios = process.argv.slice(2) 



const uso = {
    
  inputFile: null ,
  outputFile: null ,
  delimiter: ",",
  noHeader: false , 
  sortFields: [] ,

}


//let part = null 

console.log(datosUsuarios)


for ( let i = 0 ;i < datosUsuarios.length; i++) {

    if (datosUsuarios[i].startsWith("-") ){
        if(datosUsuarios[i] !== "-nh" && datosUsuarios[i] !== "-h" && datosUsuarios[i] !== "--no-header" && datosUsuarios[i] !== "--help" ){
        console.log(datosUsuarios[i] , datosUsuarios[i + 1])
        if(datosUsuarios[i] === "-d" || datosUsuarios[i] === "--delimiter")
        uso.delimiter = datosUsuarios[i + 1 ]
          if(datosUsuarios[i] === "-b" || datosUsuarios[i] === "--by"){
           // console.log(datosUsuarios[i + 1 ].split(":"))
           const partes = datosUsuarios[i + 1 ].split(":")
           const criterio = {
            name: partes[0] ,
            numeric:partes[1] === "num",
            descending: partes[2] === "desc",
            
           }
           console.log(criterio)
           uso.sortFields.push(criterio)
        }
        i++
        }else{
          console.log(i , datosUsuarios[i])
          if(datosUsuarios[i] === "-nh" || datosUsuarios[i] === "--no-header"){
            uso.noHeader = true
          } 
        }
    }else {
        console.log(i , datosUsuarios[i])
        if(uso.inputFile){
           uso.outputFile = datosUsuarios[i]
        }else{
            uso.inputFile = datosUsuarios[i]
        }
        }
        }console.log(uso)


const texto = readFileSync(uso.inputFile, "utf8")
console.log(texto)
writeFileSync(uso.outputFile, texto)






