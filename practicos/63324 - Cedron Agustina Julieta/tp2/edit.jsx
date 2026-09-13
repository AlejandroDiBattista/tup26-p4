#!/usr/bin/env -S node --import tsx

import React, {useState, useEffect} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';
 

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};
//Conviertir el texto plano del archivo CSV en datos estructurados con function parsecsv
function parseCSV(contenido){
//normalizar los saltos de linea y separamos el texto en un array
const todasLasLineas= contenido.replace(/\r/g, '').split('\n');
//filtrar para descartar cualquier renglon
const lineas = todasLasLineas.filter(function(linea){
    return linea.trim().length>0;
});
//si el archivo no tiene nada se devuelve un array vacio
if (lineas.length===0) {
    return {cabecera:[], filas:[]};
}
//el primer renglon para nombres de las columnas(cabecera)
const cabecera = lineas[0].split(',');
//procesamos los datos salteando la cabecera a partir del 1
const lineasDeDatos=lineas.slice(1);
//pasamos los renglones de texto a un array de valores separados por coma
const filas= lineasDeDatos.map(function(linea){
    return linea.split(',');
});
// devolvemos todo el objeto listo
return {cabecera: cabecera, filas: filas};
}

//funcion para calcular el ancho de las columnas
function calcularAncho(cabecera, filas){
    //si no hay datos cargados, devolvemos un array vacio
    if (cabecera.length===0) {
        return[];
    }
    //usamos el indice para recorrer cada columna
    const anchos = cabecera.map(function(titulo,colIndice){
        //tomamos el largo del titulo como referencia
        let maximo= titulo.length;
        //revisamos el texto de la columna fila por fila
        filas.forEach(function(fila){
            let celda='';
            //convertimos a texto si la celda tiene contenido
            if (fila[colIndice]!== undefined && fila[colIndice]!==null){
                celda = String(fila[colIndice]);
            }
            // si el texto es largo, se actualiza el ancho
            if (celda.length>maximo) {
                maximo= celda.length;
            }
        });
        // agregamos 2 espacios extras para que no quede pegado al borde
        return maximo + 2;
    });
    return anchos;
}


