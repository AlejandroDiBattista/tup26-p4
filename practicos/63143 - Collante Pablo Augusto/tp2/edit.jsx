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

        if (key.upArrow) {
            setSeleccion(prev => ({ ...prev, fila: Math.max(prev.fila - 1, 0) }));
        }
        if (key.downArrow) {
            setSeleccion(prev => ({ ...prev, fila: Math.min(prev.fila + 1, datosCsv.length - 1) }));
        }
        if (key.leftArrow) {
            setSeleccion(prev => ({ ...prev, columna: Math.max(prev.columna - 1, 0) }));
        }
        if (key.rightArrow) {
            setSeleccion(prev => ({ ...prev, columna: Math.min(prev.columna + 1, datosCsv[0].length - 1) }));
        }
    })

    return (
        <Box width={COLUMNAS} height={FILAS} flexDirection="column" backgroundColor={COLORES.fondo}>
            <Box marginBottom={1}><Text color={COLORES.titulo}>Archivo: {archivo || 'Ninguno'}</Text></Box>
            {datosCsv.map((fila, i) => (
                <Box key={i} flexDirection="row">
                    {fila.map((celda, j) => (
                        <Box key={j} width={20} height={3} borderStyle="round" borderColor={COLORES.borde} backgroundColor={seleccion.fila === i && seleccion.columna === j ? COLORES.acento : COLORES.fondo}>
                            <Text>{celda}</Text>
                        </Box>
                    ))}
                </Box>
            ))}
            <Box marginTop={1} paddingX={1} borderStyle="single" borderColor={COLORES.secundario}>
                <Text color={COLORES.acento}> Posicion: [{seleccion.fila}, {seleccion.columna} | Valor: {datosCsv[seleccion.fila]?.[seleccion.columna]}]</Text>
            </Box>
        </Box>
    );
}



const app = render(<App />);
await app.waitUntilExit();
console.clear();