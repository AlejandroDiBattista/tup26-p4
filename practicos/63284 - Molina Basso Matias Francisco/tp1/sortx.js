#!/usr/bin/env node
import { readFileSync } from "node:fs"


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
//Validar los argumentos de entrada
//Agregar lectura del archivo CSV
//Implementar ordenamiento por múltiples campos
//Controlar errores de formato
//Completar ayuda y pruebas manuales

//1. parseArgs      → leer los argumentos y construir la configuración
//2. readInput      → leer el archivo de origen
//3. parseDelimited → convertir el texto en filas y columnas
//4. sortRows       → ordenar las filas
//5. serialize      → reconstruir el texto delimitado
//6. writeOutput    → escribir el archivo de destino


// Escribir aqui la solución al enunciado.



function parseArgs(args)
{
    let configuracion = 
    {
        delimiter: ",",
        inputFile: "",
        outputFile: null,
        noHeader: false,
        sortFields: [],
    }
    

    if (args[0] === "-h" || args[0] === "--help")
    {
        console.log(HELP)
        return
    }

    configuracion.inputFile = args.shift() 
    configuracion.outputFile = args.shift()
if (!configuracion.inputFile)
    {
        throw new Error("Falta el archivo de origen.")
    }
if (!configuracion.outputFile)
    {
        throw new Error("Falta el archivo de destino.")
    }   
    while (args.length !== 0) 
    {
        let opcion = args.shift()

        if (opcion === "-b" || opcion === "--by")
        {
            let campo = args.shift()
            if (!campo || campo.startsWith("-"))    
            {
                throw new Error("Falta el argumento para la opción -b/--by")
            }
            let [nombre, numerico = "alpha", descendente = "asc"] = campo.split(":")

            if (numerico !== "alpha" && numerico !== "num")
            {
                throw new Error(`Tipo de ordenamiento desconocido: ${numerico}`)
            }
            if (descendente !== "asc" && descendente !== "desc")
            {
                throw new Error(`Criterio de ordenamiento desconocido: ${descendente}`)
            }
            let field = {
                name: nombre,
                numeric: numerico === "num",
                descending: descendente === "desc"
            }

            configuracion.sortFields.push(field)
        }
        else if (opcion === "-d" || opcion === "--delimiter")
        {
            let delimitador = args.shift()
            if (!delimitador || (delimitador.length >1 && delimitador.startsWith("-")))
            {
                throw new Error("Falta el argumento para la opción -d/--delimiter")
            }
            if (delimitador.length !== 1 && delimitador !== "\\t")
            {
                throw new Error("El delimitador debe ser un solo carácter o '\\t' para tabulaciones.")
            }
            if (delimitador === "\\t")
            {
                delimitador = "\t"
            }
            configuracion.delimiter = delimitador
        }
        else if (opcion === "-nh" || opcion === "--no-header")
        { 
            configuracion.noHeader = true
        }
        else
        {
            throw new Error(`Opción desconocida: ${opcion}`)
        }
    }
    if (configuracion.sortFields.length === 0)
    {
        throw new Error("Debe especificar al menos un criterio de ordenamiento con -b/--by.")
    }
return configuracion

}

function readInput (nombre){
    const texto = readFileSync(nombre, "utf-8")
    return texto

}
function parseDelimited (texto, delimiter){
    if (texto.includes ('"')) {
        throw new Error("El archivo contiene comillas, lo cual no está permitido.")
    }
    const filas = texto.split(/\r?\n/)
    if (filas[filas.length - 1] === "") {
        filas.pop()
    }
    const mapeo = filas.map(fila => fila.split(delimiter))
    const cantidadcampos = mapeo[0].length
    const cantidad = mapeo.length
    for (let i = 0; i < cantidad; i++) {
        if (mapeo[i].length !== cantidadcampos) {
            throw new Error("El archivo contiene filas con un número diferente de campos.")
        }
    }
    return mapeo
}

function sortRows (filas, sortFields, noHeader){
    let encabezado = null
    let datos = filas
    if (!noHeader)
    {
        encabezado = filas[0]
        datos = filas.slice(1)
    }
    for (let i = sortFields.length - 1; i >= 0; i--){
        const field = sortFields[i]
        const index = noHeader ? Number(field.name) : encabezado.indexOf(field.name)
        if (!noHeader && index === -1) {
            throw new Error(`El campo "${field.name}" no se encuentra en el encabezado.`)
        }
    if (noHeader && !Number.isInteger(index)) {
        throw new Error(`El índice "${field.name}" no es un número válido.`)
    }
    if (noHeader && (index < 0 || index >= datos[0].length)) {
        throw new Error(`El índice "${field.name}" está fuera del rango de los campos.`)
    }

    if (field.numeric === true) {
    for (const fila of datos) {
        const valor = fila[index]
        if (valor === undefined || valor === null || valor.trim() === "" || !Number.isFinite(Number(valor))) {
            throw new Error(`El valor "${valor}" del campo "${field.name}" no es numérico.`)
        }

    }

    }
    datos.sort((a, b) => {
        let valorA = a[index]
        let valorB = b[index]
        if (field.numeric) {
            valorA = Number(valorA)
            valorB = Number(valorB)
        }
        if (field.descending) {
            [valorA, valorB] = [valorB, valorA]
        }
        if (!field.numeric)
        {
            return valorA.localeCompare(valorB, "es")
        }
        if (valorA < valorB) return -1
        if (valorA > valorB) return 1
        return 0
    })

    }
    return { header: encabezado, rows: datos }
}

const argumentos = process.argv.slice(2)
const resultado = parseArgs(argumentos)

if (resultado) {
    
    const texto = readInput(resultado.inputFile)
    const filas = parseDelimited(texto, resultado.delimiter)
    const { header, rows } = sortRows(filas, resultado.sortFields, resultado.noHeader)

}