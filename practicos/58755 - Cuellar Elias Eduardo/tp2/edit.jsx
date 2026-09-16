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
    const lineas = texto.split(/\r?\n/).filter(linea => linea.trim() !== "")
    return lineas.map(linea => linea.split(","))
}

function App() {
    const {exit} = useApp();
    const [filas, setFilas] = useState(null)
    const [archivo, setArchivo] = useState(null)

    useEffect(() => {
        const nombreArchivo = process.argv[2]
        if (nombreArchivo) {
            readFile(nombreArchivo, "utf8").then(texto => {
                setFilas(parseCSV(texto))
                setArchivo(nombreArchivo)
            })
        }
    }, [])

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    })

    if (filas === null) {
        return <Text color={COLORES.secundario}>Cargando...</Text>
    }

    return (
        <Box flexDirection="column">
            <Text bold color={COLORES.titulo}>{basename(archivo)}</Text>
            {filas.map((fila, i) => (
                <Text key={i}>{fila.join("  ")}</Text>
            ))}
        </Box>
    )
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();