#!/usr/bin/env -S node --import tsx
import fs from 'fs';
import React from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';


const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};
//funcion que lee el archivo de datos
function readArchivo(filePath) {
    try {
        const texto = fs.readFileSync(filePath, 'utf-8');
        return {exito:true, datos:texto};
    } catch (error) {
        console.error(`error al leer el archivo: ${error.message}`);
        return {exito:false, datos:null};
    }
     }

     /// transformamos el texto en header y rows
function parseArchivo(texto) {
    const lineas = texto.replace(/\r\n/g, "\n").split("\n").filter(l => l !== "");
    const filas = lineas.map(linea => linea.split(','));
    const header = filas[0];
    const rows = filas.slice(1);
    return{header, rows};
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

const prueba = readArchivo('empleados.csv');
if (prueba.exito) {
    const {header, rows} = parseArchivo(prueba.datos);
    console.log('Encabezado:', header);
    console.log('Filas:', rows);
} else {
    console.error('No se pudo leer el archivo.');
}



const app = render(<App />);
await app.waitUntilExit();
console.clear();