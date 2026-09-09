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

// Escribir aqui la solución al enunciado.
console.log(HELP)
import fs from "node:fs"
 
function parseArgs(args) {
  let config = {
    inputFile: null,
    outputFile: null,
    delimiter: ",",
    noHeader: false,
    sortFields: [],
    showHelp: false
  }
 
  for (let i = 0; i < args.length; i++) {
    if (args[i] == "-h" || args[i] == "--help") {
      config.showHelp = true
      return config
    }
  }
 
  let archivos = []
 
  for (let i = 0; i < args.length; i++) {
    let arg = args[i]
 
    if (arg == "-b" || arg == "--by") {
      let valor = args[i + 1]
      if (valor == undefined) {
        throw new Error("Falta el valor de la opción " + arg)
      }
 
      let partes = valor.split(":")
      let campo = partes[0]
      let tipo = partes[1]
      let orden = partes[2]
 
      if (!tipo) tipo = "alpha"
      if (!orden) orden = "asc"
 
      if (tipo != "alpha" && tipo != "num") {
        throw new Error("Tipo de orden inválido: " + tipo)
      }
      if (orden != "asc" && orden != "desc") {
        throw new Error("Orden inválido: " + orden)
      }
 
      config.sortFields.push({
        name: campo,
        numeric: tipo == "num",
        descending: orden == "desc"
      })
 
      i++
    } else if (arg == "-d" || arg == "--delimiter") {
      if (args[i + 1] == undefined) {
        throw new Error("Falta el valor de la opción " + arg)
      }
      config.delimiter = args[i + 1]
      i++
    } else if (arg == "-nh" || arg == "--no-header") {
      config.noHeader = true
    } else if (arg[0] == "-") {
      throw new Error("Opción desconocida: " + arg)
    } else {
      archivos.push(arg)
    }
  }
 
  if (archivos.length < 1) throw new Error("Falta el archivo de origen")
  if (archivos.length < 2) throw new Error("Falta el archivo de destino")
 
  config.inputFile = archivos[0]
  config.outputFile = archivos[1]
 
  if (config.delimiter == "\\t") {
    config.delimiter = "\t"
  }
 
  if (config.delimiter.length != 1) {
    throw new Error("El delimitador debe ser un único carácter")
  }
 
  if (config.sortFields.length == 0) {
    throw new Error("Debe indicar al menos un criterio con --by")
  }
 
  return config
}
 
function readInput(config) {
  try {
    return fs.readFileSync(config.inputFile, "utf8")
  } catch (e) {
    throw new Error("No se pudo leer el archivo de origen: " + config.inputFile)
  }
}
 
function parseDelimited(texto, config) {
  let lineas = texto.split(/\r\n|\n/)
 
  while (lineas.length > 0 && lineas[lineas.length - 1] == "") {
    lineas.pop()
  }
 
  let filas = []
  for (let i = 0; i < lineas.length; i++) {
    filas.push(lineas[i].split(config.delimiter))
  }
 
  let encabezado = null
  if (config.noHeader == false) {
    encabezado = filas.shift()
  }
 
  let cantColumnas
  if (encabezado != null) {
    cantColumnas = encabezado.length
  } else if (filas.length > 0) {
    cantColumnas = filas[0].length
  } else {
    cantColumnas = 0
  }
 
  return { header: encabezado, rows: filas, cantColumnas: cantColumnas }
}
 
function main() {
  try {
    let args = process.argv.slice(2)
    let config = parseArgs(args)
 
    if (config.showHelp) {
      console.log(HELP)
      process.exit(0)
    }
 
    let texto = readInput(config)
    let datos = parseDelimited(texto, config)
 
    console.log(datos)
  } catch (e) {
    console.error("Error: " + e.message)
    process.exit(1)
  }
}
 
main()