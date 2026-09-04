#!/usr/bin/env node

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

function main() {
  try {
    const config = parseArgs(process.argv.slice(2));
    if (config.help) {
      console.log(HELP);
      process.exit(0);
    }
    console.log(config);
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

main();