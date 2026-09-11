#!/usr/bin/env -S node --import tsx

import React from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;
const NombreArc = process.argv.slice(2);



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
                <Box flexDirection="row" justifyContent="space-between">
                 <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>
                 <Text bold color={COLORES.secundario}>Archivo: {NombreArc}</Text>
                </Box>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();