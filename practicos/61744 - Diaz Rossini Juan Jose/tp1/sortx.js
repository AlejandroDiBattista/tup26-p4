#!/usr/bin/env node

import fs from "node:fs";

const HELP = `
sortx — Ordena archivos de texto delimitados

USO:
    sortx <origen> <destino> [opciones]

OPCIONES:
    -b, --by <campo[:tipo[:orden]]>  Criterio de ordenamiento (repetible).
    -d, --delimiter <c>              Delimitador de un solo carácter ("," por defecto).
    -nh, --no-header                  El archivo no tiene encabezado.
    -h, --help                        Muestra esta ayuda.

TIPOS: alpha (predeterminado), num
ORDEN: asc (predeterminado), desc
`;

function parseCriterion(value) {
  const parts = value.split(":");
  if (parts.length > 3 || !parts[0] || ![undefined, "alpha", "num"].includes(parts[1]) || ![undefined, "asc", "desc"].includes(parts[2])) {
    throw new Error(`Criterio de ordenamiento inválido: "${value}".`);
  }
  return { name: parts[0], numeric: parts[1] === "num", descending: parts[2] === "desc" };
}

function parseArgs(args) {
  const config = { delimiter: ",", noHeader: false, sortFields: [] };
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "-h" || arg === "--help") return { help: true };
    if (arg === "-nh" || arg === "--no-header") config.noHeader = true;
    else if (arg === "-b" || arg === "--by") {
      const value = args[++i];
      if (!value || value.startsWith("-")) throw new Error(`La opción ${arg} requiere un valor.`);
      config.sortFields.push(parseCriterion(value));
    } else if (arg === "-d" || arg === "--delimiter") {
      const value = args[++i];
      if (value === undefined) throw new Error(`La opción ${arg} requiere un valor.`);
      config.delimiter = value === "\\t" ? "\t" : value;
    } else if (arg.startsWith("-")) throw new Error(`Opción desconocida: ${arg}.`);
    else positional.push(arg);
  }
  [config.inputFile, config.outputFile] = positional;
  if (!config.inputFile) throw new Error("Falta el archivo de origen.");
  if (!config.outputFile) throw new Error("Falta el archivo de destino.");
  if (positional.length > 2) throw new Error("Se indicaron demasiados argumentos posicionales.");
  if (config.delimiter.length !== 1) throw new Error("El delimitador debe ser un único carácter.");
  if (config.sortFields.length === 0) throw new Error("Debe indicar al menos un criterio con --by.");
  return config;
}

function readInput(filename) {
  try { return fs.readFileSync(filename, "utf8"); }
  catch (error) { throw new Error(`No se pudo leer el archivo de origen "${filename}": ${error.message}`); }
}

function parseDelimited(text, delimiter) {
  if (text.includes('"')) throw new Error("La entrada no puede contener comillas dobles.");
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.endsWith("\n") ? normalized.slice(0, -1).split("\n") : normalized.split("\n");
  if (lines.length === 0 || (lines.length === 1 && lines[0] === "")) return [];
  const rows = lines.map((line) => line.split(delimiter));
  const fieldCount = rows[0].length;
  if (rows.some((row) => row.length !== fieldCount)) throw new Error("Todas las filas deben tener la misma cantidad de campos.");
  return rows;
}

function sortRows(rows, config) {
  const header = config.noHeader ? null : rows[0];
  const data = config.noHeader ? rows : rows.slice(1);
  const columnIndexes = config.sortFields.map((field) => {
    const index = config.noHeader ? Number(field.name) : header.indexOf(field.name);
    if (!Number.isInteger(index) || index < 0 || index >= rows[0].length) throw new Error(`El campo solicitado no existe: "${field.name}".`);
    return index;
  });
  for (let criterion = 0; criterion < config.sortFields.length; criterion += 1) {
    const field = config.sortFields[criterion];
    if (!field.numeric) continue;
    for (const row of data) {
      const value = row[columnIndexes[criterion]];
      if (value.trim() === "" || !Number.isFinite(Number(value))) throw new Error(`El valor "${value}" del campo "${field.name}" no es numérico.`);
    }
  }
  data.sort((a, b) => {
    for (let i = 0; i < config.sortFields.length; i += 1) {
      const field = config.sortFields[i];
      const index = columnIndexes[i];
      const comparison = field.numeric ? Number(a[index]) - Number(b[index]) : a[index].localeCompare(b[index]);
      if (comparison !== 0) return field.descending ? -comparison : comparison;
    }
    return 0;
  });
  return header ? [header, ...data] : data;
}

function serialize(rows, delimiter) {
  return `${rows.map((row) => row.join(delimiter)).join("\n")}\n`;
}

function writeOutput(filename, text) {
  try { fs.writeFileSync(filename, text, "utf8"); }
  catch (error) { throw new Error(`No se pudo escribir el archivo de destino "${filename}": ${error.message}`); }
}

function main() {
  try {
    const config = parseArgs(process.argv.slice(2));
    if (config.help) return console.log(HELP);
    const rows = parseDelimited(readInput(config.inputFile), config.delimiter);
    if (rows.length === 0) throw new Error("El archivo de origen está vacío.");
    writeOutput(config.outputFile, serialize(sortRows(rows, config), config.delimiter));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
