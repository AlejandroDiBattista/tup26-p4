#!/usr/bin/env -S node --import tsx

import React, { useEffect, useState } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS = process.stdout.rows || 24;

const ANCHO_COLUMNA = 16;

const COLORES = {
    fondo: '#161310',
    borde: '#726b61',
    titulo: '#ede7db',
    secundario: '#ada79e',
    acento: '#edbb64',
};

function ajustarTexto(texto, ancho) {
    const valor = String(texto ?? '');

    if (valor.length >= ancho) {
        return valor.slice(0, ancho - 2) + '…';
    }

    return valor.padEnd(ancho - 1);
}

function App() {
    const { exit } = useApp();

    const [archivo, setArchivo] = useState(null);
    const [cabecera, setCabecera] = useState([]);
    const [datos, setDatos] = useState([]);
    const [mensaje, setMensaje] = useState('');

    function cargarCSV(texto) {
        const textoLimpio = texto.trim();

        if (!textoLimpio) {
            throw new Error('El archivo CSV está vacío.');
        }

        const lineas = textoLimpio
            .split('\n')
            .map(linea => linea.replace('\r', ''));

        const nuevaCabecera = lineas[0].split(',');

        const nuevasFilas = lineas
            .slice(1)
            .map(linea => linea.split(','));

        const cantidadColumnas = nuevaCabecera.length;

        const filaIncorrecta = nuevasFilas.some(
            fila => fila.length !== cantidadColumnas
        );

        if (filaIncorrecta) {
            throw new Error(
                'El archivo contiene filas con distinta cantidad de columnas.'
            );
        }

        setCabecera(nuevaCabecera);
        setDatos(nuevasFilas);
    }

    async function abrirArchivo(nombre) {
        try {
            const texto = await readFile(nombre, 'utf8');

            cargarCSV(texto);

            setArchivo(nombre);
            setMensaje(`Archivo abierto: ${basename(nombre)}`);

            return true;
        } catch (error) {
            setMensaje(`Error: ${error.message}`);
            return false;
        }
    }

    useEffect(() => {
        const nombreArchivo = process.argv[2];

        if (nombreArchivo) {
            abrirArchivo(nombreArchivo);
        }
    }, []);

    useInput((input, key) => {
        if (key.escape) {
            exit();
        }
    });

    return (
        <Box
            width={COLUMNAS}
            height={FILAS}
            flexDirection="column"
            padding={1}
        >
            <Box
                flexDirection="column"
                flexGrow={1}
                borderStyle="round"
                borderColor={COLORES.borde}
                backgroundColor={COLORES.fondo}
                paddingX={1}
            >
                <Box justifyContent="space-between">
                    <Text bold color={COLORES.titulo}>
                        Editor CSV
                    </Text>
                    <Text color={COLORES.acento}>
                        {archivo ? basename(archivo) : 'Sin archivo'}
                    </Text>
                </Box>

                <Text color={COLORES.secundario}>
                    Filas: {datos.length} | Columnas: {cabecera.length}
                </Text>

                <Box marginTop={1}>
                    <Box width={5}>
                        <Text bold color={COLORES.acento}>
                            #
                        </Text>
                    </Box>
                    {cabecera.map((columna, indice) => (
                        <Box key={indice} width={ANCHO_COLUMNA}>
                            <Text bold color={COLORES.acento}>
                                {ajustarTexto(columna, ANCHO_COLUMNA)}
                            </Text>
                        </Box>
                    ))}
                </Box>

                {datos.map((fila, indiceFila) => (
                    <Box key={indiceFila}>
                        <Box width={5}>
                            <Text color={COLORES.secundario}>
                                {indiceFila + 1}
                            </Text>
                        </Box>
                        {fila.map((celda, indiceColumna) => (
                            <Box key={indiceColumna} width={ANCHO_COLUMNA}>
                                <Text color={COLORES.titulo}>
                                    {ajustarTexto(celda, ANCHO_COLUMNA)}
                                </Text>
                            </Box>
                        ))}
                    </Box>
                ))}

                <Box flexGrow={1} alignItems="flex-end">
                    <Text color={COLORES.secundario}>
                        <Text bold color={COLORES.acento}>Esc</Text> salir
                    </Text>
                </Box>
            </Box>
        </Box>
    );
}

const app = render(<App />);

await app.waitUntilExit();

console.clear();
