#!/usr/bin/env node
import console from "node:console"
import { readFile, writeFile } from "node:fs/promises"

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

    //normalizo quitando espacios
    const inputNormalizado = inputText.map(str => str.trim())
    //set con opciones de ayuda, set para que la comparacion sea mas rapida y directa
    const opcionesAyuda = new Set (["--help", "-h"])
   
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

    //funcion para parsear y controlar lo que venga despues de --by o -b
    function opcionBy(stringOpcionBy) {
        //si la cadena llega vacía o indefinida, tiro error
        if (!stringOpcionBy) {
            throw new Error("Falta el valor para la opción --by.");
        }

        const partes = stringOpcionBy.split(":");
        
        const campo = partes[0].trim();
        
        //verifico si el campo esta vacio
        if (!campo) {
            throw new Error("Falta especificar el campo por el cual ordenar.");
        }

        //si no viene las otras opciones asigno por defecto
        const tipo = partes[1] || "alpha";
        const orden = partes[2] || "asc";

        return {
            name: campo,
            numeric: tipo === "num",
            descending: orden === "desc"
        };
    }

    //verifico que el argumento no venga vacio
    if (inputNormalizado.length === 0) {
        throw new Error("No se ingresó una opción. Usá --help para ver la sintaxis.");
    }
    
    //si solo es un argumento, debe ser la opcion para ver HELP si o si
    if(inputNormalizado.length === 1){
        if (opcionesAyuda.has(inputNormalizado[0].toLowerCase())) {
            console.log(HELP)   
            process.exit(0)
        }else{
            throw new Error("Opción ingresada incorrecta. Usá --help para ver la sintaxis.");
        }
    }else if (inputNormalizado.length < 4) { //si el argumento trae menos de 4 opciones es porque esta incompleto
        throw new Error("Opción ingresada incorrecta. Usá --help para ver la sintaxis.");
    }else {
        //guardo las 2 primeras posiciones
        const origen = inputNormalizado[0];
        const destino = inputNormalizado[1];

        //verifico que no falten y que no sean opciones
        if (!origen || origen.startsWith('-') || !destino || destino.startsWith('-')) {
            throw new Error("Falta el archivo de origen o destino. Usá --help para ver la sintaxis.");
        }

        //verifico que no sean el mismo archivo
        if (origen === destino) {
            throw new Error("El archivo origen y destino no pueden llevar el mismo nombre.");
        }

        config.inputFile = origen;
        config.outputFile = destino;

    
        //bucle para verificar las opciones
        for (let i = 2; i < inputNormalizado.length; i++) {
            if (inputNormalizado[i] === "--by" || inputNormalizado[i] === "-b") {
                if (!inputNormalizado[i+1] || inputNormalizado[i+1].startsWith("-")) {
                    throw new Error("Falta un campo para la opcion --by. Usá --help para ver la sintaxis")
                }
                const fields = opcionBy(inputNormalizado[i+1])
                config.sortFields.push(fields)
                i++
            }else if (inputNormalizado[i] === "--no-header" || inputNormalizado[i] === "-nh") {
                config.noHeader = true
            }else if (inputNormalizado[i] === "--delimiter" || inputNormalizado[i] === "-d") {
                const proximoValor = inputNormalizado[i + 1];

                //verifico que no este vacio y o que no sea otra opcion
                if (!proximoValor || proximoValor.startsWith('-')) {
                    throw new Error("La opción --delimiter no recibió un valor.");
                }

                //transformo la tabulacion "\\t"
                let delimitadorFinal = proximoValor;
                if (delimitadorFinal === '\\t') {
                    delimitadorFinal = '\t';
                }

                //verifico que mide 1
                if (delimitadorFinal.length !== 1) {
                    throw new Error("El delimitador debe ser un único carácter.");
                }
                
                config.delimiter = delimitadorFinal;
                
                i++
            }else{
                throw new Error(`Opción desconocida: ${inputNormalizado[i]}. Usá --help para ver la sintaxis.`)
            }


        }
        //si el array de sortFields sigue vacío, es porque no pasaron ningún -b
        if (config.sortFields.length === 0) {
            throw new Error("No se ingresó ningun criterio de ordenamiento. Usá --help para ver la sintaxis");
        }        

        return config
    }   
}

async function readInput(objConfiguracion){
    try {
            const contenido = await readFile(objConfiguracion.inputFile, "utf8");
            return contenido;
        } catch (error) {
            if (error.code === "ENOENT") {
                throw new Error("El archivo no existe en la ruta.");
            }else {
                throw error;
            }
        }
}

