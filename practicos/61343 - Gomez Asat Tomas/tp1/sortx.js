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

// Escribir aqui la solución al enunciado.
console.log(HELP)

function error(mensaje) {
    console.error("Error:",mensaje);
    process.exit(1);
}
if (args.length === 0) {
    error("faltan los archivos de origen y destino.");
}
if (args[0] === "-h" || args[0] === "--help") {
    console.log(HELP);
    process.exit(0);
}
if (args.length < 2) {
    error("deben especificarse obligatoriamente el archivo de origen y el archivo de destino.");
}
const origen = args[0];
const destino = args[1];
console.log("origen:", origen);
console.log("destino:", destino);
const criterios = [];       
let delimiter = ",";
let noHeader = false;
for (let i = 2; i < args.length; i++) {
    const opcion = args[i];
    if (opcion === "-b" || opcion === "--by") {
        criterios.push(args[i + 1]);
        i++;
    } else if (opcion === "-d" || opcion === "--delimiter") {
        delimiter = args[i + 1];
        if (delimiter === "\\t") {
            delimiter = "\t";
        }
        i++;
    } else if (opcion === "-nh" || opcion === "--no-header") {
        noHeader = true;
    } else if (opcion === "-h" || opcion === "--help") {
        console.log(HELP);
        process.exit(0);
    } else {
        console.error("Error: opción desconocida:", opcion);
        process.exit(1);
    }
}
if (criterios.length === 0) {
    error("no se especificó ningún criterio --by.");
}
//primer commit  

let contenido;

try {
    contenido = fs.readFileSync(origen, "utf8");
} catch (e) {
    error(`no se puede leer el archivo de origen "${origen}".`);
}

if (contenido.includes('"')) {
    error("la entrada contiene comillas dobles, lo cual no está permitido.");
}

const lineas = contenido.split(/\r?\n/);

if (lineas.length > 0 && lineas[lineas.length - 1] === "") {
    lineas.pop();
}

if (lineas.length === 0) {
    error("el archivo de origen está vacío.");
}
const filas = lineas.map((linea, indice) => {
    const campos = linea.split(delimiter);

    if (indice === 0 && !noHeader) {
        return campos;
    }

    return campos;
});

const cantidadCampos = filas[0].length;

for (let i = 0; i < filas.length; i++) {
    if (filas[i].length !== cantidadCampos) {
        error(
            `la fila ${i + 1} tiene ${filas[i].length} campos y se esperaban ${cantidadCampos}.`
        );
    }
};
// segundo commit
function obtenerIndiceCampo(criterio) {
    // Permite indicar el campo por nombre o por número.
    if (/^\d+$/.test(criterio)) {
        const numero = Number(criterio);

        if (numero < 1 || numero > cantidadCampos) {
            error(`el campo solicitado "${criterio}" no existe.`);
        }

        return numero - 1;
    }

    if (!noHeader) {
        const indice = encabezado.indexOf(criterio);

        if (indice === -1) {
            error(`el campo solicitado "${criterio}" no existe.`);
        }

        return indice;
    }

    error(`el campo solicitado "${criterio}" no existe.`);
}
//tercer commit
const criteriosProcesados = criterios.map((criterio) => {
    let nombre = criterio;
    let tipo = "string";
    let orden = "asc";
const partes = criterio.split(":");
    nombre = partes[0];

    for (let i = 1; i < partes.length; i++) {
        const parte = partes[i].toLowerCase();

        if (parte === "numeric" || parte === "number" || parte === "num") {
            tipo = "numeric";
        } else if (parte === "asc" || parte === "desc") {
            orden = parte;
        } else {
            error(`criterio desconocido: "${parte}".`);
        }
    }

    return {
        indice: obtenerIndiceCampo(nombre),
        tipo,
        orden
    };
});
//cuarto commit 
function comparar(a, b) {
    for (const criterio of criteriosProcesados) {
        const valorA = a[criterio.indice];
        const valorB = b[criterio.indice];

        let resultado = 0;

        if (criterio.tipo === "numeric") {
            const numeroA = Number(valorA);
            const numeroB = Number(valorB);

            if (valorA.trim() === "" || !Number.isFinite(numeroA)) {
                error(
                    `el criterio numérico encontró un valor no numérico: "${valorA}".`
                );
            }
            if (valorB.trim() === "" || !Number.isFinite(numeroB)) {
                error(
                    `el criterio numérico encontró un valor no numérico: "${valorB}".`
                );
            }

            if (numeroA < numeroB) {
                resultado = -1;
            } else if (numeroA > numeroB) {
                resultado = 1;
            }
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

const salida = resultado.join("\n");

try {
    fs.writeFileSync(destino, salida, "utf8");
} catch (e) {
    error(`no se puede escribir el archivo de destino "${destino}".`);
}
//quinto commit