#!/usr/bin/env node
import fs from "fs"

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

// Escribir aqui la solución al enunciado.
const argumentos = process.argv.slice(2)

if (
    argumentos.length === 0 ||
    argumentos.includes("-h") ||
    argumentos.includes("--help")
) {
    console.log(HELP);
    process.exit(0);
}

let origen = null;
let destino = null;
let delimitador = ",";
let tieneHeader = true;
let criterios = [];

for (let i = 0; i < argumentos.length; i++) {

    const arg = argumentos[i];
    if (arg === "-b" || arg === "--by") {
        const criterio = argumentos[i + 1];

        if (!criterio) {
            console.log("Error: falta el criterio después de -b.");
            process.exit(1);
        }
        criterios.push(criterio);
        i++;
    }

    else if (
        arg === "-d" ||
        arg === "--delimiter"
    ) {
        delimitador = argumentos[i + 1];

        if (!delimitador) {
            console.log(
                "Error: falta el delimitador."
            );
            process.exit(1);
        }

        if (delimitador === "\\t") {
            delimitador = "\t";
        }
        i++;
    }
    else if (
        arg === "-nh" ||
        arg === "--no-header"
    ) {
        tieneHeader = false;
    }
    else if (origen === null) {

        origen = arg;

    }
    else if (destino === null) {
        destino = arg;
    }
}


if (!origen) {
    console.log(
        "Error: falta el archivo de origen."
    );
    process.exit(1);
}

if (!destino) {
    console.log(
        "Error: falta el archivo de destino."
    );
    process.exit(1);
}
if (criterios.length === 0) {
    console.log(
        "Error: debés indicar al menos un criterio con -b."
    );
    process.exit(1);
}
let contenido;
try {
    contenido = fs.readFileSync(
        origen,
        "utf8"
    );
} catch (error) {
    console.log(
        "Error: no se pudo leer el archivo de origen."
    );
    process.exit(1);
}

const lineas = contenido
    .trim()
    .split(/\r?\n/);

const filas = lineas.map((linea) => {
    return linea.split(delimitador);
});

let header = [];
let datos = [];

if (tieneHeader) {
    header = filas[0];
    datos = filas.slice(1);
} else {
    datos = filas;
}

const criteriosProcesados = criterios.map(
    (criterio) => {
        const partes = criterio.split(":");
        const campo = partes[0];
        const tipo = partes[1] || "alpha";
        const orden = partes[2] || "asc";
        if (
            tipo !== "alpha" &&
            tipo !== "num"
        ) {
            console.log(
                "Error: tipo inválido."
            );
            process.exit(1);
        }
        if (
            orden !== "asc" &&
            orden !== "desc"
        ) {
            console.log(
                "Error: orden inválido."
            );
            process.exit(1);
        }
let indice;
        if (tieneHeader) {
            indice = header.indexOf(campo);
            if (indice === -1) {
                console.log(
                    `Error: no existe la columna "${campo}".`
                );
                process.exit(1);
            }
        }
        else {
            indice = Number(campo);
            if (
                !Number.isInteger(indice) ||
                indice < 0
            ) {
                console.log(
                    "Error: el índice del campo no es válido."
                );
                process.exit(1);
            }
        }
        return {
            indice: indice,
            tipo: tipo,
            orden: orden
        };
    }
);
datos.sort((a, b) => {
    for (
        const criterio
        of criteriosProcesados
    ) {
        const valorA =
            a[criterio.indice];
        const valorB =
            b[criterio.indice];
        let resultado;
        if (criterio.tipo === "num") {
            resultado =
                Number(valorA) -
                Number(valorB);
        }
        else {

            resultado =
                String(valorA)
                    .localeCompare(
                        String(valorB)
                    );
        }
        if (resultado !== 0) {
            if (
                criterio.orden === "desc"
            ) {
                return -resultado;
            }
            return resultado;
        }
    }
    return 0;
});

let resultadoFinal;

if (tieneHeader) {
    resultadoFinal = [
        header,
        ...datos
    ];
} else {
    resultadoFinal = datos;
}

const salida = resultadoFinal
    .map((fila) => {

        return fila.join(
            delimitador
        );

    })
    .join("\n");
try {
    fs.writeFileSync(

        destino,

        salida,

        "utf8"

    );
    console.log(
        "Archivo ordenado correctamente."
    );

} catch (error) {
    console.log(
        "Error: no se pudo guardar el archivo."
    );
    process.exit(1);
}

console.log(HELP)