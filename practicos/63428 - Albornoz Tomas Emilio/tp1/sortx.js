#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const help = 'Uso: sortx origen destino [-b|--by campo[:alpha|num[:asc|desc]]]... [-d|--delimiter carácter] [-nh|--no-header] [-h|--help]';

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
          throw new Error('Criterio inválido: ' + value);
        }
        config.sortFields.push({ name, numeric: type === 'num', descending: order === 'desc' });
      }
    } else if (arg.startsWith('-')) {
      throw new Error('Opción desconocida: ' + arg);
    } else {
      files.push(arg);
    }
  }
  if (files.length !== 2) throw new Error('Indicá exactamente un archivo de origen y uno de destino');
  if (config.sortFields.length === 0) throw new Error('Indicá al menos un criterio con --by');
  if ([...config.delimiter].length !== 1 || /["\r\n]/.test(config.delimiter)) throw new Error('Delimitador inválido');
  [config.inputFile, config.outputFile] = files;
  return config;
}

function readInput(path) {
  return readFileSync(path, 'utf8');
}

function parseDelimited(text, { delimiter, noHeader }) {
  if (text.includes('"')) throw new Error('La entrada contiene comillas dobles');
  const lines = text.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/);
  if (lines.at(-1) === '') lines.pop();
  if (lines.length === 0) throw new Error('El archivo de origen está vacío');
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
      if (!value.trim() || !Number.isFinite(number)) throw new Error('Valor no numérico en ' + name + ': ' + value);
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

function serialize({ header, rows }, delimiter) {
  return (header ? [header, ...rows] : rows).map(row => row.join(delimiter)).join('\n') + '\n';
}

function writeOutput(path, text) {
  writeFileSync(path, text, 'utf8');
}

try {
  const config = parseArgs(process.argv.slice(2));
  if (config.help) {
    console.log(help);
  } else {
    const input = readInput(config.inputFile);
    const data = parseDelimited(input, config);
    const sorted = sortRows(data, config);
    const output = serialize(sorted, config.delimiter);
    writeOutput(config.outputFile, output);
  }
} catch (error) {
  console.error('sortx: ' + error.message);
  process.exitCode = 1;
}

