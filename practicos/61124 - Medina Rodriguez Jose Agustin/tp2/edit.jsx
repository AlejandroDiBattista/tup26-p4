#!/usr/bin/env -S node --import tsx

import React from 'react';
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

function convertirCsv(contenido) {
    if (contenido.trim() === '') {
        throw new Error('El archivo CSV está vacío');
    }

    const lineas = contenido.trimEnd().split(/\r?\n/);
    const cabecera = lineas[0].split(',');

    if (cabecera.some(celda => celda.trim() === '')) {
        throw new Error('La cabecera contiene columnas sin nombre');
    }

    const filas = lineas.slice(1).map((linea, indice) => {
        if (linea.trim() === '') {
            throw new Error(`La fila ${indice + 1} está vacía`);
        }

        const fila = linea.split(',');

        if (fila.length !== cabecera.length) {
            throw new Error(
                `La fila ${indice + 1} tiene ${fila.length} columnas; se esperaban ${cabecera.length}`
            );
        }

        return fila;
    });

    return {cabecera, filas};
}

function App({cabecera, filas}) {
    const {exit} = useApp();
    
    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    })

    return (
        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
            <Box width={40} height={10} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
                <Box
                    flexGrow={1}
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                > 
                   <Text bold color={COLORES.titulo}>Editor CSV</Text>
                   <Text color={COLORES.secundario}>
                        {filas.length} filas · {cabecera.length} columnas
                   </Text>
               </Box>
                <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>
            </Box>
        </Box>
    );
}

let cabecera;
let filas;

try {
    const contenido = await readFile('empleados.csv', 'utf8');
    ({cabecera, filas} = convertirCsv(contenido));
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
}
const app = render(<App cabecera={cabecera} filas={filas} />);

await app.waitUntilExit();

console.clear();
