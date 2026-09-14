#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'

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

function parseArgs(parametros){
    const configuracion = {
        help: false,
        inputFile: "",
        outputFile: "",
        delimiter: ",",
        noHeader: false,
        sortFields: []
    }

    function extraerOrden(texto){
        let [name, numeric = "alpha", desc = "asc"] = texto.split(":")
        if(!["num", "alpha"].includes(numeric)) throw new Error("Tipo de ordenamiento invalido")
        if(!["asc", "desc"].includes(desc)) throw new Error("Tipo orden es invalido")
        
        if(esNumero(name)) name = Number(name)
        return { name, numeric: numeric === "num", desc : desc === "desc" }
    }

    if(["-h", "--help"].includes(parametros[0])){
        configuracion.help = true 
        return configuracion
    }

    configuracion.inputFile  = parametros.shift() ?? ""
    configuracion.outputFile = parametros.shift() ?? ""
    
    while(parametros.length > 0 ){
        let comando = parametros.shift()
        if(["-b",  "--by"].includes(comando)){
            configuracion.sortFields.push( extraerOrden(parametros.shift() ?? ""))
        } else if (["-d",  "--delimiter"].includes(comando)){
            configuracion.delimiter = parametros.shift() ?? ""
            if(configuracion.delimiter === "\\t") configuracion.delimiter = "\t"
        } else if (["-nh", "--no-header"].includes(comando)){
            configuracion.noHeader = true 
        } else {
            throw new Error("Opcion invalida")
        }
    }
    return configuracion
}


function readInput(origen){
    let texto = readFileSync(origen, "utf8")
    texto = texto.replaceAll("\r\n","\n")
    while(texto.endsWith("\n")) {
        texto = texto.slice(0,-1)
    }
    return texto 
}

function parseDelimited(texto, {delimiter=",", noHeader=false}){
    let lineas = texto.split("\n")
    lineas = lineas.map(x => x.split(delimiter))
    let cabecera = []
    if(noHeader){
        cabecera = lineas[0].map((_,i) => i)
    } else {
        [cabecera, ...lineas] = lineas
    }
    return { cabecera, lineas }
}

function generarComparer({cabecera}, {sortFields}){
    const comparer = Intl.Collator("es", {sensitivity: "base"})
    const comparadores = sortFields.map(({name, numeric, desc}) => {
        const i = cabecera.indexOf(name)
        const compare = numeric
            ? (a, b) => Number(a[i]) - Number(b[i])
            : (a, b) => comparer.compare(a[i], b[i])

        return { compare, desc }
    })

    return (a, b) => {
        for(let {compare, desc} of comparadores){
            let resultado = compare(a, b)
            if(resultado !== 0) return desc ? -resultado : resultado
        }
        return 0
    }
}

function sortRows({cabecera, lineas}, comparar){
    return { cabecera: [...cabecera], lineas: lineas.toSorted(comparar) }
}

function serialize({ cabecera, lineas }, { noHeader, delimiter }){
    let salida = []
    if(!noHeader){
        salida.push( cabecera.join(delimiter))
    }
    for(let linea of lineas){
        salida.push( linea.join(delimiter))
    }
    return salida.join("\n") 
}

function writeOutput(texto, configuracion){
    let {outputFile} = configuracion
    writeFileSync(outputFile, texto, "utf8")
}

function esNumero(texto){
    return texto.trim() !== "" && Number.isFinite(Number(texto))
}

function analizarErroresParametros(configuracion){
    if(!configuracion.inputFile)             throw new Error("Falta el archivo de origen")
    if(!configuracion.outputFile)            throw new Error("Falta archivo destino")
    if(!configuracion.sortFields.length)     throw new Error("No hay ningun criterio definido")
    if(configuracion.delimiter.length !== 1) throw new Error("El delimitador debe tener un caracter")
    for(let {name} of configuracion.sortFields){
        if(!name) 
            throw new Error("La opcion no recibe un valor")
    }
}

function analizarErroresDatos({cabecera, lineas}, {sortFields}){
    let cantidad = cabecera.length
    for(let fila of lineas){
        if(cantidad !== fila.length)
            throw new Error("Hay filas con diferente cantidad de campos")
    }

    for(let linea of lineas){
        if(linea.some(x => x.includes(`"`))) 
            throw new Error("Los valores no pueden contener comillas")
    }

    for(let {name, numeric} of sortFields){
        let order = cabecera.indexOf(name)
        if(order < 0) 
            throw new Error("No existe el campo")
        if(numeric && lineas.some( fila => !esNumero(fila[order])))
            throw new Error(`Campo numérico con error en ${name}`)
    }
}

try {
    let parametros = [...process.argv.slice(2)]
    let configuracion = parseArgs(parametros)

    if(configuracion.help){
        console.log(HELP)
        process.exit(0)
    }
    analizarErroresParametros(configuracion)

    let entrada  = readInput(configuracion.inputFile)
    let datos    = parseDelimited(entrada, configuracion)
    analizarErroresDatos(datos, configuracion)

    let comparar = generarComparer(datos, configuracion)
    let ordenado = sortRows(datos, comparar)
    let salida   = serialize(ordenado, configuracion)
    writeOutput(salida, configuracion)
} catch (error) {
    console.log(error.message)
    process.exit(1)
}