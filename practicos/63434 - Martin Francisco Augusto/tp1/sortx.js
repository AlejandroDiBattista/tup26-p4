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

function parseArgs(argv) {
    const opciones = {
        inputFile: null,
        outputFile: null,
        delimiter: ",",
        noHeader: false,
        sortFields: [],
    };
    const restantes = [];
    let i = 0;

    while (i < argv.length) {
        const arg = argv[i];

        if (arg === "-h" || arg === "--help") {
            console.log(HELP);
            process.exit(0);
        } else if (arg === "-nh" || arg === "--no-header") {
            opciones.noHeader = true;
            i = i + 1;
        } else if (arg === "-b" || arg === "--by") {
            if (i + 1 >= argv.length) {
                console.error("ERROR: falta el valor de -b/--by");
                process.exit(1);
            }

            const crudo = argv[i + 1];
            const partes = crudo.split(":");
            const name = partes[0];
            const tipo = partes[1] || "alpha";
            const orden = partes[2] || "asc";

            if (name === "" || partes.length > 3) {
                console.error("ERROR: criterio --by invalido: \"" + crudo + "\"");
                process.exit(1);
            }
            if (tipo !== "alpha" && tipo !== "num") {
                console.error("ERROR: tipo no valido: \"" + tipo + "\"");
                process.exit(1);
            }
            if (orden !== "asc" && orden !== "desc") {
                console.error("ERROR: orden no valido: \"" + orden + "\"");
                process.exit(1);
            }

            opciones.sortFields.push({
                name: name,
                numeric: tipo === "num",
                descending: orden === "desc",
            });
            i = i + 2;
        } else if (arg === "-d" || arg === "--delimiter") {
            if (i + 1 >= argv.length) {
                console.error("ERROR: falta el valor de -d/--delimiter");
                process.exit(1);
            }

            let delim = argv[i + 1];
            if (delim === "\\t") {
                delim = "\t";
            }
            if (delim.length !== 1) {
                console.error("ERROR: el delimitador tiene que ser un unico caracter");
                process.exit(1);
            }
            opciones.delimiter = delim;
            i = i + 2;
        } else if (arg.startsWith("-")) {
            console.error("ERROR: opcion desconocida: \"" + arg + "\"");
            process.exit(1);
        } else {
            restantes.push(arg);
            i = i + 1;
        }
    }

    if (restantes.length < 1) {
        console.error("ERROR: falta el archivo de origen");
        process.exit(1);
    }
    if (restantes.length < 2) {
        console.error("ERROR: falta el archivo de destino");
        process.exit(1);
    }
    if (opciones.sortFields.length === 0) {
        console.error("ERROR: indique al menos un criterio con --by");
        process.exit(1);
    }

    opciones.inputFile = restantes[0];
    opciones.outputFile = restantes[1];
    return opciones;
}

function main() {
    const opciones = parseArgs(process.argv.slice(2));
    console.log("parseArgs listo. Todavia no se lee el archivo \"" + opciones.inputFile + "\".");
}

main();
