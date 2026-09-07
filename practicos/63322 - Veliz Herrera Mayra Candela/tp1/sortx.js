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

function mostrarError(mensaje) {
  throw new Error(mensaje)
}

function interpretarCriterio(texto) {
  const partes = texto.split(':')
  if (partes.length < 1 || partes.length > 3 || partes[0] === '') {
    mostrarError('Criterio de ordenamiento invalido: "' + texto + '".')
  }

  const name = partes[0]
  const tipo = partes[1] === undefined ? 'alpha' : partes[1]
  const orden = partes[2] === undefined ? 'asc' : partes[2]

  if (tipo !== 'alpha' && tipo !== 'num') {
    mostrarError('Tipo no reconocido en "' + texto + '". Use alpha o num.')
  }
  if (orden !== 'asc' && orden !== 'desc') {
    mostrarError('Orden no reconocido en "' + texto + '". Use asc o desc.')
  }

  return {
    name: name,
    numeric: tipo === 'num',
    descending: orden === 'desc',
  }
}

function parseArgs(argv) {
  const config = {
    inputFile: null,
    outputFile: null,
    delimiter: ',',
    noHeader: false,
    sortFields: [],
  }
  const positionals = []

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]

    switch (arg) {
      case '-h':
      case '--help':
        console.log(HELP)
        process.exit(0)
        break
      case '-nh':
      case '--no-header':
        config.noHeader = true
        break
      case '-b':
      case '--by': {
        const valor = argv[i + 1]
        if (valor === undefined) {
          mostrarError('La opcion ' + arg + ' necesita un valor.')
        }
        config.sortFields.push(interpretarCriterio(valor))
        i += 1
        break
      }
      case '-d':
      case '--delimiter': {
        let valor = argv[i + 1]
        if (valor === undefined) {
          mostrarError('La opcion ' + arg + ' necesita un valor.')
        }
        if (valor === '\\t') {
          valor = '\t'
        }
        if (valor.length !== 1) {
          mostrarError('El delimitador debe ser un unico caracter.')
        }
        config.delimiter = valor
        i += 1
        break
      }
      default:
        if (arg.startsWith('-')) {
          mostrarError('Opcion desconocida: "' + arg + '".')
        }
        positionals.push(arg)
        break
    }
  }

  if (positionals.length < 1) {
    mostrarError('No se indico el archivo de origen.')
  }
  if (positionals.length < 2) {
    mostrarError('No se indico el archivo de destino.')
  }
  if (positionals.length > 2) {
    mostrarError('Sobran argumentos: ' + positionals.slice(2).join(', ') + '.')
  }
  if (config.sortFields.length === 0) {
    mostrarError('Hace falta al menos un criterio -b/--by.')
  }

  config.inputFile = positionals[0]
  config.outputFile = positionals[1]
  return config
}

function readInput(inputFile) {
  try {
    return readFileSync(inputFile, 'utf8')
  } catch (err) {
    mostrarError('No se pudo leer el archivo de origen: ' + inputFile + '.')
  }
}

function parseDelimited(text, config) {
  const lineas = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  if (lineas.length > 0 && lineas[lineas.length - 1] === '') {
    lineas.pop()
  }
  if (lineas.length === 0) {
    mostrarError('El archivo de origen esta vacio.')
  }

  for (let i = 0; i < lineas.length; i += 1) {
    if (lineas[i].includes('"')) {
      mostrarError('La entrada contiene comillas dobles, que no estan admitidas.')
    }
  }

  const allRows = lineas.map(function (linea) {
    return linea.split(config.delimiter)
  })
  const expected = allRows[0].length

  for (let i = 0; i < allRows.length; i += 1) {
    if (allRows[i].length !== expected) {
      mostrarError(
        'La fila ' + (i + 1) + ' tiene ' + allRows[i].length + ' campos y se esperaban ' + expected + '.'
      )
    }
  }

  if (config.noHeader) {
    return { header: null, rows: allRows }
  }
  return { header: allRows[0], rows: allRows.slice(1) }
}

function resolverIndice(field, header) {
  if (header) {
    const idx = header.indexOf(field.name)
    if (idx === -1) {
      mostrarError('El campo solicitado no existe: "' + field.name + '".')
    }
    return idx
  }

  const idx = Number(field.name)
  if (Number.isNaN(idx)) {
    mostrarError('El campo solicitado no existe: "' + field.name + '".')
  }
  return idx
}

function compararValores(a, b, numeric) {
  if (numeric) {
    return Number(a) - Number(b)
  }
  return String(a).localeCompare(String(b), 'es')
}

function sortRows(rows, config, header) {
  const field = config.sortFields[0]
  const index = resolverIndice(field, header)
  const copia = rows.slice()

  copia.sort(function (rowA, rowB) {
    const cmp = compararValores(rowA[index], rowB[index], field.numeric)
    if (field.descending) {
      return -cmp
    }
    return cmp
  })

  return copia
}

function serialize(header, rows, config) {
  const lineas = []
  if (header) {
    lineas.push(header.join(config.delimiter))
  }
  for (let i = 0; i < rows.length; i += 1) {
    lineas.push(rows[i].join(config.delimiter))
  }
  return lineas.join('\n') + '\n'
}

function writeOutput(outputFile, content) {
  try {
    writeFileSync(outputFile, content, 'utf8')
  } catch (err) {
    mostrarError('No se pudo escribir el archivo de destino: ' + outputFile + '.')
  }
}

function main() {
  try {
    const config = parseArgs(process.argv.slice(2))
    const text = readInput(config.inputFile)
    const parsed = parseDelimited(text, config)
    const sorted = sortRows(parsed.rows, config, parsed.header)
    const output = serialize(parsed.header, sorted, config)
    writeOutput(config.outputFile, output)
    console.log('Resultado escrito en ' + config.outputFile + '.')
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}

main()