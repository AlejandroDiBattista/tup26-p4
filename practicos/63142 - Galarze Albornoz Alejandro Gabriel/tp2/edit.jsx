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

const archivoInicial = process.argv[2];
const TAMANIO_PAGINA = 8;

function App() {
    const {exit} = useApp();
    
    const [nombreArchivo, setNombreArchivo] = useState(basename(archivoInicial));
    const [cabecera, setCabecera] = useState([]);
    const [filas, setFilas] = useState([]);
    const [error, setError] = useState('');
    const [modo, setModo] = useState(archivoInicial ? 'VER' : 'ABRIR');
    const [filaSel, setFilaSel] = useState(0);
    const [colSel, setColSel] = useState(0);

    const cargarCSV = async (path) => {
        try {
            const contenido = await readFile(path, 'utf-8');
            const lineas = contenido.trim().split('\n').map(l => l.trim()).filter(Boolean);

            if (lineas.length === 0) {
                setError('El archivo CSV está vacío.');
                return;
            }

            const primeraLinea = lineas[0].split(',').map(c => c.trim());
            const restoLineas = lineas.slice(1).map(l => l.split(',').map(c => c.trim()));

            setCabecera(primeraLinea);
            setFilas(restoLineas);
            setNombreArchivo(basename(path));
            setError('');
            setFilaSel(0);
            setColSel(0);
            setModo('VER');
        } catch (e) {
            setError(`Error al leer el archivo: ${e.message}`);
        }
    };



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