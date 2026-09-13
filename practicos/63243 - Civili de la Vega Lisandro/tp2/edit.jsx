#!/usr/bin/env -S node --import tsx

import React from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

// convierto archivo a csv
function parseCSV(texto) {
    // saco posibles saltos de linea windows y lineas vacias al final
    const lineas = texto.replace(/\r/g, '').split('\n').filter(l => l.length > 0);

    const cabecera = lineas[0].split(',');
    const filas = [];
    for (let i = 1; i < lineas.length; i++) {
        filas.push(lineas[i].split(','));
    }

    return {cabecera, filas};
}

// armo el texto del csv a partir de la cabecera y las filas
function serializeCSV(cabecera, filas) {
    let texto = cabecera.join(',') + '\n';
    for (const fila of filas) {
        texto += fila.join(',') + '\n';
    }
    return texto;
}

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};


// calculo ancho de cada columna dependiendo de cabecera y celdas. Tambien tiene tope
function calcularAnchos(cabecera, filas) {
    const anchos = cabecera.map(c => c.length);

    for (const fila of filas) {
        for (let c = 0; c < fila.length; c++) {
            if (fila[c].length > anchos[c]) {
                anchos[c] = fila[c].length;
            }
        }
    }

    return anchos.map(a => Math.min(a, 20));
}

// funcion para dibujar la tabal con cabecera arriba y filas ennumeradas abajo
function Tabla({nombreArchivo, cabecera, filas}) {
    const anchos = calcularAnchos(cabecera, filas);
    const anchoNumero = String(filas.length).length + 1;

    return (
        <Box flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
            <Text color={COLORES.titulo} bold> {nombreArchivo} ({filas.length} filas, {cabecera.length} columnas)</Text>

            <Box>
                <Text> </Text>
                <Box width={anchoNumero}><Text> </Text></Box>
                {cabecera.map((col, i) => (
                    <Box key={i} width={anchos[i] + 2}>
                        <Text bold color={COLORES.acento}>{col}</Text>
                    </Box>
                ))}
            </Box>

            {filas.map((fila, f) => (
                <Box key={f}>
                    <Text> </Text>
                    <Box width={anchoNumero}><Text color={COLORES.secundario}>{f + 1}</Text></Box>
                    {fila.map((valor, c) => (
                        <Box key={c} width={anchos[c] + 2}>
                            <Text color={COLORES.titulo}>{valor}</Text>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
}

function App({nombreArchivo, cabecera, filas}) {
    const {exit} = useApp();

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    })

    return (
        <Box width={COLUMNAS} flexDirection="column">
            <Tabla nombreArchivo={nombreArchivo} cabecera={cabecera} filas={filas} />
        </Box>
    );
}

// cargo archivo que viene por argumento en la terminal
const nombreArchivo = process.argv[2] || 'empleados.csv';
const textoArchivo = await readFile(nombreArchivo, 'utf-8');
const {cabecera, filas} = parseCSV(textoArchivo);

const app = render(<App nombreArchivo={basename(nombreArchivo)} cabecera={cabecera} filas={filas} />);
await app.waitUntilExit();
console.clear();