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

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Uso: npx tsx edit.jsx <archivo.csv>");
        process.exit(1);
    }
    const filePath = args[0];
    const tabla = await parseFile(filePath);
    console.log("Archivo CSV cargado correctamente.");
    console.log("Encabezados:", tabla.header);
    console.log("Número de filas:", tabla.filas);
}

main();

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
// const app = render(<App />);
// await app.waitUntilExit();
// console.clear();