function parseDelimited(texto, configuracion) {

    if (texto.includes('"')) {
        throw new Error("La entrada tiene comillas dobles.");
    }

    //separo filas
    const filas = texto.split(/\r?\n/u);
    //filtro por filas que no esten vacias
    const tabla = filas.filter(fila => fila.length > 0);
    //separo por delimitador
    const tablaNormalizada = tabla.map(fila => fila.split(configuracion.delimiter));


    //por si viene vacio, para que no se rompa el programa
    if (tablaNormalizada.length === 0) {
        throw new Error("El archivo de entrada está vacío.")
    }

    //guardo la cantidad esperada de campos segun la primera fila
    const columnasEsperadas = tablaNormalizada[0].length;

    //recorro todas las filas comprobando su longitud
    for (let i = 0; i < tablaNormalizada.length; i++) {
        if (tablaNormalizada[i].length !== columnasEsperadas) {
            throw new Error("Las filas tienen diferente cantidad de campos.");
        }
    }

    return tablaNormalizada;
}

function sortRows(tabla, configuracion) {
    //aca guardare (si es que hay) el encabezado
    let encabezado = [];
    let datos = tabla;

    //separo el encabezado si corresponde
    if (!configuracion.noHeader) {
        encabezado = tabla[0];
        datos = tabla.slice(1); //guardo desde la segunda fila en adelante
    }

    //cambio los nombres de los campos a nros de columna (indices)
    const criteriosConIndices = configuracion.sortFields.map(campo => {
        let indice;
        
        if (configuracion.noHeader) {
            //si no hay encabezado, intento convertir el nro de indice a tipo numero (viene como string)
            indice = parseInt(campo.name, 10);
            //prevencion de errores: no es un nro, es menor que 0 o no existe el indice
            if (isNaN(indice) || indice < 0 || indice >= tabla[0].length) {
                throw new Error(`El campo solicitado no existe: ${campo.name}`);
            }
        } else {
            //si hay encabezado, busco en que posicion esta esa palabra
            indice = encabezado.indexOf(campo.name);
            if (indice === -1) {
                throw new Error(`El campo solicitado no existe: ${campo.name}`);
            }
        }
        
        //retorno el mismo campo pero sumándole la propiedad 'index' para luego usarlo
        return { ...campo, index: indice };
    });

    //verifico que los campos numericos tengan números posta
    for (let i = 0; i < datos.length; i++) {
        for (const criterio of criteriosConIndices) {
            if (criterio.numeric) { //busco los que supuestamente deben ser numeros
                //tomo el valor
                const valor = datos[i][criterio.index];
                //verifico si es numero o si no es vacio, ya que vacio daria 0 y lo tomaria ok
                if (isNaN(Number(valor)) || valor.trim() === "") {
                    throw new Error(`Se encontró un valor no numérico en un campo numérico: "${valor}"`);
                }
            }
        }
    }

    //comienzo a ordernar, sort() recibe 2 args y deberia devolver numero
    datos.sort((filaA, filaB) => {
        //uso for por si se uso mas de un -b, recorro ordenadamente
        for (const criterio of criteriosConIndices) {
            //le doy valor a lo que se ira comparando con sort()
            const valorA = filaA[criterio.index];
            const valorB = filaB[criterio.index];

            //variable para luego almacenar el resultado de las restas de sort()
            let resultado = 0;

            //si el criterio es numerico hago una resta normal
            if (criterio.numeric) {
                resultado = Number(valorA) - Number(valorB);
            } else {
                //si es texto, hago comparacion alfabetica
                resultado = valorA.localeCompare(valorB);
            }

            //si el resultado no es 0, es decir hay uno mayor que otro, verifico si pidio desc o asc
            if (resultado !== 0) {
                //si pidio desc multiplico el resultado por -1 para invertirlo
                return criterio.descending ? resultado * -1 : resultado;
            }
            //si hay empate (resultado es 0), el bucle for sigue al proximo criterio
        }
        return 0; //si empata todo
    });

    //vuelvo a armar la tabla de datos
    if (!configuracion.noHeader) {
        return [encabezado, ...datos]; //el encabezado arriba de los datos si es que hay
    }
    
    return datos;
}

function serialize(tabla, configuracion) {
    //uno las filas por el delmitador
    const filasTexto = tabla.map(fila => fila.join(configuracion.delimiter));
    
    //uno todas las filas con un salto de linea
    return filasTexto.join('\n');
}

async function writeOutput(texto, configuracion) {
    try {
        //creo el archivo destino, si hay uno lo piso
        await writeFile(configuracion.outputFile, texto, "utf8");
        console.log(`Archivo guardado en: ${configuracion.outputFile} existosamente.`);
    } catch (error) {
        throw new Error("El archivo de destino no puede escribirse.")
    }
}

async function main(){
    try {
        const configuracionObj = parseArgs(process.argv)
        const lector = await readInput(configuracionObj)
        const textoSeparado = parseDelimited(lector, configuracionObj)
        const textoOrdenado = sortRows(textoSeparado, configuracionObj)
        const textoFinal = serialize(textoOrdenado, configuracionObj)
        
        await writeOutput(textoFinal, configuracionObj) 
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

main()
