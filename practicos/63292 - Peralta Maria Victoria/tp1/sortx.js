#!/usr/bin/env node

import fs from 'node:fs';

const HELP = `
sortx origen destino [-b|--by campo[:tipo[:orden]]]... [-d|--delimiter d] [-nh|--no-header] [-h|--help]
tipo: alpha (default) | num
orden: asc (default) | desc
`;

function parseBy(val) {
  const [name, tipo = 'alpha', orden = 'asc'] = val.split(':');
  if (!name) throw new Error(`criterio inválido: ${val}`);
  if (tipo !== 'alpha' && tipo !== 'num') throw new Error(`tipo inválido: ${tipo}`);
  if (orden !== 'asc' && orden !== 'desc') throw new Error(`orden inválido: ${orden}`);
  return { name, numeric: tipo === 'num', descending: orden === 'desc' };
}

function parseArgs(args) {
  const config = { delimiter: ',', noHeader: false, sortFields: [], help: false };
  const pos = [];
  let i = 0;

  while (i < args.length) {
    const a = args[i];

    if (a === '-h' || a === '--help') {
      config.help = true;
      return config;
    }

    if (a === '-b' || a === '--by') {
      const v = args[i + 1];
      if (v === undefined) throw new Error(`${a} requiere un valor`);
      config.sortFields.push(parseBy(v));
      i += 2;
      continue;
    }

    if (a === '-d' || a === '--delimiter') {
      const v = args[i + 1];
      if (v === undefined) throw new Error(`${a} requiere un valor`);
      const d = v === '\\t' ? '\t' : v;
      if (d.length !== 1) throw new Error('el delimitador debe ser un solo carácter');
      config.delimiter = d;
      i += 2;
      continue;
    }

    if (a === '-nh' || a === '--no-header') {
      config.noHeader = true;
      i++;
      continue;
    }

    if (a.startsWith('-')) throw new Error(`opción desconocida: ${a}`);

    pos.push(a);
    i++;
  }

  if (pos.length < 2) throw new Error('faltan origen y/o destino');
  if (pos.length > 2) throw new Error(`argumento de más: ${pos[2]}`);
  if (config.sortFields.length === 0) throw new Error('falta al menos un --by');

  [config.inputFile, config.outputFile] = pos;
  return config;
}

function readInput(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (e) {
    throw new Error(`no se pudo leer ${path}: ${e.message}`);
  }
}

function parseDelimited(text, delimiter, noHeader) {
  if (text.includes('"')) throw new Error('el archivo contiene comillas dobles');

  const lines = text.split(/\r\n|\n/).filter((l, idx, arr) => !(l === '' && idx === arr.length - 1));
  if (lines.length === 0) throw new Error('el archivo está vacío');

  const rows = lines.map((l) => l.split(delimiter));
  const header = noHeader ? null : rows[0];
  const data = noHeader ? rows : rows.slice(1);

  const n = header ? header.length : data[0].length;
  const all = header ? [header, ...data] : data;
  for (const r of all) {
    if (r.length !== n) throw new Error('las filas no tienen la misma cantidad de campos');
  }

  return { header, rows: data };
}

function fieldIndex(name, header, noHeader, n) {
  if (noHeader) {
    const idx = Number(name);
    if (!Number.isInteger(idx) || idx < 0 || idx >= n) throw new Error(`el campo '${name}' no existe`);
    return idx;
  }
  const idx = header.indexOf(name);
  if (idx === -1) throw new Error(`el campo '${name}' no existe`);
  return idx;
}

function cmp(a, b, numeric) {
  if (!numeric) return a.localeCompare(b);
  const na = Number(a);
  const nb = Number(b);
  if (Number.isNaN(na)) throw new Error(`valor no numérico: '${a}'`);
  if (Number.isNaN(nb)) throw new Error(`valor no numérico: '${b}'`);
  return na - nb;
}

function sortRows(rows, sortFields, header, noHeader) {
  const n = header ? header.length : (rows[0] ? rows[0].length : 0);
  const crit = sortFields.map((f) => ({
    idx: fieldIndex(f.name, header, noHeader, n),
    numeric: f.numeric,
    desc: f.descending,
  }));

  return rows.slice().sort((r1, r2) => {
    for (const c of crit) {
      let res = cmp(r1[c.idx], r2[c.idx], c.numeric);
      if (c.desc) res = -res;
      if (res !== 0) return res;
    }
    return 0;
  });
}

function serialize(header, rows, delimiter, noHeader) {
  const lines = [];
  if (!noHeader) lines.push(header.join(delimiter));
  for (const r of rows) lines.push(r.join(delimiter));
  return lines.join('\n') + '\n';
}

function main() {
  try {
    const config = parseArgs(process.argv.slice(2));
    if (config.help) {
      console.log(HELP);
      process.exit(0);
    }
    const raw = readInput(config.inputFile);
    const { header, rows } = parseDelimited(raw, config.delimiter, config.noHeader);
    const sorted = sortRows(rows, config.sortFields, header, config.noHeader);
    const out = serialize(header, sorted, config.delimiter, config.noHeader);
    console.log(out);
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

main();