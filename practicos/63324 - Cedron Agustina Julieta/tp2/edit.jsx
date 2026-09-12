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

function App() {
    const {exit} = useApp();
    
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