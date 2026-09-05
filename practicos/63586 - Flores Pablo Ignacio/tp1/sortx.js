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

  // validaciones de argumentos

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

function readInput(inputFile) {
    try {
        return fs.readFileSync(inputFile, "utf8");
    } catch (error) {
        throw new Error(
            `No se puede leer el archivo de origen: ${inputFile}`
        );
    }
} 


console.log(parseArgs(process.argv));


// console.log(HELP)