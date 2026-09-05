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
function parseArgs(args){
    const config = {
    inputFile: null,
    outputFile: null,
    delimiter: ",",
    noHeader: false,
    sortFields: [ ]
    };
    for (let i =0; i < args.length; i++ ){
        const arg = args[i];
        if (arg==="-nh" || arg === "--no-header"){
        config.noHeader = true;
        }
        else if (arg === "-b" || arg ==="--by"){ i++;
            const expresion= args[i];
            const partes = expresion.split(':');

            const nombreCampo = partes[0];
            let esNumerico = false;
            let esDescendente = false;
            if (partes[1]=== "num") {
                esNumerico= true;
            }
            
            if (partes[2]=== "desc") {
                esDescendente= true;
            }
            const newCampo = {
                name: nombreCampo,
                numeric:esNumerico,
                descending:esDescendente
            };
            config.sortFields.push(newCampo);
        }
        else{

            if (config.inputFile === null) {
                config.inputFile = arg;
            } 
            else if (config.outputFile === null) {
                config.outputFile = arg;
        }
    }}
    return config
}

function main() {
    const argumentoUsuario = process.argv.slice(2);
    const resultadoConfig =parseArgs(argumentoUsuario);
    
    console.log("TEST DE CONFIGURACION");
    console.log(resultadoConfig);
}
main();

