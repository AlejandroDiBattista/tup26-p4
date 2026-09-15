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

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    })

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


import fs from 'fs';
export function loadCSV(filePath) {
    try {
        // Leemos el archivo en texto plano
        const content = fs.readFileSync(filePath, 'utf-8');

        // Separamos por líneas y eliminamos líneas vacías
        const lines = content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (lines.length === 0) {
            return { error: 'El archivo está vacío' };
        }

        // La primera línea contiene los encabezados
        const headers = lines[0].split(',').map(h => h.trim());

        // Las demás líneas son los datos
        const data = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));

        return { headers, data, error: null };
    } catch (err) {
        return { error: `No se pudo abrir el archivo: ${err.message}` };
    }
}

// Función para guardar los datos de vuelta a un archivo CSV
export function saveCSV(filePath, headers, data) {
    try {
        // Unimos la cabecera
        const headerLine = headers.join(',');

        // Unimos cada fila de datos por coma
        const dataLines = data.map(row => row.join(','));

        // Combinamos todo en un solo string
        const fullContent = [headerLine, ...dataLines].join('\n');

        // Escribimos el archivo en disco
        fs.writeFileSync(filePath, fullContent, 'utf-8');
        return { success: true, error: null };
    } catch (err) {
        return { success: false, error: `Error al guardar: ${err.message}` };
    }
}
import React, { useState } from 'react';
import { Box, Text } from 'ink';

export default function App({ initialFilePath = 'empleados.csv', initialHeaders = [], initialData = [] }) {
    const [filePath, setFilePath] = useState(initialFilePath);
    const [headers, setHeaders] = useState(initialHeaders);
    const [data, setData] = useState(initialData);

    // Posición actual de la celda seleccionada
    const [selectedRow, setSelectedRow] = useState(0);
    const [selectedCol, setSelectedCol] = useState(0);

    // Valor de la celda seleccionada actualmente
    const currentCellValue = data[selectedRow]?.[selectedCol] || '';

    return (
        <Box flexDirection="column" padding={1}>
            {/* Encabezado: Nombre del archivo y totales */}
            <Box justifyContent="space-between" marginBottom={1}>
                <Text bold>{filePath}</Text>
                <Text dimColor>{data.length} filas · {headers.length} columnas</Text>
            </Box>

            {/* Muestra el valor de la celda enfocada arriba de la tabla */}
            <Box marginBottom={1}>
                <Text bold color="yellow">Valor {'>'} </Text>
                <Text>{currentCellValue}</Text>
            </Box>

            {/* Cabecera de la tabla */}
            <Box marginBottom={1}>
                <Box width={5}>
                    <Text bold color="gray">#</Text>
                </Box>
                {headers.map((col, colIndex) => (
                    <Box key={colIndex} width={18}>
                        <Text bold color={selectedCol === colIndex ? 'yellow' : 'white'}>
                            {col.toUpperCase()}
                        </Text>
                    </Box>
                ))}
            </Box>

            {/* Filas de la tabla */}
            {data.map((row, rowIndex) => (
                <Box key={rowIndex}>
                    {/* Número de fila */}
                    <Box width={5}>
                        <Text color="gray">{rowIndex + 1}</Text>
                    </Box>

                    {/* Celdas de la fila */}
                    {row.map((cell, colIndex) => {
                        const isSelected = rowIndex === selectedRow && colIndex === selectedCol;
                        return (
                            <Box key={colIndex} width={18}>
                                <Text
                                    color={isSelected ? 'black' : 'white'}
                                    backgroundColor={isSelected ? 'white' : undefined}
                                >
                                    {cell}
                                </Text>
                            </Box>
                        );
                    })}
                </Box>
            ))}

            {/* Barra de atajos e instrucciones abajo */}
            <Box marginTop={1} justifyContent="space-between">
                <Text dimColor>
                    <Text bold color="yellow">A</Text> abrir · <Text bold color="yellow">G</Text> guardar · <Text bold color="yellow">Enter</Text> editar · <Text bold color="yellow">{'<'}</Text> ascendente · <Text bold color="yellow">{'>'}</Text> descendente · <Text bold color="yellow">Esc</Text> salir
                </Text>
                <Text dimColor>
                    Fila {selectedRow + 1} · Columna {selectedCol + 1}
                </Text>
            </Box>
        </Box>
    );
}