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
//1-parseArgs:
function parseArgs(argumentos){
    //aqui voy a guardar todo lo que me mande el usuario
    const opciones={
        arcEntrada:null,
        arcSalida:null,
        ayuda:false,
        reglas:[]
    };
    
    const valores=[];
    //recorro todo lo que escribieron
    for(let i=0; i<argumentos.length;i++){
        const arg=argumentos[i];
        //verifico si pidio ayuda o no
        if(arg==="-h"||arg==="--help"){
            opciones.ayuda=true;
        }
        // si es para ordenar, uso la regla
        else if (arg==="-b"||arg==="--by") {
            //avazo para guardar el dato siguientee
            i++;
            const valor=argumentos[i];
            if (valor) {
                //desarmo el texto separado por los dos puntos
                const [nombre,tipo, orden]=valor.split(":");
                opciones.reglas.push({
                    nombre:nombre,
                    tipo:tipo === "num",
                    orden:orden ==="desc"
            }); 
            }
        //si no tiene guión, es porque es un archivo
        }else if(!arg.startsWith("-")){
            valores.push(arg);
        }
    }
    //el primero que pasen es el archivo a leer
        if(valores.length>0){
            opciones.arcEntrada=valores[0];
        }
        //si pasan otro, es el de salida
        if(valores.length>1){
            opciones.arcSalida=valores[1];
        }
        return opciones;
    
}
console.log(HELP)