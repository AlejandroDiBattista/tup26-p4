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

async function parseFile(filePath) {
    try {
        const data = await readFile(filePath, 'utf8');
        const tabla = { header: [], filas: [] };
        tabla.filas = data.split(/\r?\n|\r/).map((fila) => fila.split(","));
        tabla.header = tabla.filas.shift();
        tabla.filas = tabla.filas.filter(fila => fila.length === tabla.header.length);
        tabla.filas = tabla.filas.map(fila => fila.map(campo => campo.trim()));
        return tabla;
    } catch (error) {
        console.error(`Error al leer el archivo ${filePath}:`, error);
        process.exit(1);
    }
}

function Header({ header }) {
    return (
        <Box flexDirection="row" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
            {header.map((campo, index) => (
                <Box key={index} paddingX={1}>
                    <Text color={COLORES.titulo}>{campo.toUpperCase()}</Text>
                </Box>
            ))}
        </Box>
    );
}

function Row({ fila }) {
    return (
        <Box flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
            {fila.map((campo, index) => (
                <Box key={index} paddingX={1}>
                    <Text color={COLORES.secundario}>{campo}</Text>
                </Box>
            ))}
        </Box>
    );
}

function App({ ruta, data }) {
    const {exit} = useApp();
    
    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    })
    
    return (
        <Box>
            <Header header={data.header} />
                <Row key={data.filas.index} fila={data.filas} />
        </Box>
    );
}
async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Uso: npx tsx edit.jsx <archivo.csv>");
        process.exit(1);
    }
    const filePath = args[0];
    const tabla = await parseFile(filePath);
    await render(<App ruta={filePath} data={tabla} />);
}

main();