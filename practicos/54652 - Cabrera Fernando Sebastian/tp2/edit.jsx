#!/usr/bin/env -S node --import tsx

import React, {useState,useEffect} from'react';
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
    const archivoInicial = process.argv[2] || null;
 
    function App() {
    const [archivo, setArchivo] = React.useState(archivoInicial);
    const [filaActual, setFilaActual] = React.useState(0);
    const [columnaActual, setColumnaActual] = React.useState(0);
    const [filas, setFilas] = React.useState([]);


    useEffect(() => {
        const cargarArchivo = async() => {
            try {
                const contenido = await readFile(archivo, 'utf-8');
                const filasLeidas = contenido.split('\n')
                .map(fila=> fila.trimEnd())
                .filter(fila => fila !=='')
                .map(fila => fila.split(','));
                setFilas(filasLeidas);
            }catch(error){
                console.error(`Error al leer el archivo ${archivo}: ${error.message}`);
            };
        }
        if(archivo){
            cargarArchivo();
        }
    },[archivo]);
    

    const {exit} = useApp();
    
    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }if (key.upArrow) {
            setFilaActual((prevFila) => Math.max(prevFila - 1, 0));
        }if (key.downArrow) {
            setFilaActual((prevFila) => Math.min(prevFila + 1, filas.length - 1));
        }if (key.leftArrow) {
            setColumnaActual((prevColumna) => Math.max(prevColumna - 1, 0));
        }if (key.rightArrow) {
            setColumnaActual((prevColumna) => Math.min(prevColumna + 1, filas[0].length - 1));
        }
    })

    const encabezado = filas[0];
    const datos =filas.slice(1);

   return (
    <Box width={COLUMNAS} height={FILAS} flexDirection="column">
        <Box borderStyle="round" borderColor={COLORES.borde} paddingX={1}>
            <Text bold color={COLORES.titulo}>{archivo || 'Sin archivo'}</Text>
        </Box>
        <Box flexGrow={1} flexDirection="column" paddingX={1}>
           {encabezado && (
    <Box flexDirection="row">
        <Text>{'   '}</Text>
        {encabezado.map((col, j) => (
            <Text key={j} bold color={COLORES.acento}>{col.padEnd(15)}</Text>
        ))}
    </Box>
)}
            {datos.map((fila, index) => (
                <Box key ={index} flexDirection="row">
                    <Text color={COLORES.secundario}>{String(index + 1).padStart(3) + ' '}</Text>
                    {fila.map((celda, j) => (
                    <Text key={j} inverse={index ===filaActual && j ===columnaActual}>
                        {celda.padEnd(15)}
                    </Text>
                ))}
                </Box>
            ))}
        </Box>
        <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>
    </Box>
);
}

const app = render(<App />);
await app.waitUntilExit();
