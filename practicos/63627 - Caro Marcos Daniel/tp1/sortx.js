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
//console.log(HELP)

const palabrasConsola = process.argv.slice(2);



function parseArgs(datosDUsu) {
  
  const origen = datosDUsu[0];

  const destino = datosDUsu[1];

  
  const posCorta = datosDUsu.indexOf("-d");
  const posLarga = datosDUsu.indexOf("--delimiter");

  let separador = ",";

  
  if (posCorta !== -1) {
    separador = datosDUsu[posCorta + 1];
  } 
  
  else if (posLarga !== -1) {
    separador = datosDUsu[posLarga + 1];
  }

  const sinEncabezado = datosDUsu.includes("-nh") || datosDUsu.includes("--no-header");


  const configuracion = {
    inputFile: origen,
    outputFile: destino,
    delimiter: separador, 
    noHeader: sinEncabezado,
    sortFields: [] };

  return configuracion;
}



