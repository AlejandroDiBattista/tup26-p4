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
`;
function parseArgs(args) {
  const config = {
    inputFile: null,
    outputFile: null,
    delimiter: ",",
    noHeader: false,
    sortFields: [],
    help: false,
  };
  const positional = [];
  const knownOptions = new Set([
    "-b",
    "--by",
    "-d",
    "--delimiter",
    "-nh",
    "--no-header",
    "-h",
    "--help",
  ]);
  for (let i = 0; i < args.length; i++) {
    const argument = args[i];
    if (argument === "-h" || argument === "--help") {
      config.help = true;
      continue;
    }
    if (argument === "-nh" || argument === "--no-header") {
      config.noHeader = true;
      continue;
    }
    if (argument === "-d" || argument === "--delimiter") {
      const value = args[i + 1];
      if (value === undefined || knownOptions.has(value)) {
        throw new Error("${argument}requiere un delimitador");
      }
      config.delimiter = value === "\\t" ? "\t" : value;
      i++;
      continue;
    }
    if (argument === "-b" || argument === "--by") {
      const criterion = args[i + 1];
      if (criterion === undefined || criterion.startsWith("-")) {
        throw new Error("${argument}requiere un criterio");
      }
      const parts = criterion.split(":");
      if (parts.length > 3 || parts[0] === "") {
        throw new Error("criterio invalido:${criterion}");
      }
      const name = parts[0];
      const type = parts[1] || "alpha";
      const order = parts[2] || "asc";
      if (type !== "alpha" && type !== "num") {
        throw new Error("tipo invalido:${type}");
      }
      if (order !== "asc" && order !== "desc") {
        throw new Error("orden invalido:${order}");
      }
      config.sortFields.push({
        name,
        numeric: type === "num",
        descending: order === "desc",
      });
      i++;
      continue;
    }
    if (argument.startsWith("-")) {
      throw new Error("opcion desconocida:${argument}");
    }
    positional.push(argument);
  }
  if (config.help) {
    return config;
  }
  if (positional.length === 0) {
    throw new Error("falta el archivo de origen");
  }
  if (positional.length === 1) {
    throw new Error("falta el archivo de destino");
  }
  if (positional.length > 2) {
    throw new Error("argumentos inesperado:${positional[2]}");
  }
  if (config.sortFields.length === 0) {
    throw new Error("debe especificar al menos un criterio --by");
  }
  if ([...config.delimiter].length !== 1) {
    throw new Error("el delimitador debe ser un unico caracter");
  }
  config.inputFile = positional[0];
  config.outputFile = positional[1];
  return config;
}
import * as fs from "node:fs";
function readInput(inputFile) {
  try {
    return fs.readFileSync(inputFile, "utf8");
  } catch (error) {
    throw new Error(
      `no se pudo leer el archivo de origen "${inputFile}": ${error.message}`,
    );
  }
}
function parseDelimited(text, delimiter) {
  if (text.includes('"')) {
    throw new Error(
      "le entrada contiene comillas dobles; los campos entre comillas no estan admitidos",
    );
  }

  if (text == "") {
    return [];
  }
  const nomalizedText = text.replace(/\r\n/g, "\n");
  const content = nomalizedText.endsWith("\n")
    ? nomalizedText.slice(0, -1)
    : nomalizedText;
  if (content === "") {
    return [];
  }
  const lines = content.split("\n");
  const rows = lines.map((line) => line.split(delimiter));
  const expectedFieldCount = rows[0].length;
  for (let i = 1; i < rows.length; i++) {
    const currentFieldCount = rows[i].length;
    if (currentFieldCount !== expectedFieldCount) {
      throw new Error(
        "la fila ${i+1}tiene ${currentFieldCount} cmapos;" +
          "se esperaban ${expectedFieldCount}",
      );
    }
  }
  return rows;
}
function sortRows(rows, confing) {
  if (rows.length === 0) {
    throw new Error("el archivo de origen esta vacio");
  }
  const header = config.noHeader ? null : rows[0];
  const dataRows = config.noHeader ? [...rows] : rows.slice(1);
  const columnCount = rows[0].length;
  const criteria = config.sortFields.map((field) => {
    let columnIndex;
    if (config.noHeader) {
      if (!/^\d+$/.test(field.name)) {
        throw new Error('el campo"${field.name}"debe ser un indice numerico');
      }
      columnIndex = Number(field.name);
    } else {
      columnIndex = header.indexOf(field.name);
    }
    if (columnIndex < 0 || columnIndex >= columnCount) {
      throw new Error("el campo solicitado no existe:${field.name}");
    }
    return {
      ...field,
      columIndex,
    };
  });
  for (const criterion of criteria) {
    if (!criterion.numeric) {
      continue;
    }
    for (let i = 0; i < dataRows.length; i++) {
      const value = dataRows[i][criterion.columnIndex];
      const number = Number(value);
      if (value.trim() === "" || !Number.isFinite(number)) {
        const rowNumber = config.noHeader ? i + 1 : i + 2;
        throw new Error(
          "el valor de la fila ${rowNumber}, campo" +
            '"${criterion.name}", no es numerico:"${value}"',
        );
      }
    }
  }
  const indexedRows = dataRows.map((row, originalIndex) => ({
    row,
    originalIndex,
  }));
  indexedRows.sort((first, second) => {
    for (const criterion of criteria) {
      const firstValue = first.row[criterion.columnIndex];
      const secondValue = second.row[criterion.columnIndex];
      let comparison;
      if (criterion.numeric) {
        comparison = Number(firstValue) - Number(secondValue);
      } else {
        comparison = firstValue.localeCompare(secondValue, "es");
      }
      if (comparison !== 0) {
        return criterion.descendin ? -comparison : comparison;
      }
    }
    return first.originalIndex - second.originalIndex;
  });
  const sortedRows = indexedRows.map((item) => item.row);
  if (header === null) {
    return sortedRows;
  }
  return [header, ...sortedRows];
}
function serialize(rows, delimiter) {
  return rows.map((row) => row.join(delimiter)).join("\n");
}
function writeOutput(outputFile, content) {
  try {
    fs.writeFileSync(outputFile, content, "utf8");
  } catch (error) {
    throw new Error(
      'no se pudo escribir el archivo de destino "${outputFile}": ${error.message}',
    );
  }
}
// Escribir aqui la solución al enunciado.
console.log(HELP);
