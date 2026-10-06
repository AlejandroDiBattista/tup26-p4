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

import fs from 'fs';

// 1. Parsear los argumentos pasados por consola
function parseArgs(args) {
  if (args.includes('-h') || args.includes('--help')) {
    console.log(HELP);
    process.exit(0);
  }

  let inputFile = null;
  let outputFile = null;
  let delimiter = ',';
  let noHeader = false;
  let sortFields = [];

  for (let i = 0; i < args.length; i++) {
    let arg = args[i];

    if (arg === '-nh' || arg === '--no-header') {
      noHeader = true;
    } else if (arg === '-d' || arg === '--delimiter') {
      i++;
      let del = args[i];
      if (!del || del.startsWith('-')) {
        throw new Error('Falta indicar el delimitador para -d');
      }
      if (del === '\\t') del = '\t';
      if (del.length !== 1) {
        throw new Error('El delimitador debe ser un solo caracter');
      }
      delimiter = del;
    } else if (arg === '-b' || arg === '--by') {
      i++;
      let valor = args[i];
      if (!valor || valor.startsWith('-')) {
        throw new Error('Falta especificar el criterio en -b');
      }

      let partes = valor.split(':');
      let campo = partes[0];
      let tipo = partes[1] || 'alpha';
      let orden = partes[2] || 'asc';

      if (!campo) throw new Error('Criterio vacio en la opcion -b');
      if (tipo !== 'alpha' && tipo !== 'num') {
        throw new Error('Tipo invalido: ' + tipo + ' (usar alpha o num)');
      }
      if (orden !== 'asc' && orden !== 'desc') {
        throw new Error('Orden invalido: ' + orden + ' (usar asc o desc)');
      }

      sortFields.push({
        name: campo,
        numeric: tipo === 'num',
        descending: orden === 'desc'
      });
    } else if (arg.startsWith('-')) {
      throw new Error('Opcion desconocida: ' + arg);
    } else {
      if (!inputFile) {
        inputFile = arg;
      } else if (!outputFile) {
        outputFile = arg;
      } else {
        throw new Error('Argumentos adicionales no reconocidos');
      }
    }
  }

  if (!inputFile) throw new Error('Falta indicar el archivo de origen');
  if (!outputFile) throw new Error('Falta indicar el archivo de destino');
  if (sortFields.length === 0) throw new Error('Se requiere especificar al menos un criterio -b');

  return { inputFile, outputFile, delimiter, noHeader, sortFields };
}

// 2. Leer archivo origen
function readInput(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new Error('No se pudo leer el archivo de origen: ' + filePath);
  }
}

// 3. Separar en filas y columnas
function parseDelimited(text, delimiter, noHeader) {
  if (text.includes('"')) {
    throw new Error('El archivo contiene comillas dobles, formato no soportado');
  }

  let lineas = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  if (lineas.length > 0 && lineas[lineas.length - 1] === '') {
    lineas.pop();
  }

  if (lineas.length === 0) {
    throw new Error('El archivo origen esta vacio');
  }

  let header = null;
  let filaInicio = 0;

  if (!noHeader) {
    header = lineas[0].split(delimiter);
    filaInicio = 1;
  }

  let totalColumnas = header ? header.length : lineas[0].split(delimiter).length;
  let rows = [];

  for (let i = filaInicio; i < lineas.length; i++) {
    let fila = lineas[i].split(delimiter);
    if (fila.length !== totalColumnas) {
      throw new Error('La fila ' + (i + 1) + ' tiene una cantidad incorrecta de columnas');
    }
    rows.push(fila);
  }

  return { header, rows };
}

// 4. Ordenar segun criterios especificados
function sortRows(rows, header, sortFields, noHeader) {
  let criterios = [];

  for (let k = 0; k < sortFields.length; k++) {
    let criterio = sortFields[k];
    let colIdx = -1;

    if (noHeader) {
      colIdx = parseInt(criterio.name, 10);
      if (isNaN(colIdx) || colIdx < 0) {
        throw new Error('Indice de columna invalido: ' + criterio.name);
      }
    } else {
      colIdx = header.indexOf(criterio.name);
      if (colIdx === -1) {
        throw new Error('La columna "' + criterio.name + '" no existe en el encabezado');
      }
    }

    criterios.push({
      index: colIdx,
      numeric: criterio.numeric,
      descending: criterio.descending
    });
  }

  return rows.slice().sort(function(a, b) {
    for (let c = 0; c < criterios.length; c++) {
      let crit = criterios[c];
      let valA = a[crit.index];
      let valB = b[crit.index];

      if (crit.numeric) {
        let numA = Number(valA);
        let numB = Number(valB);

        if (valA.trim() === '' || isNaN(numA)) {
          throw new Error('Se encontro un valor no numerico en columna ' + crit.index + ': ' + valA);
        }
        if (valB.trim() === '' || isNaN(numB)) {
          throw new Error('Se encontro un valor no numerico en columna ' + crit.index + ': ' + valB);
        }

        if (numA !== numB) {
          return crit.descending ? (numB - numA) : (numA - numB);
        }
      } else {
        let diff = valA.localeCompare(valB);
        if (diff !== 0) {
          return crit.descending ? -diff : diff;
        }
      }
    }
    return 0;
  });
}

// 5. Serializar filas a texto delimitado
function serialize(header, rows, delimiter) {
  let lineas = [];
  if (header) {
    lineas.push(header.join(delimiter));
  }
  for (let i = 0; i < rows.length; i++) {
    lineas.push(rows[i].join(delimiter));
  }
  return lineas.join('\n') + '\n';
}

// 6. Escribir resultado
function writeOutput(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (err) {
    throw new Error('No se pudo escribir en el archivo de destino: ' + filePath);
  }
}

// Punto de entrada
function main() {
  try {
    let args = process.argv.slice(2);
    let config = parseArgs(args);
    let contenido = readInput(config.inputFile);
    let datos = parseDelimited(contenido, config.delimiter, config.noHeader);
    let ordenadas = sortRows(datos.rows, datos.header, config.sortFields, config.noHeader);
    let salida = serialize(datos.header, ordenadas, config.delimiter);
    writeOutput(config.outputFile, salida);
  } catch (err) {
    console.error('Error: ' + err.message);
    process.exit(1);
  }
}

main();