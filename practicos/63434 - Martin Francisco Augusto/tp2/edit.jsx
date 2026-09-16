#!/usr/bin/env -S node --import tsx

import React, {useEffect, useState} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;
const FILAS_VISIBLES = 13;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};

function App() {
    const {exit} = useApp();
    const [cabecera, setCabecera] = useState([]);
    const [filas, setFilas] = useState([]);
    const [ruta, setRuta] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const archivoInicial = process.argv[2];
        if (!archivoInicial) {
            return;
        }
        abrirArchivo(archivoInicial);
    }, []);

    async function abrirArchivo(nombre) {
        try {
            const texto = await readFile(nombre, 'utf8');
            const datos = parsearCsv(texto);
            setCabecera(datos.cabecera);
            setFilas(datos.filas);
            setRuta(nombre);
            setError('');
        } catch {
            setError('No se pudo abrir el archivo');
        }
    }

    useInput((_tecla, key) => {
        if (key.escape) {
            exit();
        }
    });

    const visibles = filas.slice(0, FILAS_VISIBLES);
    const valorActual = visibles[0]?.[0] ?? '';

    return (
        <Box
            flexDirection="column"
            width={COLUMNAS}
            height={FILAS}
            borderStyle="round"
            borderColor={COLORES.borde}
            backgroundColor={COLORES.fondo}
            paddingX={1}
        >
            <Box justifyContent="space-between">
                <Text bold color={COLORES.titulo}>
                    {ruta ? basename(ruta) : 'sin archivo'}
                </Text>
                <Text color={COLORES.secundario}>
                    {filas.length} filas · {cabecera.length} columnas
                </Text>
            </Box>

            <Box>
                <Text color={COLORES.secundario}>Valor {'>'} </Text>
                <Text color={COLORES.titulo}>{valorActual}</Text>
            </Box>

            {error ? (
                <Text color={COLORES.acento}>{error}</Text>
            ) : null}

            <Box marginTop={1}>
                <Box width={5}>
                    <Text bold color={COLORES.secundario}>#</Text>
                </Box>
                {cabecera.map((nombre, indice) => (
                    <Box key={indice} width={anchoDeColumna(nombre)}>
                        <Text bold color={COLORES.secundario}>
                            {nombre.toUpperCase()}
                        </Text>
                    </Box>
                ))}
            </Box>

            {visibles.map((fila, indice) => (
                <Box key={indice}>
                    <Box width={5}>
                        <Text color={COLORES.secundario}>{indice + 1}</Text>
                    </Box>
                    {fila.map((celda, indiceColumna) => (
                        <Box key={indiceColumna} width={anchoDeColumna(cabecera[indiceColumna])}>
                            <Text color={COLORES.titulo} wrap="truncate">
                                {celda}
                            </Text>
                        </Box>
                    ))}
                </Box>
            ))}

            <Box marginTop={1} justifyContent="space-between">
                <Text color={COLORES.secundario}>
                    <Text bold color={COLORES.acento}>Esc</Text> salir
                </Text>
            </Box>
        </Box>
    );
}

function anchoDeColumna(nombre) {
    const clave = String(nombre || '').toLowerCase();
    if (clave === 'edad') {
        return 8;
    }
    if (clave === 'salario') {
        return 12;
    }
    if (clave === 'departamento') {
        return 20;
    }
    return 14;
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();

function parsearCsv(texto) {
    if (!texto || texto.trim() === '') {
        return {cabecera: [], filas: []};
    }

    const lineas = [];
    const crudo = texto.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n');
    for (const linea of crudo) {
        if (linea.trim() !== '') {
            lineas.push(linea);
        }
    }

    if (lineas.length === 0) {
        return {cabecera: [], filas: []};
    }

    const cabecera = lineas[0].split(',').map(campo => campo.trim());
    const filas = [];
    for (let i = 1; i < lineas.length; i++) {
        filas.push(lineas[i].split(',').map(campo => campo.trim()));
    }

    return {cabecera, filas};
}
