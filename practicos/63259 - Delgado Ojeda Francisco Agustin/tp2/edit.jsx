#!/usr/bin/env -S node --import tsx

import React, { useEffect, useState } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile } from 'node:fs/promises';
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
