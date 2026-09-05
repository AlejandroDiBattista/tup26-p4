#!/usr/bin/env node

import fs from 'fs'

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

function parseArgs(args) {
  if (args.includes('-h') || args.includes('--help')) {
    console.log(HELP.trim())
    process.exit(0)
  }

  const positionals = []
  const sortFields = []
  let delimiter = ','
  let noHeader = false

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '-nh' || arg === '--no-header') {
      noHeader = true
    } else if (arg === '-d' || arg === '--delimiter') {
      i++
      if (i >= args.length || args[i].startsWith('-')) {
        console.error('Error: La opción ' + arg + ' requiere un valor.')
        process.exit(1)
      }
      let delim = args[i]
      if (delim === '\\t') {
        delim = '\t'
      }
      if (delim.length !== 1) {
        console.error('Error: El delimitador debe ser un único carácter.')
        process.exit(1)
      }
      delimiter = delim
    } else if (arg === '-b' || arg === '--by') {
      i++
      if (i >= args.length || args[i].startsWith('-')) {
        console.error('Error: La opción ' + arg + ' requiere un valor.')
        process.exit(1)
      }
      const parts = args[i].split(':')
      const name = parts[0]
      if (!name) {
        console.error('Error: El criterio de ordenamiento debe especificar un campo.')
        process.exit(1)
      }
      const type = parts[1] || 'alpha'
      if (type !== 'alpha' && type !== 'num') {
        console.error('Error: Tipo de ordenamiento inválido en el criterio: ' + args[i])
        process.exit(1)
      }
      const order = parts[2] || 'asc'
      if (order !== 'asc' && order !== 'desc') {
        console.error('Error: Sentido de ordenamiento inválido en el criterio: ' + args[i])
        process.exit(1)
      }
      sortFields.push({
        name: name,
        numeric: type === 'num',
        descending: order === 'desc'
      })
    } else if (arg.startsWith('-')) {
      console.error('Error: Opción desconocida: ' + arg)
      process.exit(1)
    } else {
      positionals.push(arg)
    }
  }

  if (positionals.length === 0) {
    console.error('Error: Falta el archivo de origen.')
    process.exit(1)
  }

  if (positionals.length === 1) {
    console.error('Error: Falta el archivo de destino.')
    process.exit(1)
  }

  if (positionals.length > 2) {
    console.error('Error: Se especificaron demasiados argumentos posicionales.')
    process.exit(1)
  }

  if (sortFields.length === 0) {
    console.error('Error: No se especificó ningún criterio de ordenamiento (--by).')
    process.exit(1)
  }

  return {
    inputFile: positionals[0],
    outputFile: positionals[1],
    delimiter: delimiter,
    noHeader: noHeader,
    sortFields: sortFields
  }
}

function readInput(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    console.error('Error: No se pudo leer el archivo de origen: ' + filePath)
    process.exit(1)
  }
}

function parseDelimited(text, delimiter, noHeader) {
  if (text.includes('"')) {
    console.error('Error: El archivo contiene comillas dobles, formato no admitido.')
    process.exit(1)
  }

  const lines = text.split(/\r?\n/)
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop()
  }

  if (lines.length === 0) {
    console.error('Error: El archivo de origen está vacío.')
    process.exit(1)
  }

  const firstRow = lines[0].split(delimiter)
  const expectedCols = firstRow.length

  const parsedRows = []
  for (let i = 0; i < lines.length; i++) {
    const fields = lines[i].split(delimiter)
    if (fields.length !== expectedCols) {
      console.error('Error: La fila ' + (i + 1) + ' tiene ' + fields.length + ' campos, se esperaban ' + expectedCols + '.')
      process.exit(1)
    }
    parsedRows.push(fields)
  }

  if (noHeader) {
    return {
      header: null,
      rows: parsedRows
    }
  }

  return {
    header: parsedRows[0],
    rows: parsedRows.slice(1)
  }
}

const config = parseArgs(process.argv.slice(2))
const content = readInput(config.inputFile)
const data = parseDelimited(content, config.delimiter, config.noHeader)

console.log('Encabezado:', data.header)
console.log('Cantidad de filas:', data.rows.length)