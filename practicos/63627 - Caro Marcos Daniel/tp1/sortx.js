#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

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

const texto_ayuda = `Uso: sortx <origen> <destino> [-b|--by campo[:tipo[:orden]]]... [-d|--delimiter delimitador] [-nh|--no-header] [-h|--help]`;



function parseArgs(args_consola) {


  if (args_consola.includes('--help') || args_consola.includes('-h')) {
    console.log(texto_ayuda);
    process.exit(0);
  }

  let lista_archivos = [];
  let configuracion = {
    inputFile: undefined,
    outputFile: undefined,
    delimiter: ',',
    noHeader: false,
    sortFields: []
  };

  if (args_consola.length === 0) {
    throw new Error('Error: faltan los archivos de origen y destino.');
  }

  for (let i = 0; i < args_consola.length; i++) {
    let arg_actual = args_consola[i];

    if (arg_actual === '-d' || arg_actual === '--delimiter') {
      let valor_sep = args_consola[i + 1];
      if (!valor_sep || valor_sep.startsWith('-')) {
        throw new Error('Error: te falto el valor del delimitador.');
      }
      
      let sep_final = valor_sep === '\\t' ? '\t' : valor_sep;
      if (sep_final.length !== 1) {
        throw new Error('Error: el delimitador tiene que ser un solo caracter.');
      }
      
      configuracion.delimiter = sep_final;
      i++; // 
      continue;
    }

    if (arg_actual === '-nh' || arg_actual === '--no-header') {
      configuracion.noHeader = true;
      continue;
    }

    if (arg_actual === '-b' || arg_actual === '--by') {
      let regla = args_consola[i + 1];
      if (!regla || regla.startsWith('-')) {
        throw new Error('Error: falta el criterio despues de -b.');
      }

      let partes = regla.split(':');
      let nombre_columna = partes[0];
      let tipo_dato = partes[1] || 'alpha';
      let tipo_orden = partes[2] || 'asc';

      if (!nombre_columna || nombre_columna.trim() === '') {
        throw new Error('Error: el criterio de ordenamiento no es valido.');
      }

      configuracion.sortFields.push({
        name: nombre_columna,
        numeric: tipo_dato === 'num',
        descending: tipo_orden === 'desc'
      });
      
      i++; 
      continue;
    }

    if (arg_actual.startsWith('-')) {
      throw new Error(`Error: opcion desconocida '${arg_actual}'.`);
    }

    lista_archivos.push(arg_actual);
  }

  if (lista_archivos.length < 2) {
    throw new Error('Error: faltan archivos de entrada o salida.');
  }
  if (lista_archivos.length > 2) {
    throw new Error('Error: pusiste demasiados archivos en el comando.');
  }
  if (configuracion.sortFields.length === 0) {
    throw new Error('Error: necesitas especificar por lo menos un criterio con -b.');
  }

  configuracion.inputFile = lista_archivos[0];
  configuracion.outputFile = lista_archivos[1];

  return configuracion;
}






function readInput(ruta_origen) {
  try {
    return fs.readFileSync(ruta_origen, 'utf8');
  } catch (err) {
    throw new Error(`Error: no se pudo abrir o leer el archivo '${ruta_origen}'.`);
  }
}






function parseDelimited(texto_crudo, separador) {
  if (texto_crudo.includes('"')) {
    throw new Error('Error: el archivo no puede contener comillas dobles.');
  }

  let renglones = texto_crudo.split(/\r?\n/);
  
  
  if (renglones.length > 0 && renglones[renglones.length - 1] === '') {
    renglones.pop();
  }

  if (renglones.length === 0) {
    return [];
  }

  let matriz_datos = [];
  for (let i = 0; i < renglones.length; i++) {
    matriz_datos.push(renglones[i].split(separador));
  }

  let largo_esperado = matriz_datos[0].length;

  for (let j = 0; j < matriz_datos.length; j++) {
    if (matriz_datos[j].length !== largo_esperado) {
      throw new Error('Error: hay filas con diferente cantidad de columnas.');
    }
  }

  return matriz_datos;
}



// funcion de ayuda para sacar el valor de la columna segun su nombre o indice
function sacar_valor(fila_actual, nombre_col, titulos) {
  if (titulos !== null) {
    let indice = titulos.indexOf(nombre_col);
    if (indice === -1) {
      throw new Error(`Error: la columna pedida no existe: ${nombre_col}`);
    }
    return fila_actual[indice];
  }

  let pos_num = Number(nombre_col);
  if (!Number.isInteger(pos_num) || pos_num < 0 || pos_num >= fila_actual.length) {
    throw new Error(`Error: el indice de la columna no es valido: ${nombre_col}`);
  }

  return fila_actual[pos_num];
}




// funcion de ayuda para convertir a numero si hace falta
function acomodar_tipo(dato_crudo, es_numero) {
  let texto_limpio = String(dato_crudo || '');

  if (!es_numero) {
    return texto_limpio;
  }

  let valor_num = Number(texto_limpio);
  if (!Number.isFinite(valor_num)) {
    throw new Error(`Error: se esperaba un numero pero se encontro '${texto_limpio}'`);
  }

  return valor_num;
}




function sortRows(tabla, ajustes) {
  if (tabla.length === 0) {
    return [];
  }

  let titulos = ajustes.noHeader ? null : tabla[0];
  let datos_puros = ajustes.noHeader ? tabla : tabla.slice(1);

  // copiamos los datos para no romper la matriz original
  let resultado_ordenado = [...datos_puros].sort(function(fila_a, fila_b) {
    
    for (let c = 0; c < ajustes.sortFields.length; c++) {
      let regla = ajustes.sortFields[c];

      let val_a = sacar_valor(fila_a, regla.name, titulos);
      let val_b = sacar_valor(fila_b, regla.name, titulos);

      let norm_a = acomodar_tipo(val_a, regla.numeric);
      let norm_b = acomodar_tipo(val_b, regla.numeric);

      let diferencia = 0;
      if (regla.numeric) {
        diferencia = Number(norm_a) - Number(norm_b);
      } else {
        diferencia = String(norm_a).localeCompare(String(norm_b));
      }

      if (regla.descending) {
        diferencia = diferencia * -1;
      }

      if (diferencia !== 0) {
        return diferencia;
      }
    }

    return 0; // empate
  });

  if (ajustes.noHeader) {
    return resultado_ordenado;
  }
  
  return [titulos, ...resultado_ordenado];
}






