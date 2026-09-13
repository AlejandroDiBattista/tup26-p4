#!/usr/bin/env -S node --import tsx

import React, {useState, useEffect} from 'react';
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

function parseCSV(contenido) {
    const lineas = contenido.trim().split(/\r?\n/).filter(linea => linea.length > 0);
    if (lineas.length === 0) return { headers: [], rows: [] };
    const headers = lineas[0].split(',');
    const rows = lineas.slice(1).map(linea => linea.split(','));
    return { headers, rows };
}

function App({archivoInicial}) {
    const {exit} = useApp();
    const [nombreArchivo, setNombreArchivo] = useState(archivoInicial || '');
    const [headers, setHeaders] = useState([]);
    const [filas, setFilas] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!archivoInicial) return;
        async function cargar() {
            try {
                const contenido = await readFile(archivoInicial, 'utf-8');
                const parsed = parseCSV(contenido);
                setHeaders(parsed.headers);
                setFilas(parsed.rows);
                setError(null);
            } catch (err) {
                setError('Error al abrir el archivo: ' + archivoInicial);
            }
        }
        cargar();
    }, [archivoInicial]);

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    });
    return (
        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
            <Box width={60} height={20} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
                <Box flexGrow={1} justifyContent="center" alignItems="center">
                    <Text bold color={COLORES.titulo}>Editor CSV</Text>
                </Box>
                <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>
                <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Enter</Text> Guardar</Text>
            </Box>
        </Box>
    );
}

const archivoInicial = process.argv[2];
const app = render(<App archivoInicial={archivoInicial} />);
await app.waitUntilExit();
console.clear();