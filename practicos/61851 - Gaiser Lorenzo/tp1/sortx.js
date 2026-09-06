#!/usr/bin/env node
import { fail } from "node:assert"
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


let texto = readFileSync(uso.inputFile, "utf8")
texto = texto.replaceAll("\r","") 
const filas = texto.split("\n").filter(g => g !== "")
console.log(filas)
//writeFileSync(uso.outputFile, texto)



const tablas = filas.map(f => f.split(uso.delimiter) )
console.log(tablas)

let cabeza = null 

let filasDatos = []

if(uso.noHeader == false){
  
  cabeza = tablas[0]
  filasDatos = tablas.slice(1)
  
}else {
    filasDatos= tablas
}

  console.log("CABEZA:" , cabeza)
  console.log("DATOS:" , filasDatos)

for (let i = 0; i < uso.sortFields.length; i++) {
    if (cabeza) {
        const posicion = cabeza.indexOf(uso.sortFields[i].name)
        uso.sortFields[i].col = posicion        
    } else {
        const posicion = Number(uso.sortFields[i].name)
        uso.sortFields[i].col = posicion        
    }
}

console.log(uso.sortFields)   



  filasDatos.sort((a, b) => {

    for (const c of uso.sortFields) {
    //const c = uso.sortFields[0]
    let resultado 
   
    if (c.numeric){
      resultado = Number(a[c.col]) - Number(b[c.col]) ;
    }else{
        resultado = a[c.col].localeCompare(b[c.col], "es")
    }


    if (c.descending){
     resultado = resultado * (-1)
    }else{
     
    }
    if (resultado !== 0) {
    return resultado
}
    //return a[c.col].localeCompare(b[c.col], "es")
    }return 0
})

console.log("ORDENADO:", filasDatos)

//cabeza

//const union = [cabeza + filasDatos] 
//const union = [cabeza, ...filasDatos]


let union 

if(cabeza){
  union = [cabeza, ...filasDatos]
}else{
    union = filasDatos
}
console.log(union)

const lineas = union.map(fila => fila.join(uso.delimiter))
const salida = lineas.join("\n")
console.log(salida)
writeFileSync(uso.outputFile, salida)
