#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
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

const parsearCSV = (txt) => {
    const lineas = txt.replace(/\r/g, '').trim().split('\n');
    return {
        cabecera: lineas[0].split(','),
        filas: lineas.slice(1).map((l) => l.split(','))
    };
};

const aCSV = (cabecera, filas) =>
    [cabecera.join(','), ...filas.map((f) => f.join(','))].join('\n') + '\n';


function App() {
    const {exit} = useApp();
    
    const [archivo, setArchivo]   = useState(process.argv[2] ? basename(process.argv[2]) : '');
    const [cabecera, setCabecera] = useState([]);
    const [filas, setFilas]       = useState([]);
    const [modo, setModo]         = useState('ver');
    const [error, setError]       = useState('');

     // función para leer y cargar un archivo CSV 
    const cargar = async (ruta) => {
        try {
            const data = await readFile(ruta, 'utf-8');
            const res = parsearCSV(data);
            setCabecera(res.cabecera);
            setFilas(res.filas);
            setArchivo(basename(ruta));
            setError('');
            setModo('ver');
        } catch (e) {
            setError(e.message);
            setModo('ver');
        }
    };

// al iniciar si se especificó un archivo por línea de comandos lo carga directamente
    useEffect(() => {
        if (process.argv[2]) {
            cargar(process.argv[2]);
        }
    }, []);

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    })

     const anchos = cabecera.map((c, i) =>
        Math.max(c.length, ...filas.map((f) => (f[i] || '').length)) + 3
    );

    return (
        <Box flexDirection="column" width={COLUMNAS} paddingX={1} paddingTop={1}>
            {/* cabecera superior */}
            <Box justifyContent="space-between">
                <Text bold color={COLORES.titulo}>{archivo || 'editor.csv'}</Text>
                {cabecera.length > 0 && (
                    <Text color={COLORES.secundario}>{filas.length} filas · {cabecera.length} columnas</Text>
                )}
            </Box>
            {error ? <Text color="red">Error: {error}</Text> : null}
            {cabecera.length > 0 && (
                <Box marginTop={1}>
                    <Box width={5} justifyContent="flex-end" paddingRight={1}>
                        <Text bold color={COLORES.secundario}>#</Text>
                    </Box>
                    {cabecera.map((c, i) => (
                        <Box key={i} width={anchos[i]}>
                            <Text bold color={COLORES.secundario}>{c.toUpperCase()}</Text>
                        </Box>
                    ))}
                </Box>
            )}
            {/* filas de datos numeradas */}
            {filas.slice(0, filasVisibles).map((f, i) => (
                <Box key={i}>
                    <Box width={5} justifyContent="flex-end" paddingRight={1}>
                        <Text bold color={COLORES.secundario}>{i + 1}</Text>
                    </Box>
                    {f.map((v, ci) => (
                        <Box key={ci} width={anchos[ci]}>
                            <Text color={COLORES.titulo}>{v}</Text>
                        </Box>
                    ))}
                </Box>
            ))}
            {/* barra inferior */}
            <Box marginTop={1}>
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