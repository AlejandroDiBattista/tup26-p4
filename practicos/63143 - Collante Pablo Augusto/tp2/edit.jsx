#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
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

    const [archivo, setArchivo] = useState(process.argv[2] || '');
    const [datosCsv, setDatosCsv] = useState([["Columna 1", "Columna 2"], ["Fila 1", "Fila 2"]]);
    const [seleccion, setSeleccion] = useState({ fila: 0, columna: 0 });
    useEffect(() => {
        async function cargarArchivo() {
            if (!archivo) return;

            try {
                const contenido = await readFile(archivo, 'utf-8');
                const lineas = contenido.trim().split('\n');
                const matriz = lineas.map(linea => linea.split(','));
                setDatosCsv(matriz);
            } catch (error) { }
        }
        cargarArchivo();
    }, [archivo]);



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