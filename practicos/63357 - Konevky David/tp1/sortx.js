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
`
function isOption(regular,shorthand, value) {
    return value === `--${regular}` || value === `-${shorthand}`;
}
const isHelp = (value) => isOption("help", "h", value);
const isBy = (value) => isOption("by", "b", value);
const isDelimiter = (value) => isOption("delimiter", "d", value);
const isNoHeader = (value) => isOption("no-header", "nh", value);

function help() {
  console.log(HELP);
  process.exit(0);
}

function logError(message) {
  console.error(message);
  process.exit(1);
}

function getNextValue(i, opciones, flag) {
  if (i + 1 >= opciones.length) logError(`${flag} requiere un valor`);
  return opciones[i + 1];
}

function handleByCriterios(opcion) {
    const [name, tipo = "alpha", orden = "asc"] = opcion.split(":");
    if (!["alpha", "num"].includes(tipo)) {
        logError(`Tipo inválido: ${tipo}`);
    }
    if (!["asc", "desc"].includes(orden)) {
        logError(`Orden inválido: ${orden}`);
    }
    return {
        name,
        numeric: tipo === "num",
        descending: orden === "desc"
    };
}

function parseOpciones(opciones) {
    const config = {
        sortFields: [],
        delimiter: ',',
        noHeader: false
    };

    for (let i = 0; i < opciones.length; i++) {
        const opcion = opciones[i];

        if (isDelimiter(opcion)) {
            config.delimiter = getNextValue(i, opciones, opcion);
            i++;
        } else if (isNoHeader(opcion)) {
            config.noHeader = true;
        } else if (isBy(opcion)) {
            config.sortFields.push(handleByCriterios(getNextValue(i, opciones, opcion)));
            i++;
        } else {
            logError(`Opción inválida: ${opcion}`);
        }
    }

    if (config.sortFields.length === 0) {
        logError(`Se requiere al menos un criterio -b o --by`);
    }

    return config;
}

function parseArgs() {
    const args = process.argv.slice(2);

    if (isHelp(args[0])) return help();

    const [inputFile, outputFile, ...opciones] = args;
    const config = parseOpciones(opciones);

    return { inputFile, outputFile, ...config };
}

console.log(parseArgs());