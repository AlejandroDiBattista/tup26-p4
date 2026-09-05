#!/usr/bin/env node
//console.log(process.argv)
import fs from "node:fs"
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
function parseArgs(){

    const deLaSegunda = process.argv.slice(2)


for(let i = 0; i < deLaSegunda.length;i++) 
    {
        if(deLaSegunda[i] === "-h" || deLaSegunda[i] === "--help")
        {
        console.log(HELP)
        process.exit(0);
        
        }   
    }

if(deLaSegunda.length < 2) {

console.error("error por falta de archivo")
process.exit(1);
}

const Config = {
inputFile: deLaSegunda[0],
outputFile: deLaSegunda[1],
delimiter: ",",
noHeader: false,
sortFields : [],
}

for(let i = 2; i < deLaSegunda.length;i++) 
    {
        if(deLaSegunda[i] === "-b" || deLaSegunda[i] === "--by")
            {
            
            if (i + 1 >= deLaSegunda.length) 
            {console.error("error: la opción -b necesita un criterio")
            process.exit(1)
            }
            
            const partes = deLaSegunda[i + 1].split(":")
            const numeric = partes[1] === "num"
            const descending = partes[2] === "desc"
            
            const criterio = { name: partes[0], numeric: numeric, descending: descending}
            Config.sortFields.push(criterio)
            
            }
            else if(deLaSegunda[i] === "-d" || deLaSegunda[i] === "--delimiter")
            {
            if (i + 1 >= deLaSegunda.length) 
            {console.error("error: la opción -d necesita un delimitador. Ej: -d")
            process.exit(1)
            }
            Config.delimiter = deLaSegunda[i + 1]
            
            }
            else if(deLaSegunda[i] === "-nh" || deLaSegunda[i] === "--no-header")
            {
            Config.noHeader = true;
            }
            else if(deLaSegunda[i].startsWith("-"))
            {
            console.error("error: opción desconocida: " + deLaSegunda[i])
            process.exit(1)
            }
    }
    if (Config.delimiter.length !== 1) 
    {

    console.error("error: el delimitador debe ser un unico caracter. Ej: ; " )
    process.exit(1) 
    }
    
    if(Config.sortFields.length === 0) 
    {
    console.error("error: debe agregar un criterio de ordenamiento. EJ: apellido ")
    process.exit(1)
    }
    
    return Config
}

const configuracion = parseArgs()
console.log(configuracion)


function readInput(ruta) { 
try {
    const contenido = fs.readFileSync(ruta , "utf8")
    return contenido
    
} catch (error) {
console.error("error: no se pudo leer el archivo noexiste.csv (no existe o no tiene permisos)")
process.exit(1)
}
}
const texto = readInput(configuracion.inputFile)
console.log(texto)

