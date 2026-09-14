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
import fs from "fs";

// Escribir aqui la solución al enunciado.
    function parseArgs(lista){
        if (lista[2] === "-h" || lista[2] === "--help") {
            console.log(HELP);
            process.exit(0);
        }

        if (!lista[2] || !lista[3] ) {
            console.error("Es necesario ingresar origen o destino");
            process.exit(1);
        } 

        let origen = lista[2];
        let salida = lista[3];

        let objeto = {
        inputFile: origen,
        outputFile: salida,
        delimiter: ",",
        noHeader: false,
        sortFields: []
        }

    for (let i = 4; i < lista.length; i++) {

        if (lista[i] === "-b" || lista[i] === "--by") {

            if (!lista[i + 1]) {
                console.error("La opcion -b necesita un criterio");
                process.exit(1);
            }

            let criterio = lista[i + 1];
            let partes = criterio.split(":"); 

            let campo = partes[0];
            let numerico = partes[1] === "num";
            let descendente = partes[2] === "desc";

            objeto.sortFields.push({
            name: campo,
            numeric: numerico,
            descending: descendente
            });
        }

        if (lista[i] === "-nh" || lista[i] === "--no-header") {
            objeto.noHeader = true;
        }


        if (lista[i] === "-d" || lista[i] === "--delimiter") {
            if (!lista[i + 1]) {
                console.error("La opcion -d necesita un delimitador");
                process.exit(1);
            }
            let delimitador = lista[i + 1];
            objeto.delimiter = delimitador;
        }

        if (lista[i].startsWith("-")) {
            if(
                lista[i] !== "-b" &&
                lista[i] !== "--by" &&
                lista[i] !== "-d" &&
                lista[i] !== "--delimiter" &&
                lista[i] !== "-nh" && 
                lista[i] !== "--no-header"
            )
                
            {
                console.error("Opción desconocida: " + lista[i]);
                process.exit(1);
            }
        }
        
    }

        if (objeto.sortFields.length === 0 ) {
            console.error("tiene que indicar al menos un criterio con -b o --by.");
            process.exit(1);
        }

        if (objeto.delimiter.length !==1) {
            console.error("El delimitador tiene que ser un único caracter.");
            process.exit(1);
        }

    return objeto;

}
function readInput(configuracion){
    return fs.readFileSync(configuracion.inputFile, "utf8");
}

function parseDelimited(texto, delimitador){
    if (texto.includes('"')){
        throw new Error("La entrada no puede contener comillas dobles.")
    } 

    let filas = texto.trim().split(/\r?\n/);

    let resultado = filas.map(fila => fila.split(delimitador));

    let cantidadCampos = resultado[0].length;

    for(let i = 1; i < resultado.length; i++){
        if (resultado[i].length !== cantidadCampos) {
            throw new Error ("Las filas tienen dif. cantidad de campos.");
        }
    }

    return resultado;
}
function sortRows(filas, configuracion){
    // separamos el encabezado de los datos 
    let encabezado = configuracion.noHeader ? null : filas[0];
    let datos = configuracion.noHeader ? filas : filas.slice(1);

    datos.sort((a,b) => {

    for(let criterio of configuracion.sortFields){
        let indice;
    if (configuracion.noHeader) {
        indice = Number(criterio.name);
    } else{
        indice =encabezado.indexOf(criterio.name);
    }

    if (
        !Number.isInteger(indice) ||
        indice < 0 || 
        indice >= a.length
    ){
        throw new Error("El campo solicitado no existe")
    }

    let valorA=a[indice];
    let valorB=b[indice];

    if(criterio.numeric){
        valorA = Number(valorA);
        valorB = Number(valorB);

        if(Number.isNaN(valorA) || Number.isNaN(valorB)){
            throw new Error("El criterio numerico tiene un valor no numerico");
        }
    }

    let comparacion;
    if (criterio.numeric) {
        comparacion = valorA - valorB;
    }else{
        comparacion =valorA.localeCompare(valorB)
    }

    if (criterio.descending) {
        comparacion = -comparacion;
    }

    //si son diferentes, este criterio decide el orden
    if (comparacion !== 0) {
        return comparacion;
    }
    }
    return 0;

    });

    if (!configuracion.noHeader) {
        datos.unshift(encabezado)
    }
    return datos;
}
function serialize(filas, delimitador){
    let lineas = filas.map(fila =>fila.join(delimitador));
    //unir las filas usando saltos de linea
    return lineas.join("\n");
}

function writeOutput(texto,archivo){
    fs.writeFileSync(archivo, texto, "utf-8");
}
try{
    let valor = parseArgs(process.argv);
    let texto = readInput(valor)
    let filas = parseDelimited(texto, valor.delimiter);
    let ordenadas = sortRows(filas, valor);
    let textFinal = serialize(ordenadas, valor.delimiter);
    writeOutput(textFinal, valor.outputFile);
}  catch(error) {
    console.error(error.message);
    process.exit(1)
}
