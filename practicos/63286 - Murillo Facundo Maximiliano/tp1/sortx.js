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

// sortx origen destino [-b|--by campo[:tipo[:orden]]]... aqui iria el campo por ejemplo -b apellido
//    [-d|--delimiter delimitador]                        aqui el delimitador que vendria a ser la coma" , "
//    [-nh|--no-header]                                   aqui te muestra todos los datos sin encabezado , sirve para buscar directamente 
//     [-h|--help]

function parseArgs(){
        if(process.argv[2] === "-h" || process.argv[2] === "--help"){

                    return HELP
        }

        if (process.argv[2] === undefined || process.argv[3] === undefined) {

            process.exitCode = 1            
          return ("Los argumentos de origen y destino son obligatorios")
    
        }

        let configuracion = 
        {
            // los process,argv 0 : node y 1 : sortx.js entonces =>
            inputFile: process.argv[2], // el origen que pasamos es el process 2
            outputFile: process.argv[3], // la salida que pasamos es el process 3 
            delimiter: ",",             // cortamos con la ,
            noHeader: false,        
            sortFields: []
        }
        let i = 4
        while( i < process.argv.length){

            // console.log("i:", i, "valor:", process.argv[i])

            if(process.argv[i] === "-b" || process.argv[i] === "--by"){
                
                let opcionB = process.argv[i+1]
                if (opcionB === undefined) {
                    process.exitCode = 1
                    return "Falta el criterio de la opción -b"
                }
                

                let partes = opcionB.split(":")
                if(partes.length > 3 ){
                    
                    process.exitCode = 1
                    return "Condicion no puede ser mayor a 3"
                    
                }

                if(partes[0] === ""){
                    process.exitCode = 1
                    return "Nombre no puede estar vacio"
                }
                if(partes[1] !== "num" && partes[1] !== "alpha" && partes[1] !== undefined){

                    process.exitCode = 1
                    return "Condicion incorrecta"
                }

                if(partes[2] !== "desc" && partes[2] !== 'asc' && partes[2] !== undefined){
                     process.exitCode = 1
                    return "Condicion incorrecta"
                }
                console.log(partes)

                configuracion.sortFields.push(
                    { 
                    name: partes[0],
                    numeric : partes[1] === "num",
                    descending: partes[2] === "desc"
                    }
                )
                console.log(configuracion)
                i++
            }

            else if (process.argv[i] === "-d" || process.argv[i] === "--delimiter"){
                
                let opcionDelimiter = process.argv[i+1]

                 if (opcionDelimiter === undefined) {
                    process.exitCode = 1
                    return "Falta el delimitador de la opción -d"

                } else if(opcionDelimiter.length !== 1 && opcionDelimiter == "\t"){
    
                    process.exitCode = 1
                    return "Delimitador incorrecto"
                }

                console.log(opcionDelimiter)

                if (opcionDelimiter === "\\t") {
                    opcionDelimiter = "\t"
                }
                configuracion.delimiter = opcionDelimiter
                i++
            }

            else if(process.argv[i] === "-nh" || process.argv[i] === "--no-header"){

                configuracion.noHeader = true
            }

            else{

                process.exitCode = 1
                return ("La opcion es incorrecta" + process.argv[i])
    
            }

            i++ 
            // console.log(i)

        }

    if(configuracion.sortFields.length === 0){
        process.exitCode = 1
        return("Array vacio")
    }
    return configuracion
        
}

console.log(parseArgs())