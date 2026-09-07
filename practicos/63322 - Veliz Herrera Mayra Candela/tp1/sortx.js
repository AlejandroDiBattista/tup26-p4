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

function main() {
  try {
    const config = parseArgs(process.argv.slice(2))
    console.log('Configuracion leida. La lectura de "' + config.inputFile + '" queda pendiente.')
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}

main()