function App() {
    const {exit} = useApp();
    
    //obtenemos la ruta del archivo que pasa el usuario por terminal
    const rutaInicial= process.argv[2]||'';
    // estados para almacenar el archivo, la cabecera y las filas
    const [archivo, setArchivo]= useState(rutaInicial);
    const [cabecera, setCabecera]= useState([]);
    const [filas, setFilas]=useState([]);

    //guardar la posicion del cursor en la fila y columna
    const [filaSeleccionada, setFilaSeleccionada]=useState(0);
    const [columnaSeleccionada, setColumnaSeleccionada]=useState(0);
    
    //controlar el modo edicion y el texto que se edita
    const [editando,setEditando]=useState(false);
    const [valorEdicion, setValorEdicion]=useState('');

    //leer y el archivo csv al iniciar el programa
    useEffect(function(){
        async function cargarArchivo(){
           if(rutaInicial){
                try{
                   //leemos el archivo en texto plano con codificacion utf-8
                   const contenido = await readFile(rutaInicial, 'utf-8');
                //desarmamos el csv
                   const datos=parseCSV(contenido);
                  //guardamos columnas y filas
                  setCabecera(datos.cabecera);
                  setFilas(datos.filas);
                }catch(error){
                console.error('Error al intenar leer el archivo: ',error)
                }
            }
        }
        cargarArchivo();
    },[]);

    //calculamos el ancho que le corresponde a cada columna
    const anchos= calcularAncho(cabecera, filas);
    useInput(function(tecla, key) {
        // si estamos editando y presionamos escape, se cancela
        if (key.escape && editando) {
            setEditando(false);
            return;
        }
        //si no estamos editando, y tocamos escape, salimos
        if (key.escape &&!editando) {
            exit();
            return;
        }
        //al precionar enter sobre la celda podremos editar
        if (key.return && !editando) {
            const valorActual= filas[filaSeleccionada][columnaSeleccionada] || '';
            setValorEdicion(valorActual);
            setEditando(true);
            return;
        }
        //para que las flechas no muevan la tabla, frenamos aqui
        if (editando) {
            return;
        }

        //flecha hacia abajo, baja una fila sin pasarse las 10 que se ven
        if (key.downArrow) {
            setFilaSeleccionada(function(actual){
                const maxFilas=Math.min(filas.length,10)-1;
                if (actual<maxFilas) {
                    return actual +1;
                }
                return actual;
            });
        }
        //flecha hacia arriba, sube una fila sin bajar de 0
        if (key.upArrow) {
            setFilaSeleccionada(function(actual){
                if (actual>0) {
                    return actual-1;
                }
                return actual;
            });
        }
        //flecha derecha para avanzar una columna
        if (key.rightArrow) {
            setColumnaSeleccionada(function(actual){
                if (actual<cabecera.length-1) {
                    return actual +1;
                }
                return actual;
            });
        }
        //flecha izquierda,retocede una columna sin bajar de 0
        if (key.leftArrow) {
            setColumnaSeleccionada(function(actual){
                if (actual>0) {
                    return actual -1;
                }
                return actual;
            });
        }
    });

    return (
        // Contenedor principal que ocupa todo el ancho y alto de la terminal
        <Box width={COLUMNAS} height={FILAS} flexDirection="column" padding={1} backgroundColor={COLORES.fondo}>
            
            {/* SECCIÓN 1: Barra superior con el nombre del archivo cargado */}
            <Box marginBottom={1}>
             <Text bold color={COLORES.titulo}>
              Archivo: <Text color={COLORES.acento}>{basename(archivo) || 'Sin archivo'}</Text>
             </Text>
            </Box>

            {/* SECCIÓN 2: Fila de encabezados con borde para separar los títulos */}
            <Box borderStyle="single" borderColor={COLORES.borde} paddingX={1}>
              {cabecera.map(function(columna, colIndice) {
            // Cada columna se dibuja en una caja con el ancho calculado previamente
               return (
                    <Box key={colIndice} width={anchos[colIndice]}>
                       <Text bold color={COLORES.acento}>{columna}</Text>
                 </Box>
                    );
                })}
            </Box>

            {/* SECCIÓN 3: Cuerpo de la tabla con los datos */}
            <Box flexDirection="column" paddingX={1} flexGrow={1}>
                {/* Mostramos por ahora las primeras 10 filas para probar la visualización */}
                {filas.slice(0, 10).map(function(fila, filaIndice) {
              return (
                  // Cada renglón de la tabla se distribuye de forma horizontal
                   <Box key={filaIndice} flexDirection="row">
                       {/* Recorremos las celdas de este renglón */}
                       {fila.map(function(celda, colIndice) {
                        //verificamos si la celda coincide con la del cursor
                        const estaSeleccionada=(filaIndice===filaSeleccionada && colIndice === columnaSeleccionada);
                        //estilos por defecto
                        let colorFondo=undefined;
                        let colorTexto=COLORES.secundario;
                        let negrita=false;

                        //si coincide, cambiamos los colores para resaltar
                        if (estaSeleccionada) {
                            colorFondo=COLORES.acento;
                            colorTexto=COLORES.fondo;
                            negrita=true;
                        }
                          return (
                  // La celda usa el mismo ancho que su columna para quedar perfectamente alineada
                         <Box key={colIndice} width={anchos[colIndice]}
                            backgroundColor={colorFondo}>
                            {/*si es la celda actual y estamos editando, mostramos el input, si no el texto normal*/}
                            {estaSeleccionada && editando && (
                                <TextInput value={valorEdicion} onChange={setValorEdicion}
                                onSubmit={function(nuevoValor){
                                    const nuevasFilas=filas.map(function (r){return [...r];});
                                    nuevasFilas[filaSeleccionada][columnaSeleccionada]=nuevoValor;
                                    setFilas(nuevasFilas);
                                    setEditando(false);
                                        
                                }}
                               /> 
                            )}
                            {/*si no estamos editando, se muestra el texto normal*/}
                            {(!estaSeleccionada || !editando)&& (
                            <Text bold={negrita} color={colorTexto}>
                                {/*usamos padEnd para rellenar con espacios vacios y limpiar letras viejas*/}
                                {String(celda).padEnd(anchos[colIndice],' ')}
                            </Text>
                            )}
                        </Box>
                        );
                    })}
                        </Box>
                    );
                })}
            </Box>

            {/* SECCIÓN 4: Barra inferior con la ayuda de teclas disponibles */}
            <Box marginTop={1}>
                {/*atajos visibles mientras editamos una celda*/}
                {editando &&(
                <Text color={COLORES.secundario}>
                 <Text bold color={COLORES.acento}>Enter</Text> Guardar | <Text bold color={COLORES.acento}>Esc</Text> Cancelar
                </Text>
                )}
                {/*atajos visibles mientras navegamos por la grilla*/}
                {!editando &&(
                    <Text color={COLORES.secundario}>
                        <Text bold color={COLORES.acento}>Flechas</Text> Moverse | <Text bold color={COLORES.acento}>Enter</Text> Editar | <Text bold color={COLORES.acento}>Esc</Text> Salir
                        </Text>
                )}
            </Box>

        </Box>
    );
}
const app = render(<App />);
await app.waitUntilExit();
console.clear();