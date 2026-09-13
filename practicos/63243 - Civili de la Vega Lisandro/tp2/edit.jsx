#!/usr/bin/env -S node --import tsx

import React from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

// convierto archivo a csv
function parseCSV(texto) {
    // saco posibles saltos de linea windows y lineas vacias al final
    const lineas = texto.replace(/\r/g, '').split('\n').filter(l => l.length > 0);

    const cabecera = lineas[0].split(',');
    const filas = [];
    for (let i = 1; i < lineas.length; i++) {
        filas.push(lineas[i].split(','));
    }

    return {cabecera, filas};
}

// armo el texto del csv a partir de la cabecera y las filas
function serializeCSV(cabecera, filas) {
    let texto = cabecera.join(',') + '\n';
    for (const fila of filas) {
        texto += fila.join(',') + '\n';
    }
    return texto;
}

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};


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