#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

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

function parseArgs(datosDUsu) {
  if (datosDUsu.includes('--help') || datosDUsu.includes('-h')) {
    console.log(HELP);
    process.exit(0);
  }

  const posicion = [];
  const opciones = {
    inputFile: undefined,
    outputFile: undefined,
    delimiter: ',',
    noHeader: false,
    sortFields: [],
  };

  if (datosDUsu.length === 0) {
    throw new Error('Error: Faltan el archivo de origen o el archivo de destino.');
  }

  for (let i = 0; i < datosDUsu.length; i++) {
    const argumento = datosDUsu[i];

    if (argumento === '-d' || argumento === '--delimiter') {
      const valor = datosDUsu[i + 1];
      if (valor === undefined || valor.startsWith('-')) {
        throw new Error('Error: Falta ingresar el valor después de -d o --delimiter.');
      }
      const delimitador = valor === '\\t' ? '\t' : valor;
      if (delimitador.length !== 1) {
        throw new Error('Error: El delimitador debe ser un solo carácter.');
      }
      opciones.delimiter = delimitador;
      i += 1;
      continue;
    }

    if (argumento === '-nh' || argumento === '--no-header') {
      opciones.noHeader = true;
      continue;
    }

    if (argumento === '-b' || argumento === '--by') {
      const criterio = datosDUsu[i + 1];
      if (criterio === undefined || criterio.startsWith('-')) {
        throw new Error('Error: Falta ingresar el criterio después de -b o --by.');
      }

      const [name, tipo, orden] = criterio.split(':');
      if (!name || name.trim() === '') {
        throw new Error('Error: El criterio de ordenamiento no es válido.');
      }

      const sortField = {
        name,
        numeric: tipo === 'num',
        descending: orden === 'desc',
      };

      opciones.sortFields.push(sortField);
      i += 1;
      continue;
    }

    if (argumento.startsWith('-')) {
      throw new Error(`Error: Opción desconocida '${argumento}'. Use --help para ver las opciones válidas.`);
    }

    posicion.push(argumento);
  }

  if (posicion.length < 2) {
    throw new Error('Error: Faltan el archivo de origen o el archivo de destino.');
  }

  if (posicion.length > 2) {
    throw new Error('Error: Se recibieron demasiados argumentos posicionales.');
  }

  if (opciones.sortFields.length === 0) {
    throw new Error('Error: Debe especificar al menos un criterio de ordenamiento usando -b o --by.');
  }

  opciones.inputFile = posicion[0];
  opciones.outputFile = posicion[1];

  return opciones;
}

function readInput(inputFile) {
  try {
    return fs.readFileSync(inputFile, 'utf8');
  } catch {
    throw new Error(`Error: No se pudo leer el archivo de origen '${inputFile}'.`);
  }
}

function parseDelimited(texto, delimiter) {
  if (texto.includes('"')) {
    throw new Error('Error: La entrada contiene comillas dobles.');
  }

  const lineas = texto.split(/\r?\n/);
  if (lineas.length > 0 && lineas[lineas.length - 1] === '') {
    lineas.pop();
  }

  if (lineas.length === 0) {
    return [];
  }

  const filas = lineas.map((linea) => linea.split(delimiter));
  const longitudEsperada = filas[0].length;

  for (const fila of filas) {
    if (fila.length !== longitudEsperada) {
      throw new Error('Error: Las filas tienen diferente cantidad de campos.');
    }
  }

  return filas;
}

function obtenerValorDeCampo(fila, nombreCampo, headers) {
  if (headers !== null) {
    const indice = getFieldIndexByName(headers, nombreCampo);
    return fila[indice];
  }

  const indice = Number(nombreCampo);
  if (!Number.isInteger(indice) || indice < 0 || indice >= fila.length) {
    throw new Error(`Error: El campo solicitado no existe: ${nombreCampo}`);
  }

  return fila[indice];
}

function normalizarValor(valor, numeric) {
  const texto = String(valor ?? '');

  if (!numeric) {
    return texto;
  }

  const numero = Number(texto);
  if (!Number.isFinite(numero)) {
    throw new Error(`Error: Un criterio numérico encontró un valor no numérico: ${texto}`);
  }

  return numero;
}

function sortRows(rows, config) {
  if (rows.length === 0) {
    return config.noHeader ? [] : [];
  }

  const headers = config.noHeader ? null : rows[0];
  const datos = config.noHeader ? rows : rows.slice(1);

  const ordenado = [...datos].sort((filaA, filaB) => {
    for (const criterio of config.sortFields) {
      const valorA = obtenerValorDeCampo(filaA, criterio.name, headers);
      const valorB = obtenerValorDeCampo(filaB, criterio.name, headers);

      const aNormalizado = normalizarValor(valorA, criterio.numeric);
      const bNormalizado = normalizarValor(valorB, criterio.numeric);

      let comparacion;
      if (criterio.numeric) {
        comparacion = Number(aNormalizado) - Number(bNormalizado);
      } else {
        comparacion = String(aNormalizado).localeCompare(String(bNormalizado), 'es', {
          sensitivity: 'base',
        });
      }

      if (criterio.descending) {
        comparacion *= -1;
      }

      if (comparacion !== 0) {
        return comparacion;
      }
    }

    return 0;
  });

  if (config.noHeader) {
    return ordenado;
  }

  return [headers, ...ordenado];
}

function getFieldIndexByName(headers, fieldName) {
  const index = headers.indexOf(fieldName);
  if (index === -1) {
    throw new Error(`Error: El campo solicitado no existe: ${fieldName}`);
  }
  return index;
}

function serialize(rows, delimiter) {
  return rows
    .map((fila) => fila.map((valor) => String(valor)).join(delimiter))
    .join('\n');
}

function writeOutput(outputFile, contenido) {
  const directorio = path.dirname(outputFile);
  if (directorio && directorio !== '.') {
    fs.mkdirSync(directorio, { recursive: true });
  }

  try {
    fs.writeFileSync(outputFile, contenido, 'utf8');
  } catch {
    throw new Error(`Error: No se pudo escribir el archivo de destino '${outputFile}'.`);
  }
}

function main() {
  const argumentos = process.argv.slice(2);

  if (argumentos.includes('--help') || argumentos.includes('-h')) {
    console.log(HELP);
    return 0;
  }

  try {
    const config = parseArgs(argumentos);
    const texto = readInput(config.inputFile);
    const filas = parseDelimited(texto, config.delimiter);
    const filasOrdenadas = sortRows(filas, config);
    const salida = serialize(filasOrdenadas, config.delimiter);
    writeOutput(config.outputFile, salida);
    return 0;
  } catch (error) {
    console.error(error.message);
    return 1;
  }
}

process.exitCode = main();