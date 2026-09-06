#!/usr/bin/env node

import fs from "node:fs/promises";
import process from "node:process";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const DEFAULT_DELIMITER = ",";
const TAB = "\t";
const ESCAPED_TAB = "\\t";
const HELP_SHORT = "-h";
const HELP_LONG = "--help";
const BY_SHORT = "-b";
const BY_LONG = "--by";
const DELIMITER_SHORT = "-d";
const DELIMITER_LONG = "--delimiter";
const NO_HEADER_SHORT = "-nh";
const NO_HEADER_LONG = "--no-header";
const TYPE_ALPHA = "alpha";
const TYPE_NUM = "num";
const ORDER_ASC = "asc";
const ORDER_DESC = "desc";
const MIN_POSITIONAL_ARGS = 2;
const MAX_SPEC_PARTS = 3;
const NAME_INDEX = 0;
const TYPE_INDEX = 1;
const ORDER_INDEX = 2;
const ENCODING = "utf8";
const ENOENT_CODE = "ENOENT";
const EMPTY_LINE = "";
const QUOTE_CHAR = '"';
const NEWLINE = "\n";

const HELP = `sortx — Ordena archivos de texto delimitados

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
                        Usá \t para archivos separados por tabulaciones.

    -nh, --no-header    Indica que el archivo no tiene encabezado.
                        Los campos se identifican mediante índices desde cero.

    -h, --help          Muestra esta ayuda.

EJEMPLOS:
    sortx empleados.csv ordenados.csv -b apellido
    sortx empleados.csv salarios.csv -b salario:num:desc
    sortx empleados.csv resultado.csv -b departamento -b salario:num:desc
    sortx datos.csv resultado.csv -nh -b 2:num:desc
    sortx datos.tsv salida.tsv -d "\t" -b nombre
`;

function showHelp() {
  console.log(HELP);
}

function parseType(type) {
  if (type === TYPE_NUM) return true;
  if (type !== TYPE_ALPHA)
    throw new Error('Tipo inválido: use "alpha" o "num"');
  return false;
}

function parseOrder(order) {
  if (order === ORDER_DESC) return true;
  if (order !== ORDER_ASC)
    throw new Error('Orden inválido: use "asc" o "desc"');
  return false;
}

function parseByValue(spec) {
  const parts = spec.split(":");
  if (parts.length > MAX_SPEC_PARTS)
    throw new Error("Formato inválido: use campo[:tipo[:orden]]");
  return {
    name: parts[NAME_INDEX],
    numeric:
      parts.length > TYPE_INDEX
        ? parseType(parts[TYPE_INDEX].toLowerCase())
        : false,
    descending:
      parts.length > ORDER_INDEX
        ? parseOrder(parts[ORDER_INDEX].toLowerCase())
        : false,
  };
}

function parseDelimiterValue(delim) {
  if (delim === ESCAPED_TAB) return TAB;
  if (delim.length !== 1)
    throw new Error("El delimitador debe ser un único carácter");
  return delim;
}

function assignPositional(config, arg) {
  if (config.inputFile === null) {
    config.inputFile = arg;
    return;
  }
  if (config.outputFile === null) {
    config.outputFile = arg;
    return;
  }
  throw new Error(`Argumento desconocido: ${arg}`);
}

function requireNextArg(args, i, flagName) {
  if (i + 1 >= args.length || args[i + 1].startsWith("-")) {
    throw new Error(`La opción ${flagName} requiere un valor`);
  }
  return args[i + 1];
}

function parseArgs(argv) {
  const args = argv.slice(2);

  if (args.includes(HELP_LONG) || args.includes(HELP_SHORT)) {
    return { help: true };
  }

  const config = {
    inputFile: null,
    outputFile: null,
    delimiter: DEFAULT_DELIMITER,
    noHeader: false,
    sortFields: [],
    help: false,
  };

  let hasBy = false;
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    if (arg === HELP_LONG || arg === HELP_SHORT) {
      return { help: true };
    }

    if (arg === BY_LONG || arg === BY_SHORT) {
      const spec = requireNextArg(args, i, "--by");
      config.sortFields.push(parseByValue(spec));
      hasBy = true;
      i += 2;
      continue;
    }

    if (arg === DELIMITER_LONG || arg === DELIMITER_SHORT) {
      const delim = requireNextArg(args, i, "--delimiter");
      config.delimiter = parseDelimiterValue(delim);
      i += 2;
      continue;
    }

    if (arg === NO_HEADER_LONG || arg === NO_HEADER_SHORT) {
      config.noHeader = true;
    } else {
      assignPositional(config, arg);
    }
    i++;
  }

  if (!config.inputFile || !config.outputFile) {
    throw new Error("Faltan archivos de origen y/o destino");
  }

  if (!hasBy) {
    throw new Error(
      "Debe especificar al menos un criterio de ordenamiento con --by",
    );
  }

  return config;
}

async function readInput(filePath) {
  try {
    return await fs.readFile(filePath, ENCODING);
  } catch (error) {
    if (error.code === ENOENT_CODE) {
      throw new Error(`No se puede leer el archivo de origen: ${filePath}`);
    }
    throw new Error(`No se puede leer el archivo de origen: ${filePath}`);
  }
}

async function writeOutput(filePath, content) {
  try {
    await fs.writeFile(filePath, content, ENCODING);
  } catch {
    throw new Error(`No se puede escribir el archivo de destino: ${filePath}`);
  }
}

function parseDelimited(text, delimiter, noHeader) {
  const lines = text.split(/\r?\n/).filter((line) => line !== EMPTY_LINE);
  if (lines.length === 0) {
    throw new Error("Las filas tienen diferente cantidad de campos");
  }

  const rows = lines.map((line) => {
    if (line.includes(QUOTE_CHAR)) {
      throw new Error("Los campos no pueden contener comillas dobles");
    }
    return line.split(delimiter);
  });

  const columnCount = rows[0].length;
  const hasInconsistentFields = rows.some((row) => row.length !== columnCount);
  if (hasInconsistentFields) {
    throw new Error("Las filas tienen diferente cantidad de campos");
  }

  if (noHeader) {
    const headers = Array.from({ length: columnCount }, (_, index) => String(index));
    return { headers, rows };
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);
  return { headers, rows: dataRows };
}

async function main() {
  try {
    const config = parseArgs(process.argv);

    if (config.help) {
      showHelp();
      process.exit(EXIT_SUCCESS);
    }

    const content = await readInput(config.inputFile);
    const { headers, rows } = parseDelimited(content, config.delimiter, config.noHeader);

    console.log("Archivo leído:", content.length, "caracteres");
    console.log("Headers:", headers);
    console.log("Rows:", rows.length);

    await writeOutput(config.outputFile, content);
    console.log("Archivo escrito (sin procesar por ahora)");

    process.exit(EXIT_SUCCESS);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(EXIT_ERROR);
  }
}

main();
