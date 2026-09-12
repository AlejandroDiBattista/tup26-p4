#!/usr/bin/env -S node --import tsx

import React from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile, writeFile } from 'node:fs/promises';
import { TextInput } from '@inkjs/ui';
import { basename } from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS = process.stdout.rows || 24;

const COLORES = {
    fondo: '#161310',
    borde: '#726b61',
    titulo: '#ede7db',
    secundario: '#ada79e',
    acento: '#edbb64',
};

function App() {
    const { exit } = useApp();

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

/* DESARROLLO */

/* leer y representar csv */
function parsearCSV(textoCSV) {

    if (!textoCSV || textoCSV.trim() === '') {                  // si el texto está vacío o solo tiene espacios, devolver listas vacías
        return { cabecera: [], filas: [] };
    }

    const lineas = textoCSV.trim().split(/\r?\n/).filter(linea => linea.trim().length > 0);        // quitar espacios exteriores, dividir el texto por líneas y eliminar líneas vacías
    // eliminar líneas vacías o que solo contienen espacios

    const cabecera = lineas[0].split(',').map(campo => campo.trim());           // primera linea contiene los nombres de las columnas

    const filas = lineas.slice(1).map(linea =>                              // líneas de datos desde la posición 1
        linea.split(',').map(campo => campo.trim())
    );

    return { cabecera, filas };
}

function generarCSV(cabecera, filas) {
    const lineaCabecera = cabecera.join(',');           // convertir encabezado a texto separado por comas
    const lineasFilas = filas.map(fila => fila.join(','));          // convertir filas a texto separado por comas

    return [lineaCabecera, ...lineasFilas].join('\n');          // unir encabezado y filas con salto de línea
}