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
function parseArgs(args) {
  const config = { delimiter: ',', noHeader: false, sortFields: [] };
  const files = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-h' || arg === '--help') return { help: true };
    if (arg === '-nh' || arg === '--no-header') {
      config.noHeader = true;
    } else if (['-b', '--by', '-d', '--delimiter'].includes(arg)) {
      const value = args[++i];
      if (value === undefined || value.startsWith('-')) {
        if (value !== '-' || arg === '-b' || arg === '--by') {
          throw new Error('Falta el valor de ' + arg);
        }
      }
      if (arg === '-d' || arg === '--delimiter') {
        config.delimiter = value === '\\t' ? '\u0009' : value;
      } else {
        const [name, type = 'alpha', order = 'asc', extra] = value.split(':');
        if (!name || !['alpha', 'num'].includes(type) || !['asc', 'desc'].includes(order) || extra !== undefined) {
          throw new Error('Criterio invÃ¡lido: ' + value);
        }
        config.sortFields.push({ name, numeric: type === 'num', descending: order === 'desc' });
      }
    } else if (arg.startsWith('-')) {
      throw new Error('OpciÃ³n desconocida: ' + arg);
    } else {
      files.push(arg);
    }
  }
  if (files.length !== 2) throw new Error('IndicÃ¡ exactamente un archivo de origen y uno de destino');
  if (config.sortFields.length === 0) throw new Error('IndicÃ¡ al menos un criterio con --by');
  if ([...config.delimiter].length !== 1 || /["\r\n]/.test(config.delimiter)) throw new Error('Delimitador invÃ¡lido');
  [config.inputFile, config.outputFile] = files;
  return config;
}

import { readFileSync } from 'node:fs';

function readInput(path) {
  return readFileSync(path, 'utf8');
}

function parseDelimited(text, { delimiter, noHeader }) {
  if (text.includes('"')) throw new Error('La entrada contiene comillas dobles');
  const lines = text.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/);
  if (lines.at(-1) === '') lines.pop();
  if (lines.length === 0) throw new Error('El archivo de origen estÃ¡ vacÃ­o');
  const rows = lines.map((line, index) => {
    const fields = line.split(delimiter);
    if (fields.length !== lines[0].split(delimiter).length) {
      throw new Error('Cantidad de campos incorrecta en la fila ' + (index + 1));
    }
    return fields;
  });
  return { width: rows[0].length, header: noHeader ? null : rows.shift(), rows };
}

function sortRows({ width, header, rows }, { sortFields }) {
  const criteria = sortFields.map(field => {
    const index = header ? header.indexOf(field.name) : /^\d+$/.test(field.name) ? Number(field.name) : -1;
    if (index < 0 || index >= width) throw new Error('Campo inexistente: ' + field.name);
    return { ...field, index };
  });
  const collator = new Intl.Collator('es');
  const prepared = rows.map(row => ({
    row,
    keys: criteria.map(({ index, numeric, name }) => {
      const value = row[index];
      if (!numeric) return value;
      const number = Number(value);
      if (!value.trim() || !Number.isFinite(number)) throw new Error('Valor no numÃ©rico en ' + name + ': ' + value);
      return number;
    }),
  }));
  prepared.sort((a, b) => {
    for (const [i, field] of criteria.entries()) {
      const order = field.numeric ? Math.sign(a.keys[i] - b.keys[i]) : collator.compare(a.keys[i], b.keys[i]);
      if (order !== 0) return field.descending ? -order : order;
    }
    return 0;
  });
  return { header, rows: prepared.map(({ row }) => row) };
}

import { writeFileSync } from 'node:fs';

function serialize({ header, rows }, delimiter) {
  return (header ? [header, ...rows] : rows).map(row => row.join(delimiter)).join('\n') + '\n';
}

function writeOutput(path, text) {
  writeFileSync(path, text, 'utf8');
}
