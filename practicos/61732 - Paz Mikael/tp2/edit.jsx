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

function parseCSV(texto) {
    const lineas = texto.split(/\r?\n/);
    if (lineas.length > 0 && lineas[lineas.length - 1] === '') {
        lineas.pop();
    }
    if (lineas.length === 0) {
        return {headers: [], rows: []};
    }
    const headers = lineas[0].split(',');
    const rows = lineas.slice(1).map(l => l.split(','));
    return {headers, rows};
}

function serializeCSV(headers, rows) {
    const todas = [headers, ...rows];
    return todas.map(fila => fila.join(',')).join('\n') + '\n';
}

function App() {
    const {exit} = useApp();
    const [archivo, setArchivo] = useState('');
    const [headers, setHeaders] = useState([]);
    const [rows, setRows] = useState([]);
    const [cargado, setCargado] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const argArchivo = process.argv.slice(2).find(arg => !arg.startsWith('-'));
        if (argArchivo) {
            cargarArchivo(argArchivo);
        }
    }, []);

    async function cargarArchivo(nombre) {
        try {
            const contenido = await readFile(nombre, 'utf-8');
            const parsed = parseCSV(contenido);
            setArchivo(nombre);
            setHeaders(parsed.headers);
            setRows(parsed.rows);
            setCargado(true);
            setError(null);
        } catch (err) {
            setError('Error al leer el archivo: ' + nombre);
        }
    }

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    }, {isActive: Boolean(process.stdin.isTTY)});

    return (
        <Box width={COLUMNAS} height={FILAS} flexDirection="column" paddingX={1} paddingY={1}>
            <Box justifyContent="space-between">
                <Text bold color={COLORES.titulo}>{archivo ? basename(archivo) : 'Sin archivo'}</Text>
                <Text color={COLORES.secundario}>{rows.length} filas · {headers.length} columnas</Text>
            </Box>
            {error && (
                <Box marginY={1}>
                    <Text color="red">{error}</Text>
                </Box>
            )}
            <Box flexGrow={1} justifyContent="center" alignItems="center">
                <Text color={COLORES.secundario}>
                    {cargado ? 'Archivo cargado correctamente.' : 'Presione Esc para salir.'}
                </Text>
            </Box>
            <Box justifyContent="space-between">
                <Text color={COLORES.secundario}>
                    <Text bold color={COLORES.acento}>Esc</Text> salir
                </Text>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();