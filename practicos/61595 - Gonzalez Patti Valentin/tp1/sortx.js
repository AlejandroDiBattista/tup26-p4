#!/usr/bin/env node
import fs from "node:fs";
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

//Declaracion de funciones
function parseArgs(args) {
  const config = {
    inputFile: null,
    outputFile: null,
    delimiter: ",",
    noHeader: false,
    sortFields: [],
  };

  if (args.includes("-h") || args.includes("--help")) {
    if (args.length !== 1) {
      throw new Error(
        "La opción de ayuda no puede combinarse con otros argumentos",
      );
    }
    console.info(HELP);
    process.exit(0);
  }

  if (args.length < 2) {
    throw new Error("Faltan ingresar argumentos de origen y destino");
  }

  config.inputFile = args[0];
  config.outputFile = args[1];

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-b" || arg === "--by") {
      const valor = args[++i];

      if (!valor || valor.startsWith("-")) {
        throw new Error("La opción -b necesita un valor");
      }

      const partes = valor.split(":");

      if (partes.length > 3) {
        throw new Error(`Criterio inválido: ${valor}`);
      }

      const nombre = partes[0];
      const tipo = partes[1] || "alpha";
      const orden = partes[2] || "asc";

      if (!nombre) {
        throw new Error("El campo de ordenamiento no puede estar vacío");
      }

      if (tipo !== "alpha" && tipo !== "num") {
        throw new Error(`Tipo de ordenamiento inválido: ${tipo}`);
      }

      if (orden !== "asc" && orden !== "desc") {
        throw new Error(`Orden de ordenamiento inválido: ${orden}`);
      }

      config.sortFields.push({ nombre, tipo, orden });
    } else if (arg === "-d" || arg === "--delimiter") {
      const valor = args[++i];

      if (valor === undefined) {
        throw new Error("La opcion --delimiter necesita un valor");
      }

      //Permite escribir "\t" desde la terminal
      config.delimiter = valor === "\\t" ? "\t" : valor;

      if ([...config.delimiter].length !== 1) {
        throw new Error("El delimitador debe ser un solo caracter");
      }
    } else if (arg === "-nh" || arg === "--no-header") {
      config.noHeader = true;
    } else {
      throw new Error(`Opción inválida: ${arg}`);
    }
  }

  if (config.sortFields.length === 0) {
    throw new Error("Debe especificarse al menos un criterio de orden");
  }

  process.exit(0);
}

function readInput(inputFile) {
  try {
    return fs.readFileSync(inputFile, "utf-8");
  } catch (error) {
    throw new Error(`Error al leer el archivo de entrada: ${error.message}`);
  }
}

function parseDelimited(text, delimiter) {
  const normalizarTexto = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n"); //normaliza los saltos de linea

  const limpiarTexto = normalizarTexto.replace(/\n+$/, ""); //elimina saltos de linea al final del texto

  if (limpiarTexto === "") {
    throw new Error("El archivo de entrada está vacío");
  }

  const lineas = limpiarTexto.split("\n");

  const filas = lineas.map((linea, index) => {
    if (linea.includes('"')) {
      throw new Error(
        `La fila ${index + 1} contiene comillas dobles, lo cual no esta permitido`,
      );
    }

    return linea.split(delimiter);
  });

  const columnasEsperadas = filas[0].length;

  for (let i = 1; i < filas.length; i++) {
    if (filas[i].length !== columnasEsperadas) {
      throw new Error(
        `La fila ${i + 1} tiene ${filas[i].length} campos, pero se esperaban ${columnasEsperadas}`,
      );
    }
  }

  return filas;
}

function sortRows(filas, config) {
  const datosFilas = config.noHeader ? filas : filas.slice(1);
  const header = config.noHeader ? null : filas[0];

  const indicesCampos = config.sortFields.map((campo) => {
    let index;

    if (config.noHeader) {
      if (!/^\d+$/.test(campo.nombre)) {
        throw new Error(
          `Sin encabezado, el campo "${campo.nombre}" debe ser un indice numerico`,
        );
      }

      index = Number(campo.nombre);
    } else {
      index = header.indexOf(campo.nombre);

      if (index === -1) {
        throw new Error(`El campo "${campo.nombre}" no existe`);
      }
    }

    if (index < 0 || index >= filas[0].length) {
      throw new Error(`El indice de columna "${campo.nombre}" no existe`);
    }

    return { ...campo, index };
  });

  for (const campo of campoIndexes) {
    if (!campo.numeric) continue;

    for (let i = 0; i < dataFilas.length; i++) {
      const value = dataFilas[i][campo.index].trim();

      if (value === "" || !Number.isFinite(Number(value))) {
        throw new Error(
          `El valor "${dataFilas[i][campo.index]}" de la columna "${campo.nombre}" no es numérico.`,
        );
      }
    }
  }

  dataFilas.sort((a, b) => {
    for (const campo of campoIndexes) {
      const valueA = a[campo.index];
      const valueB = b[campo.index];

      let comparacion;

      if (campo.numeric) {
        comparacion = Number(valueA) - Number(valueB);
      } else {
        comparacion = valueA.localeCompare(valueB, "es", {
          sensitivity: "base",
        });
      }

      if (comparacion !== 0) {
        return campo.descending ? -comparacion : comparacion;
      }
    }

    return 0;
  });

  return config.noHeader ? dataFilas : [header, ...dataFilas];
}
