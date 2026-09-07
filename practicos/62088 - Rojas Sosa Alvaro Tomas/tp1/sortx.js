#!/usr/bin/env node
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
                        Usá "\\t" para archivos separados por tabulaciones.

    -nh, --no-header    Indica que el archivo no tiene encabezado.
                        Los campos se identifican mediante índices desde cero.

    -h, --help          Muestra esta ayuda.

EJEMPLOS:
    sortx empleados.csv ordenados.csv -b apellido
    sortx empleados.csv salarios.csv -b salario:num:desc
    sortx empleados.csv resultado.csv -b departamento -b salario:num:desc
    sortx datos.csv resultado.csv -nh -b 2:num:desc
    sortx datos.tsv salida.tsv -d "\\t" -b nombre
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


function readInput(ruta) { 
try {
    const contenido = fs.readFileSync(ruta , "utf8")
    return contenido
    
} catch (error) {
console.error("error: no se pudo leer el archivo " + ruta + " (no existe o no tiene permisos)")
process.exit(1)

}
}


function parseDelimited (texto, delimitador) {

if (texto.includes('"')) 
{
console.error("error: la entrada no puede contener comillas dobles")
process.exit(1)
}

const textolimpio = texto.replaceAll("\r", "")
let textSeparado = textolimpio.split("\n")
textSeparado = textSeparado.filter(t => t !== "")

let SeparadoFinal = []

for(let i = 0; i < textSeparado.length; i++) 
    {
        let separado = textSeparado[i].split(delimitador)
        SeparadoFinal.push(separado)
    }

const CantidadCampos = SeparadoFinal[0].length
for(let i = 0; i < SeparadoFinal.length;i++) 
    {
        if(SeparadoFinal[i].length !== CantidadCampos)
            {
                console.error("error: la fila " + (i + 1) + " tiene " + SeparadoFinal[i].length + " elementos, y deberia tener: " + CantidadCampos)
                process.exit(1)
            }
    }

return SeparadoFinal
}

function sortRows(filas, sortFields, noHeader) {
let encabezado 
let datos 
if (noHeader) 
{
    datos = filas
}
else 
{
    encabezado = filas[0]
    datos = filas.slice(1)
}
    datos.sort(function (a, b) {
    let resultado
    for ( let i = 0; i < sortFields.length; i++)
    { 
    let indice 
        if(noHeader) 
        {
            indice = Number(sortFields[i].name)
        }
        else 
        {
            indice = encabezado.indexOf(sortFields[i].name)
        }
        if(indice === -1)
            {
                console.error("error: la columna solicitada: " + sortFields[i].name + " no existe")
                process.exit(1)
            }
        if(sortFields[i].numeric)
    {
        if(isNaN(a[indice]) || isNaN(b[indice])) 
        {
            console.error("error: ingreso un valor no numerico en donde va uno numerico")
            console.error("los valores que ingresaste fueron : " + a[indice] + " y " + b[indice])
            process.exit(1)
        }
        resultado = a[indice] - b[indice]
    }
    else
    {    
        resultado = a[indice].localeCompare(b[indice])
    }

        if(sortFields[i].descending) 
    {
        resultado = -resultado
    }
    
    if (resultado !== 0) {
        return resultado
    }
    }
    return 0
    })

if (noHeader === false)
{
    datos.unshift(encabezado)
}
return datos
}


function serialize(filas, delimitador){
let ElementUnidos = []
for(let i = 0;i < filas.length;i++ )
    {
        let unido = filas[i].join(delimitador)
        ElementUnidos.push(unido)
    }

const textoFinal = ElementUnidos.join("\n")
return textoFinal
}

function writeOutput(ruta, textoFinal){
try
{
    fs.writeFileSync(ruta, textoFinal)
}
catch (error)
{
    console.error("el archivo de destino " + "(" + ruta + ") " + "no puede escribirse")
    process.exit(1)
}
}


const configuracion = parseArgs();
const texto = readInput(configuracion.inputFile)
const filas = parseDelimited(texto, configuracion.delimiter)
const filasOrdenadas = sortRows(filas, configuracion.sortFields, configuracion.noHeader)
const textoFinal = serialize(filasOrdenadas, configuracion.delimiter)
writeOutput(configuracion.outputFile, textoFinal)