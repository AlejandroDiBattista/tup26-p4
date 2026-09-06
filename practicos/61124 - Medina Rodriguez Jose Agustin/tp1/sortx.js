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

import fs from 'fs';
const argv = process.argv.slice(2);
function parseArgs(argv) {
  const config = {
  inputFile: argv[0],
  outputFile: argv[1],
  delimiter: ',',
  campo: null
};

  for (let i = 2; i < argv.length; i++) {
    const actual = argv[i];

    if (actual === '-b') {
      config.campo = argv[i + 1];
      i++;
    }
  }

  return config;
}

function readInput(inputFile) {
  const text = fs.readFileSync(inputFile, 'utf8');
  return text;
}

function parseDelimited(text, delimiter) {
  const lines = text.split(/\r?\n/).filter(line => line.length > 0);
  const rows = lines.map(line => line.split(delimiter));
  return rows;
}

function sortRows(rows, campo) {
  const header = rows[0];
  const dataRows = rows.slice(1);
  const indice = header.indexOf(campo);

  dataRows.sort((filaA, filaB) => {
    return filaA[indice].localeCompare(filaB[indice]);
  });

  return [header, ...dataRows];
}

function serialize(rows, delimiter) {
  const lines = rows.map(row => row.join(delimiter));
  return lines.join('\n') + '\n';
}

function writeOutput(outputFile, text) {
  fs.writeFileSync(outputFile, text, 'utf8');
}

if (argv.includes('-h') || argv.includes('--help')) {
  console.log(HELP);
} else {
  const config = parseArgs(argv);
  const text = readInput(config.inputFile);
  const rows = parseDelimited(text, config.delimiter);
  const sortedRows = sortRows(rows, config.campo);
  const output = serialize(sortedRows, config.delimiter);
  writeOutput(config.outputFile, output);
  console.log('Listo, se generó', config.outputFile);
}
