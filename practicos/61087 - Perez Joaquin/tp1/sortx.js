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


let argumento= process.argv.slice(2)

function parseArgs() {
    let sortfields = []
    if (argumento.includes('-h') || argumento.includes('--help')) {
        console.log(HELP);
        process.exit(0);
    }
    if (argumento.length < 2) {
        console.log("Error: falta el archivo de origen o destino.");
        process.exit(1);
    }


    for (let i = 0; i < argumento.length; i++) {
        let arg = argumento[i];
        //console.log(arg);
        switch (arg) {
            case '-b':
            case '--by':
            let criterio = argumento[i + 1]
            if (!criterio || criterio.startsWith('-')) {
                console.log("Error: Debe especificar un criterio de ordenamiento después de -b o --by.");
                process.exit(1);
            }
            console.log("Criterio:", criterio.split(':'));
            sortfields.push({ name: criterio.split(':')[0], numeric: criterio.split(':')[1] === 'num', descending: criterio.split(':')[2] === 'desc' });

            break;
        }
        
    }
    if (sortfields.length === 0) {
        console.log("Error: Debe especificar al menos un criterio de ordenamiento");
        process.exit(1);
    }
    console.log(sortfields);
    const configuracion = {
        inputFile: argumento[0],
        outputFile: argumento[1],
        delimiter: ',',
        noHeader: false,
        sortFields: sortfields
    }
    return configuracion;
}
const configuracion = parseArgs();
console.log(configuracion);
























