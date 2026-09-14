#!/usr/bin/env -S node --import tsx

import React from 'react';
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
    const [datos, setDatos] = React.useState(null);
    const [modo, setModo] = React.useState('inicio');
    const [mensaje, setMensaje] = React.useState('');

    async function cargarArchivo(nombre) {
        try {
            const texto = await readFile(nombre, 'utf-8');
            const lineas = texto.trim().split('\n')

            const cabeceras = lineas[0].split(',');
            const filas = lineas.slice(1).map(linea => linea.split(','));
            setDatos({ nombre, cabeceras, filas });
            setModo('tabla');
            setMensaje('');
        } catch (error) {
            setMensaje('Error al cargar el archivo');
        }
    }

    useInput((tecla, key) => {
        if (modo === 'abrir') {
            if (key.escape) {
                setModo('inicio');
                setMensaje('');
            }

            return;
        }
        if (key.escape) {
            exit();
            return;
        }

        if (tecla.toLowerCase() === 'a') {
            setModo('abrir');
            setMensaje('');
        }
    });
    function formatoCelda(valor) {
        return String(valor).slice(0, 9).padEnd(10);
    }

    if (modo === 'tabla') {
    return (
        <Box flexDirection="column" paddingX={1}>
            <Text bold color={COLORES.titulo}>
                {basename(datos.nombre)}
            </Text>

            <Text bold color={COLORES.acento}>
                {'#'.padEnd(4)}
                {datos.cabeceras.map(formatoCelda).join('')}
            </Text>

            {datos.filas.slice(0, 5).map((fila, indice) => (
                <Text key={indice} color={COLORES.secundario}>
                    {String(indice + 1).padEnd(4)}
                    {fila.map(formatoCelda).join('')}
                </Text>
            ))}

            <Text color={COLORES.secundario}>
                <Text bold color={COLORES.acento}>Esc</Text> salir
            </Text>
        </Box>
    );
}
    
    return (
        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
            <Box
                width={COLUMNAS - 2}
                height={FILAS - 2}
                flexDirection="column"
                borderStyle="round"
                borderColor={COLORES.borde}
                backgroundColor={COLORES.fondo}
                paddingX={1}
            >
                <Box

                    justifyContent="center"
                    alignItems="center">
                    <Text bold color={COLORES.titulo}>Editor CSV</Text>
                </Box>

                {modo === 'inicio' && (
                    <Text color={COLORES.secundario}>
                        <Text bold color={COLORES.acento}> A</Text> abrir archivo
                    </Text>
                )}

                {modo === 'abrir' && (
                    <Box>
                        <Text color={COLORES.acento}>Abrir: </Text>
                        <TextInput
                            defaultValue=""
                            onSubmit={cargarArchivo}
                            placeholder="Ingrese el nombre del archivo"
                        />
                    </Box>
                )}

                

                {modo !== 'tabla' && (
                    <Text color={COLORES.secundario}>
                        <Text bold color={COLORES.acento}>Esc</Text> salir
                    </Text>
                )}

            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();