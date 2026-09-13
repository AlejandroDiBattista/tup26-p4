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

    
        
    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    })

    return (
        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
            <Box width={40} height={10} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
                <Box flexGrow={1} justifyContent="center" alignItems="center">
                    <Text bold color={COLORES.titulo}>Editor CSV</Text>
                </Box>
                <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();