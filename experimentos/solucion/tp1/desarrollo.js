import { readFileSync, writeFileSync } from "node:fs";

const HELP = `Uso: node sortx.js origen destino [opciones]

Opciones:
  -b, --by campo[:tipo[:orden]]  Criterio de ordenamiento; se puede repetir.
  -d, --delimiter delimitador    Delimitador; por defecto: ",".
  -nh, --no-header               El archivo no tiene encabezado.
  -h, --help                     Muestra esta ayuda.
`;

// Convierte un texto como "salario:num:desc" en un criterio de ordenamiento.
function parseSortField(value) {
  const parts = value.split(":");

  if (parts.length > 3) {
    throw new Error(`Criterio inválido: ${value}`);
  }

  const name = parts[0];
  const type = parts.length >= 2 ? parts[1] : "alpha";
  const order = parts.length === 3 ? parts[2] : "asc";

  if (name === "") {
    throw new Error("El campo de ordenamiento no puede estar vacío");
  }
  if (type !== "alpha" && type !== "num") {
    throw new Error(`Tipo inválido: ${type}`);
  }
  if (order !== "asc" && order !== "desc") {
    throw new Error(`Orden inválido: ${order}`);
  }

  return {
    name: name,
    numeric: type === "num",
    descending: order === "desc"
  };
}

// 1. Lee los argumentos y construye la configuración.
function parseArgs(args) {
  const config = {
    inputFile: null,
    outputFile: null,
    delimiter: ",",
    noHeader: false,
    sortFields: [],
    help: false
  };

  const files = [];
  let i = 0;

  while (i < args.length) {
    const argument = args[i];

    if (argument === "-h" || argument === "--help") {
      config.help = true;
      return config;
    }

    if (argument === "-nh" || argument === "--no-header") {
      config.noHeader = true;
    } else if (argument === "-b" || argument === "--by") {
      i = i + 1;
      if (i >= args.length) {
        throw new Error(`Falta el valor de ${argument}`);
      }
      config.sortFields.push(parseSortField(args[i]));
    } else if (argument === "-d" || argument === "--delimiter") {
      i = i + 1;
      if (i >= args.length) {
        throw new Error(`Falta el valor de ${argument}`);
      }

      let delimiter = args[i];
      if (delimiter === "\\t") {
        delimiter = "\t";
      }
      if (delimiter.length !== 1) {
        throw new Error("El delimitador debe ser un único carácter");
      }
      config.delimiter = delimiter;
    } else if (argument.startsWith("-")) {
      throw new Error(`Opción desconocida: ${argument}`);
    } else {
      files.push(argument);
    }

    i = i + 1;
  }

  if (files.length === 0) {
    throw new Error("Falta el archivo de origen");
  }
  if (files.length === 1) {
    throw new Error("Falta el archivo de destino");
  }
  if (files.length > 2) {
    throw new Error("Se esperan solamente los archivos de origen y destino");
  }
  if (config.sortFields.length === 0) {
    throw new Error("Debe indicarse al menos un criterio con -b o --by");
  }

  config.inputFile = files[0];
  config.outputFile = files[1];
  return config;
}

// 2. Lee el archivo de origen como texto UTF-8.
function readInput(inputFile) {
  try {
    return readFileSync(inputFile, "utf8");
  } catch (error) {
    throw new Error(`No se pudo leer ${inputFile}: ${error.message}`);
  }
}

// 3. Separa el texto en filas y cada fila en campos.
function parseDelimited(text, delimiter, noHeader) {
  if (text.includes('"')) {
    throw new Error("La entrada contiene comillas dobles, que no están admitidas");
  }

  const lines = text.split(/\r\n|\n|\r/);

  // split deja un elemento vacío cuando el archivo termina con un salto de línea.
  if (lines[lines.length - 1] === "") {
    lines.pop();
  }

  const records = [];
  for (const line of lines) {
    records.push(line.split(delimiter));
  }

  if (records.length === 0) {
    return {
      headers: noHeader ? null : [],
      rows: []
    };
  }

  const fieldCount = records[0].length;
  for (const record of records) {
    if (record.length !== fieldCount) {
      throw new Error("Las filas no tienen la misma cantidad de campos");
    }
  }

  if (noHeader) {
    return { headers: null, rows: records };
  }

  const headers = records[0];
  const rows = records.slice(1);
  return { headers: headers, rows: rows };
}

// 4. Ordena las filas aplicando los criterios en el orden indicado.
function sortRows(rows, headers, fields) {
  const preparedFields = [];
  const fieldCount = headers === null
    ? (rows.length === 0 ? 0 : rows[0].length)
    : headers.length;

  // Primero convierte cada nombre de campo en un índice de columna.
  for (const field of fields) {
    let index;

    if (headers === null) {
      index = Number(field.name);
    } else {
      index = headers.indexOf(field.name);
    }

    if (!Number.isInteger(index) || index < 0 || index >= fieldCount) {
      throw new Error(`Campo inexistente: ${field.name}`);
    }

    preparedFields.push({
      index: index,
      name: field.name,
      numeric: field.numeric,
      descending: field.descending
    });
  }

  // Valida los números antes de comenzar a ordenar.
  for (const field of preparedFields) {
    if (field.numeric) {
      for (const row of rows) {
        const value = row[field.index];
        if (value.trim() === "" || Number.isNaN(Number(value))) {
          throw new Error(`Valor no numérico en el campo ${field.name}: ${value}`);
        }
      }
    }
  }

  rows.sort(function (left, right) {
    for (const field of preparedFields) {
      const leftValue = left[field.index];
      const rightValue = right[field.index];
      let result;

      if (field.numeric) {
        result = Number(leftValue) - Number(rightValue);
      } else {
        result = leftValue.localeCompare(rightValue);
      }

      if (result !== 0) {
        return field.descending ? -result : result;
      }
    }

    return 0;
  });

  return rows;
}

// 5. Vuelve a convertir las filas en texto delimitado.
function serialize(headers, rows, delimiter) {
  const records = [];

  if (headers !== null && headers.length > 0) {
    records.push(headers);
  }
  for (const row of rows) {
    records.push(row);
  }

  let text = "";
  for (const record of records) {
    text = text + record.join(delimiter) + "\n";
  }
  return text;
}

// 6. Escribe el resultado en el archivo de destino.
function writeOutput(text, outputFile) {
  try {
    writeFileSync(outputFile, text, "utf8");
  } catch (error) {
    throw new Error(`No se pudo escribir ${outputFile}: ${error.message}`);
  }
}

// Punto de entrada: ejecuta las seis etapas y maneja los errores generales.
try {
  const config = parseArgs(process.argv.slice(2));

  if (config.help) {
    process.stdout.write(HELP);
  } else {
    const input = readInput(config.inputFile);
    const data = parseDelimited(input, config.delimiter, config.noHeader);
    const sortedRows = sortRows(data.rows, data.headers, config.sortFields);
    const output = serialize(data.headers, sortedRows, config.delimiter);
    writeOutput(output, config.outputFile);
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
