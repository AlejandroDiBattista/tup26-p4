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

import fs from "node:fs"

const fail = (message) => {
  throw new Error(message)
}

const parseDelimiter = (value) => {
  const delimiter = value === "\\t" ? "\t" : value

  if (delimiter.length !== 1) {
    fail("El delimitador debe ser un unico caracter.")
  }

  return delimiter
}

const parseSortField = (value) => {
  const parts = value.split(":")

  if (parts.length > 3 || parts.some((part) => part === "")) {
    fail(`Criterio de orden inválido: ${value}`)
  }

  const [name, type = "alpha", order = "asc"] = parts

  if (type !== "alpha" && type !== "num") {
    fail(`Tipo de orden inválido: ${type}`)
  }

  if (order !== "asc" && order !== "desc") {
    fail(`Orden inválido: ${order}`)
  }

  return {
    name,
    numeric: type === "num",
    descending: order === "desc"
  }
}

const parseArgs = (args) => {
  if (args.includes("-h") || args.includes("--help")) {
    console.log(HELP)
    return null
  }

  const config = {
    inputFile: "",
    outputFile: "",
    delimiter: ",",
    noHeader: false,
    sortFields: []
  }

  const positionalArgs = []

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (arg === "-b" || arg === "--by") {
      const value = args[index + 1]

      if (!value || value.startsWith("-")) {
        fail(`La opción ${arg} necesita un valor.`)
      }

      config.sortFields.push(parseSortField(value))
      index += 1
    } else if (arg === "-d" || arg === "--delimiter") {
      const value = args[index + 1]

      if (!value || value.startsWith("-")) {
        fail(`La opción ${arg} necesita un valor.`)
      }

      config.delimiter = parseDelimiter(value)
      index += 1
    } else if (arg === "-nh" || arg === "--no-header") {
      config.noHeader = true
    } else if (arg.startsWith("-")) {
      fail(`Opción desconocida: ${arg}`)
    } else {
      positionalArgs.push(arg)
    }
  }

  if (positionalArgs.length < 2) {
    fail("Falta el archivo de origen o destino.")
  }

  if (positionalArgs.length > 2) {
    fail(`Argumento inesperado: ${positionalArgs[2]}`)
  }

  if (config.sortFields.length === 0) {
    fail("Debés indicar al menos un criterio con -b o --by.")
  }

  config.inputFile = positionalArgs[0]
  config.outputFile = positionalArgs[1]

  return config
}

const readInput = (inputFile) => {
  try {
    return fs.readFileSync(inputFile, "utf8")
  } catch {
    fail(`No se pudo leer el archivo de origen: ${inputFile}`)
  }
}

const parseDelimited = (text, delimiter) => {
  if (text.includes('"')) {
    fail("La entrada no puede contener comillas dobles.")
  }

  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const content = normalizedText.endsWith("\n")
    ? normalizedText.slice(0, -1)
    : normalizedText

  const rows = content.split("\n").map((line) => line.split(delimiter))
  const fieldCount = rows[0].length

  rows.forEach((row, index) => {
    if (row.length !== fieldCount) {
      fail(`La fila ${index + 1} tiene una cantidad de campos diferente.`)
    }
  })

  return rows
}

const sortRows = (rows, config) => {
  const header = config.noHeader ? null : rows[0]
  const dataRows = config.noHeader ? rows : rows.slice(1)

  const criteria = config.sortFields.map((field) => {
    let index

    if (config.noHeader) {
      if (!/^\d+$/.test(field.name)) {
        fail(`Sin encabezado, el campo debe ser un índice numérico: ${field.name}`)
      }

      index = Number(field.name)
    } else {
      index = header.indexOf(field.name)
    }

    if (index < 0 || index >= rows[0].length) {
      fail(`El campo solicitado no existe: ${field.name}`)
    }

    return { ...field, index }
  })

  criteria
    .filter((criterion) => criterion.numeric)
    .forEach((criterion) => {
      dataRows.forEach((row) => {
        const value = row[criterion.index]

        if (value.trim() === "" || !Number.isFinite(Number(value))) {
          fail(`El valor "${value}" no es numérico para el campo ${criterion.name}`)
        }
      })
    })

  return {
    header,
    rows: [...dataRows].sort((rowA, rowB) => {
      for (const criterion of criteria) {
        const valueA = rowA[criterion.index]
        const valueB = rowB[criterion.index]

        const comparison = criterion.numeric
          ? Number(valueA) - Number(valueB)
          : valueA.localeCompare(valueB)

        if (comparison !== 0) {
          return criterion.descending ? -comparison : comparison
        }
      }

      return 0
    })
  }
}

const serialize = (header, rows, delimiter) => {
  const allRows = header ? [header, ...rows] : rows

  return `${allRows.map((row) => row.join(delimiter)).join("\n")}\n`
}

const writeOutput = (outputFile, text) => {
  try {
    fs.writeFileSync(outputFile, text, "utf8")
  } catch {
    fail(`No se pudo escribir el archivo de destino: ${outputFile}`)
  }
}

const sortx = (args) => {
  const config = parseArgs(args)

  if (config === null) {
    return
  }

  const text = readInput(config.inputFile)
  const rows = parseDelimited(text, config.delimiter)
  const result = sortRows(rows, config)
  const output = serialize(result.header, result.rows, config.delimiter)

  writeOutput(config.outputFile, output)
}

try {
  sortx(process.argv.slice(2))
} catch (error) {
  console.error(`Error: ${error.message}`)
  process.exitCode = 1
}