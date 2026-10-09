#!/usr/bin/env -S node --import tsx

import React from 'react';
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

const VISIBLE_ROWS = Math.max(1, FILAS - 9);
const COLUMN_GAP = 2;
const LABELS = {
    open: 'Abrir',
    save: 'Guardar',
    edit: 'Editar',
};
const DELIMITER = ',';

function parseDelimited(content) {
    const normalized = content.split('\r\n').join('\n');
    // ["nombre,apellido,edad,salario,departamento", "Paula,Acosta1,48,86200,Ingeniería", "Ignacio,Aguirre,53,109700,Finanzas", ""]
    const allLines = normalized.split('\n');
    
    let lineCount = allLines.length;
    if (lineCount > 0 && allLines[lineCount - 1] === '') {
        lineCount--;
    }

    if (lineCount === 0) {
        throw new Error('El archivo está vacio');
    }

    const lines = [];
    for (const line of allLines.slice(0, lineCount))
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