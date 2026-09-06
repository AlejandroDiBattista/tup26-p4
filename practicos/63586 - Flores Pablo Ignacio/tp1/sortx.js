#!/usr/bin/env node

const fs = require('fs');

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


// Escribir aqui la solución al enunciado.</c>

function parseArgs(argv) {
  // argv es process.argv
  const origen = argv[2];
  const destino = argv[3];
  const flags = argv.slice(4);
  const valores = {
    delimiter: ",",
    noHeader: false,
    sortFields: []
  };

  if (argv.includes("-h") || argv.includes("--help")) {
    console.log(HELP);
    process.exit(0);
  }

  if (!origen || !destino) {
    console.error("Error: Debe especificar un archivo de origen y un archivo de destino.");
    process.exit(1);
  }

  
  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i];
    if (flag === "-b" || flag === "--by") {
      const criterio = flags[i + 1];
      if (!criterio) {
        console.error("Error: Falta el criterio de ordenamiento después de " + flag);
        process.exit(1);
      }

      
      const parts = criterio.split(":")
      const name = parts[0]
      const numeric = parts[1]
      const descending = parts[2]

      if (!name) {
        console.error("Error: El criterio de ordenamiento debe especificar un campo.");
        process.exit(1);
      }
      valores.sortFields.push({
        name: name,
        numeric: numeric === "num",
        descending: descending === "desc"
      });
      i++;
    } else if (flag === "-d" || flag === "--delimiter") {
      const delimiter = flags[i + 1];
      if (!delimiter) {
        console.error("Error: Falta el delimitador después de " + flag);
        process.exit(1);
      }
      valores.delimiter = delimiter;
      i++;
    }
    else if (flag === "-nh" || flag === "--no-header") {
      valores.noHeader = true;
    }
    else {
      console.error("Error: Opción desconocida " + flag);
      process.exit(1);
    }
  }

  if (valores.delimiter.length !== 1) {
    console.error("Error: El delimitador debe ser un solo carácter.");
    process.exit(1);
  }


  if (valores.sortFields.length === 0) {
    console.error("Error: Debe especificar al menos un criterio de ordenamiento con -b o --by.");
    process.exit(1);
  }


  return {
    inputFile: origen,
    outputFile: destino,
    delimiter: valores.delimiter,
    noHeader: valores.noHeader,
    sortFields: valores.sortFields
  };
}

// readInput es para leer el contenido del archivo de entrada
function readInput(inputFile) {
    try {
        return fs.readFileSync(inputFile, "utf8");
    } catch (error) {
        throw new Error(
            `No se puede leer el archivo de origen: ${inputFile}`
        );
    }
} 

// parseDelimited es para convertir el contenido del archivo en un array de arrays
function parseDelimited(text, delimiter) {
    if (text.includes('"')) {
        throw new Error("La entrada contiene comillas dobles.");
    }

    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    if (text.endsWith("\n")) {
        text = text.slice(0, -1);
    }

    if (text === "") {
        return [];
    }

    const lines = text.split("\n");
    const rows = lines.map(line => line.split(delimiter));
    const fieldCount = rows[0].length;

    for (let i = 0; i < rows.length; i++) {
        if (rows[i].length !== fieldCount) {
            throw new Error(
                `La fila ${i + 1} tiene una cantidad diferente de campos.`
            );
        }
    }

    return rows;
}

// sortRows es para ordenar las filas según los criterios especificados
function sortRows(rows, config) {
    if (rows.length === 0) {
        return rows;
    }

    let header = null;
    let dataRows = rows;

    if (!config.noHeader) {
        header = rows[0];
        dataRows = rows.slice(1);
    }

    const fields = config.sortFields.map(field => {
        let index;

        if (config.noHeader) {
            if (!/^\d+$/.test(field.name)) {
                throw new Error(
                    `El campo "${field.name}" debe ser un indice numerico cuando se usa --no-header.`
                );
            }
            index = Number(field.name);
        } else {
            index = header.indexOf(field.name);
            if (index === -1) {
                throw new Error(
                    `El campo solicitado no existe: ${field.name}`
                );
            }
        }

        if (index >= rows[0].length) {
            throw new Error(
                `El indice de columna no existe: ${field.name}`
            );
        }

        return {
            ...field,
            index: index
        };
    });

    dataRows.sort((a, b) => {
        for (const field of fields) {
            const valueA = a[field.index];
            const valueB = b[field.index];
            let comparison;

            if (field.numeric) {
                const numberA = Number(valueA);
                const numberB = Number(valueB);

                if (valueA.trim() === "" || !Number.isFinite(numberA)) {
                    throw new Error(
                        `El valor "${valueA}" no es numerico en el campo "${field.name}".`
                    );
                }

                if (valueB.trim() === "" || !Number.isFinite(numberB)) {
                    throw new Error(
                        `El valor "${valueB}" no es numerico en el campo "${field.name}".`
                    );
                }

                comparison = numberA - numberB;
            } else {
                comparison = valueA.localeCompare(valueB, "es", {
                    sensitivity: "base"
                });
            }

            if (comparison !== 0) {
                return field.descending ? -comparison : comparison;
            }
        }

        return 0;
    });

    if (header !== null) {
        return [header, ...dataRows];
    }

    return dataRows;
}

// serialize es para convertir el array de arrays en un string delimitado
function serialize(rows, delimiter) {
    return rows.map(row => row.join(delimiter)).join("\n");
}

// writeOutput es para escribir el contenido en el archivo de salida
function writeOutput(outputFile, text) {
    try {
        fs.writeFileSync(outputFile, text, "utf8");
    } catch (error) {
        throw new Error(
            `No se puede escribir el archivo de destino: ${outputFile}`
        );
    }
}

// código principal
try {
    const config = parseArgs(process.argv);
    const inputText = readInput(config.inputFile);
    const rows = parseDelimited(inputText, config.delimiter);
    const sortedRows = sortRows(rows, config);
    const outputText = serialize(sortedRows, config.delimiter);
    writeOutput(config.outputFile, outputText);
    console.log(`Archivo ordenado correctamente: ${config.outputFile}`);
} catch (error) {
    console.error("Error:", `${error.message}`);
    process.exit(1);
}


// console.log(HELP)