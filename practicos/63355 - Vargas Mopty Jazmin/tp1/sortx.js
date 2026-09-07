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

const fs = import("fs")

const showError = (message) => {
  console.error(`Error: ${message}`)
  process.exit(1)
}
const parseArgs = (args) => {
  if (args.includes("-h") || args.includes("--help")) {
    console.log(HELP)
    process.exit(0)

  }

  if (args.length < 2) {
    showError("Falta el archivo de origen o destino.")
  }

  const config = {
    inputFile: args[0],
    outputFile: args[1],
    delimiter: ",",
    noHeader: false,
    sortFields: []
  }

  return config
}
const sortx = (args) => {
  const config = parseArgs(args)
  console.log(config)
}

sortx(process.argv.slice(2))
