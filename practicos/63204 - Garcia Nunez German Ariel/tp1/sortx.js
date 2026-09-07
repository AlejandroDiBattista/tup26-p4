#!/usr/bin/env node
import fs from 'node:fs';
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

//funciones a realizar:
//1. parseArgs      → leer los argumentos y construir la configuración
function parseArgs(args) {
//validamos que contenfa el help
if (args.includes('-h') || args.includes('--help')) {
    return {
        showHelp: true
    }
}
//validar que tenga el origen y destino
const origen = args[0]
const destino = args[1]

if (!origen || !destino) {
    throw new Error('faltan datos de origen y/o destino')
}
//validar que tenga el delimitador
let delimiter = ','
 
if (args.includes('-d') || args.includes('--delimiter')) {
    const index = args.indexOf('-d') !== -1 ? args.indexOf('-d') : args.indexOf('--delimiter')
    delimiter = args[index + 1]
    if(delimiter.length !== 1 && delimiter !== "\\t") {
        throw new Error('el delimitador debe ser un solo caracter')
    }
}
//corroborar el encabezado
const noencabezado = args.includes('-nh') || args.includes('--no-header')

// corroborar el criterio de ordenamiento
const criterios = [];
for (let i = 0; i < args.length; i++) {
    if (args[i] === '-b' || args[i] === '--by') {
        const criterio = args[i + 1];
        if(!criterio){
            throw new Error('la opcion --by requiere un argumento');
        }
        const partes = criterio.split(':');
        
        criterios.push({
            name: partes[0],
            numeric: partes[1] === 'num',
            descending: partes[2] === 'desc'
        });
    }
}

if (criterios.length === 0) {
    throw new Error('Se requiere al menos un criterio de ordenamiento');
}

return {
    inputFile: origen,
    outputFile: destino,
    delimiter: delimiter === "\\t" ? "\t" : delimiter,
    noHeader: noencabezado,
    sortFields: criterios 
};
}
//2. readInput      → leer el archivo de origen
function readInput(rutadelarchivo) {
    //leeremos el archivo con try catch para manejar errores
    try {
        const contenido = fs.readFileSync(rutadelarchivo, 'utf-8');
        return contenido;
    } catch (error) {
        throw new Error(`Error al leer el archivo: ${error.message}`);
    }
}
//3. parseDelimited → convertir el texto en filas y columnas
function parseDelimited(texto, delimiter) {
    const renglones = texto.split('\n');
    const datosparceados = [];
    for (let i = 0; i < renglones.length; i++) {
        const renglon = renglones[i].trim();
        if (renglon !== '') {
            const columnas = renglon.split(delimiter);
            datosparceados.push(columnas);
        }
    }
    return datosparceados;
}
// 4. sortRows -> ordenar las filas
function sortRows(filas, configuracion) {
    let encabezado = null;

    // A. Separar el encabezado si corresponde
    if (!configuracion.noHeader && filas.length > 0) {
        encabezado = filas.shift();
    }

    // B. Ordenar los datos
    filas.sort((a, b) => {
        for (let i = 0; i < configuracion.sortFields.length; i++) {
            const criterio = configuracion.sortFields[i];
            
            // Buscar la columna a comparar
            let indiceColumna = -1;
            if (!configuracion.noHeader && encabezado) {
                indiceColumna = encabezado.indexOf(criterio.name);
            } else {
                indiceColumna = parseInt(criterio.name, 10);
            }

            if (indiceColumna === -1) continue;

            const valorA = a[indiceColumna] || "";
            const valorB = b[indiceColumna] || "";

            // Comparar según el tipo (numérico o texto)
            let comparacion = 0;
            if (criterio.numeric) {
                comparacion = Number(valorA) - Number(valorB);
            } else {
                comparacion = valorA.localeCompare(valorB);
            }

            // Si hay diferencia, retornamos respetando si es ascendente o descendente
            if (comparacion !== 0) {
                return criterio.descending ? -comparacion : comparacion;
            }
        }
        return 0; // Si son iguales, mantiene el orden
    });

    // C. Volver a colocar el encabezado arriba de todo
    if (encabezado) {
        filas.unshift(encabezado);
    }

    return filas;
}
// 5. serialize -> reconstruir el texto delimitado
function serialize(datosParseados, delimitador) {
    const lineas = [];
    for (let i = 0; i < datosParseados.length; i++) {
        const filaComoTexto = datosParseados[i].join(delimitador);
        lineas.push(filaComoTexto);
    }
    return lineas.join('\n');
}
//6. writeOutput    → escribir el archivo de destino
function writeOutput(rutadelarchivo, contenido) {
    try {
        fs.writeFileSync(rutadelarchivo, contenido, 'utf-8');
    } catch (error) {
        throw new Error(`Error al escribir el archivo: ${error.message}`);
    }
}


try {
    // agarramos lo que el usuario escribió en la consola
    const argumentosDeConsola = process.argv.slice(2);
    const configuracion = parseArgs(argumentosDeConsola);

    if (configuracion.showHelp) {
        console.log(HELP);
        process.exit(0);
    }

    const textoCrudo = readInput(configuracion.inputFile);
    const datosDesarmados = parseDelimited(textoCrudo, configuracion.delimiter);
    const datosOrdenados = sortRows(datosDesarmados, configuracion);
    const textoFinal = serialize(datosOrdenados, configuracion.delimiter);
    
    writeOutput(configuracion.outputFile, textoFinal);

    console.log(`✅ ¡Éxito! Archivo ordenado y guardado en: ${configuracion.outputFile}`);

} catch (error) {
    console.error(error.message);
    process.exit(1);
}