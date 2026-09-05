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
function parseArgs(inputConsole){

    //separo lo que necesito del argumento
    const inputText = inputConsole.slice(2)

    //normalizo quitando espacios y mayusculas
    const inputNormalizado = inputText.map(str => str.trim().toLowerCase())
    //set con opciones de ayuda, set para que la comparacion sea mas rapida y directa
    const opcionesAyuda = new Set (["--help", "-h"])

    //set con extensiones validas para comparar
    const extensionesValidas = new Set([".csv", ".psv", ".tsv"])

    //variables para guardar nombres de archivos
    let inputFile
    let outputFile

    //objeto con parametros de configuracion
    const config = {
        inputFile,
        outputFile,
        delimiter: ",",
        noHeader: false,
        sortFields: []
    };

    //funcion para parsear lo que venga despues de --by o -b
    function opcionBy(stringOpcionBy){
        const partes = stringOpcionBy.split(":")
    
        const campo = partes[0]
        const tipo = partes[1] || "text"
        const orden = partes[2] || "ascending"
    
        return {
            campo: campo,
            numeric: tipo === "num",
            descending: orden === "desc"
    
        }
    }

    //verifico que el argumento no venga vacio
    if (inputNormalizado.length === 0) {
        throw new Error("No se ingresó una opción. Usá --help para ver la sintaxis.");
    }
    
    //si solo es un argumento, debe ser la opcion para ver HELP si o si
    if(inputNormalizado.length === 1 && opcionesAyuda.has(inputNormalizado[0])){
        console.log(HELP)   
    }else if (inputNormalizado.length < 4) { //si el argumento trae menos de 4 opciones es porque esta incompleto
        throw new Error("Opción ingresada incompleta. Usá --help para ver la sintaxis.");
    }else {
        //del argumento separo los archivos
        const archivos = inputNormalizado.slice(0,2)

        //verifico la extension de los archivos
        archivos.filter(archivo => {
            const extension = archivo.slice(-4); 
            if (extensionesValidas.has(extension)) {
                if (inputNormalizado[0] === inputNormalizado[1]) {
                    throw new Error("El archivo origen y destino no pueden llevar mismo nombre.")
                }else{ //si estan bien las extension guardo en el objeto config
                    inputFile = inputNormalizado[0]
                    outputFile = inputNormalizado[1]
                    config.inputFile = inputFile
                    config.outputFile = outputFile
                }
            }else {
                throw new Error("Formato de archivo incorrecto. Usá --help para ver la sintaxis")
            }
        })

        //bucle para verificar las opciones
        for (let i = 2; i < inputNormalizado.length; i++) {
            if (inputNormalizado[i] === "--by" || inputNormalizado[i] === "-b") {
                const fields = opcionBy(inputNormalizado[i+1])
                config.sortFields.push(fields)
            }else if (inputNormalizado[i] === "--help" || inputNormalizado[i] === "-h") {
                config.noHeader = true
            }else if (inputNormalizado[i] === "--delimiter" || inputNormalizado[i] === "-d") {
                switch (inputNormalizado[i+1]) {
                    case '\\t':
                        config.delimiter = "\t"
                        break;
                    case '|':
                        config.delimiter = "|"
                        break;
                    case ';':
                        config.delimiter = ";"
                        break;
                    
                }
            }
        }
        return config
    }   
}

const arguementoParseado = parseArgs(process.argv)
console.log(arguementoParseado)
