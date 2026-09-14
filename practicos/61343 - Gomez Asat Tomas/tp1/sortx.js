#!/usr/bin/env node
const fs = require("fs");
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
                        Usá "\\t" para archivos separados por tabulaciones.

    -nh, --no-header    Indica que el archivo no tiene encabezado.
                        Los campos se identifican mediante índices desde cero.

    -h, --help          Muestra esta ayuda.

EJEMPLOS:
    sortx empleados.csv ordenados.csv -b apellido
    sortx empleados.csv salarios.csv -b salario:num:desc
    sortx empleados.csv resultado.csv -b departamento -b salario:num:desc
    sortx datos.csv resultado.csv -nh -b 2:num:desc
    sortx datos.tsv salida.tsv -d "\\t" -b nombre
`;

const args = process.argv.slice(2);
function error(mensaje) {
    console.error("Error:", mensaje);
    process.exit(1);
}
if (args.includes("-h") || args.includes("--help")) {
    console.log(HELP);
    process.exit(0);
}
if (args.length < 2) {
    error("deben especificarse el archivo de origen y el archivo de destino.");
}
//primer commit-Agrega validaciones del archivo de origen  
const origen = args[0];
const destino = args[1];    
const criterios = [];
let delimiter = ",";
let noHeader = false;
for (let i = 2; i < args.length; i++) {
    const opcion = args[i];
    if (opcion === "-b" || opcion === "--by") {
        if (i + 1 >= args.length) {
            error(`la opción ${opcion} necesita un valor.`);
        }
        criterios.push(args[++i]);
    } else if (opcion === "-d" || opcion === "--delimiter") {
        if (i + 1 >= args.length) {
            error(`la opción ${opcion} necesita un valor.`);
        }
        delimiter = args[++i];
        if (delimiter === "\\t") {
            delimiter = "\t";
        }
        if (delimiter.length !== 1) {
            error("el delimitador debe tener exactamente un carácter.");
        }
    } else if (opcion === "-nh" || opcion === "--no-header") {
        noHeader = true;
    } else {
        error(`opción desconocida: ${opcion}`);
    }
}
if (criterios.length === 0) {
    error("no se especificó ningún criterio --by.");
}
//segundo commit-Agrega validación de argumentos y opciones
let contenido;
try {
    contenido = fs.readFileSync(origen, "utf8");
} catch (e) {
    error(`no se puede leer el archivo de origen "${origen}".`);
}
if (contenido.includes('"')) {
    error("la entrada contiene comillas dobles, lo cual no está permitido.");
}
contenido = contenido.replace(/\r\n/g, "\n");
const lineas = contenido.split("\n");
if (lineas[lineas.length - 1] === "") {
    lineas.pop();
}
if (lineas.length === 0) {
    error("el archivo de origen está vacío.");
}
const filas = lineas.map(linea => linea.split(delimiter));
const cantidadCampos = filas[0].length;
for (let i = 0; i < filas.length; i++) {
    if (filas[i].length !== cantidadCampos) {
        error(
            `la fila ${i + 1} tiene ${filas[i].length} campos y se esperaban ${cantidadCampos}.`
        );
    }
}
//tercer commit-Agrega validación de cantidad de campos
let encabezado = null;
let datos = filas;
if (!noHeader) {
    encabezado = filas[0];
    datos = filas.slice(1);
}
function obtenerIndiceCampo(campo) {
    if (noHeader) {
        if (!/^\d+$/.test(campo)) {
            error(`el campo solicitado "${campo}" no existe.`);
        }
        const indice = Number(campo);
        if (indice < 0 || indice >= cantidadCampos) {
            error(`el campo solicitado "${campo}" no existe.`);
        }
        return indice;
    }
    const indice = encabezado.indexOf(campo);
    if (indice === -1) {
        error(`el campo solicitado "${campo}" no existe.`);
    }
    return indice;
}
const criteriosProcesados = criterios.map(criterio => {
    const partes = criterio.split(":");

    if (partes.length > 3 || partes[0] === "") {
        error(`criterio inválido: "${criterio}".`);
    }
    const campo = partes[0];
    const tipo = partes[1] || "alpha";
    const orden = partes[2] || "asc";
    if (tipo !== "alpha" && tipo !== "num") {
        error(`tipo desconocido: "${tipo}".`);
    }
    if (orden !== "asc" && orden !== "desc") {
        error(`orden desconocido: "${orden}".`);
    }
    return {
        indice: obtenerIndiceCampo(campo),
        tipo,
        orden
    };
});
//cuarto commit-Agrega validación de criterios de ordenamiento
function comparar(a, b) {
    for (const criterio of criteriosProcesados) {
        const valorA = a[criterio.indice].trim();
        const valorB = b[criterio.indice].trim();

        let resultado = 0;

        if (criterio.tipo === "num") {
            if (valorA === "" || !Number.isFinite(Number(valorA))) {
                error(`el criterio numérico encontró un valor no numérico: "${valorA}".`);
            }

            if (valorB === "" || !Number.isFinite(Number(valorB))) {
                error(`el criterio numérico encontró un valor no numérico: "${valorB}".`);
            }

            const numeroA = Number(valorA);
            const numeroB = Number(valorB);
            if (numeroA < numeroB) resultado = -1;
            if (numeroA > numeroB) resultado = 1;
        } else {
            resultado = valorA.localeCompare(valorB, undefined, {
                numeric: true,
                sensitivity: "base"
            });
        }

        if (resultado !== 0) {
            return criterio.orden === "desc" ? -resultado : resultado;
        }
    }

    return 0;
}
datos.sort(comparar);

const resultado = [];

if (encabezado !== null) {
    resultado.push(encabezado.join(delimiter));
}

for (const fila of datos) {
    resultado.push(fila.join(delimiter));
}
try {
    fs.writeFileSync(destino, resultado.join("\n"), "utf8");
} catch (e) {
    error(`no se puede escribir el archivo de destino "${destino}".`);
}
//quinto commit-generación del archivo de salida