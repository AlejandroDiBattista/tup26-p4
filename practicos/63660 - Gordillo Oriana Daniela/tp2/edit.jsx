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

import React, { useState } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import fs from 'fs';

function cargarCSV(ruta) {
    try {
        if (!fs.existsSync(ruta)) {
            return { headers: ['NOMBRE', 'APELLIDO', 'EDAD', 'SALARIO', 'DEPARTAMENTO'], data: [] };
        }
        const contenido = fs.readFileSync(ruta, 'utf-8');
        const lineas = contenido.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lineas.length === 0) return { headers: [], data: [] };

        const headers = lineas[0].split(',').map(h => h.trim());
        const data = lineas.slice(1).map(l => l.split(',').map(c => c.trim()));
        return { headers, data };
    } catch (e) {
        return { headers: [], data: [] };
    }
}

function Editor() {
    const { exit } = useApp();
    const archivoNombre = process.argv[2] || 'empleados.csv';
    const { headers, data } = cargarCSV(archivoNombre);

    const [selectedRow, setSelectedRow] = useState(0);
    const [selectedCol, setSelectedCol] = useState(0);

    useInput((input, key) => {
        if (key.escape) exit();
        if (key.upArrow) setSelectedRow(prev => Math.max(0, prev - 1));
        if (key.downArrow) setSelectedRow(prev => Math.min(data.length - 1, prev + 1));
        if (key.leftArrow) setSelectedCol(prev => Math.max(0, prev - 1));
        if (key.rightArrow) setSelectedCol(prev => Math.min(headers.length - 1, prev + 1));
    });

    const celdaActual = data[selectedRow]?.[selectedCol] || '';

    return (
        <Box flexDirection="column" padding={1}>
            <Box justifyContent="space-between" marginBottom={1}>
                <Text bold>{archivoNombre}</Text>
                <Text dimColor>{data.length} filas · {headers.length} columnas</Text>
            </Box>

            <Box marginBottom={1}>
                <Text bold color="yellow">Valor {'>'} </Text>
                <Text>{celdaActual}</Text>
            </Box>

            <Box marginBottom={1}>
                <Box width={5}><Text bold color="gray">#</Text></Box>
                {headers.map((col, idx) => (
                    <Box key={idx} width={16}>
                        <Text bold color={selectedCol === idx ? 'yellow' : 'white'}>
                            {col.toUpperCase()}
                        </Text>
                    </Box>
                ))}
            </Box>

            {data.map((row, rIdx) => (
                <Box key={rIdx}>
                    <Box width={5}><Text color="gray">{rIdx + 1}</Text></Box>
                    {row.map((cell, cIdx) => {
                        const activo = rIdx === selectedRow && cIdx === selectedCol;
                        return (
                            <Box key={cIdx} width={16}>
                                <Text color={activo ? 'black' : 'white'} backgroundColor={activo ? 'white' : undefined}>
                                    {cell}
                                </Text>
                            </Box>
                        );
                    })}
                </Box>
            ))}

            <Box marginTop={1} justifyContent="space-between">
                <Text dimColor>
                    <Text bold color="yellow">A</Text> abrir · <Text bold color="yellow">G</Text> guardar · <Text bold color="yellow">Enter</Text> editar · <Text bold color="yellow">Esc</Text> salir
                </Text>
                <Text dimColor>
                    Fila {selectedRow + 1} · Columna {selectedCol + 1}
                </Text>
            </Box>
        </Box>
    );
}

render(<Editor />);
import React, { useState } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import fs from 'fs';

function cargarCSV(ruta) {
    try {
        if (!fs.existsSync(ruta)) {
            return { headers: ['NOMBRE', 'APELLIDO', 'EDAD', 'SALARIO', 'DEPARTAMENTO'], data: [] };
        }
        const contenido = fs.readFileSync(ruta, 'utf-8');
        const lineas = contenido.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lineas.length === 0) return { headers: [], data: [] };

        const headers = lineas[0].split(',').map(h => h.trim());
        const data = lineas.slice(1).map(l => l.split(',').map(c => c.trim()));
        return { headers, data };
    } catch (e) {
        return { headers: [], data: [] };
    }
}

function Editor() {
    const { exit } = useApp();
    const archivoNombre = process.argv[2] || 'empleados.csv';

    const [headers, setHeaders] = useState(() => cargarCSV(archivoNombre).headers);
    const [data, setData] = useState(() => cargarCSV(archivoNombre).data);

    const [selectedRow, setSelectedRow] = useState(0);
    const [selectedCol, setSelectedCol] = useState(0);

    useInput((input, key) => {
        if (key.escape) exit();

        // Navegación con flechas
        if (key.upArrow) setSelectedRow(prev => Math.max(0, prev - 1));
        if (key.downArrow) setSelectedRow(prev => Math.min(data.length - 1, prev + 1));
        if (key.leftArrow) setSelectedCol(prev => Math.max(0, prev - 1));
        if (key.rightArrow) setSelectedCol(prev => Math.min(headers.length - 1, prev + 1));

        // Ordenamiento ascendente con '<' o ','
        if (input === '<' || input === ',') {
            const datosOrdenados = [...data].sort((a, b) => {
                const valA = a[selectedCol] || '';
                const valB = b[selectedCol] || '';
                return valA.localeCompare(valB, undefined, { numeric: true });
            });
            setData(datosOrdenados);
        }

        // Ordenamiento descendente con '>' o '.'
        if (input === '>' || input === '.') {
            const datosOrdenados = [...data].sort((a, b) => {
                const valA = a[selectedCol] || '';
                const valB = b[selectedCol] || '';
                return valB.localeCompare(valA, undefined, { numeric: true });
            });
            setData(datosOrdenados);
        }
    });

    const celdaActual = data[selectedRow]?.[selectedCol] || '';

    return (
        <Box flexDirection="column" padding={1}>
            <Box justifyContent="space-between" marginBottom={1}>
                <Text bold>{archivoNombre}</Text>
                <Text dimColor>{data.length} filas · {headers.length} columnas</Text>
            </Box>

            <Box marginBottom={1}>
                <Text bold color="yellow">Valor {'>'} </Text>
                <Text>{celdaActual}</Text>
            </Box>

            <Box marginBottom={1}>
                <Box width={5}><Text bold color="gray">#</Text></Box>
                {headers.map((col, idx) => (
                    <Box key={idx} width={16}>
                        <Text bold color={selectedCol === idx ? 'yellow' : 'white'}>
                            {col.toUpperCase()}
                        </Text>
                    </Box>
                ))}
            </Box>

            {data.map((row, rIdx) => (
                <Box key={rIdx}>
                    <Box width={5}><Text color="gray">{rIdx + 1}</Text></Box>
                    {row.map((cell, cIdx) => {
                        const activo = rIdx === selectedRow && cIdx === selectedCol;
                        return (
                            <Box key={cIdx} width={16}>
                                <Text color={activo ? 'black' : 'white'} backgroundColor={activo ? 'white' : undefined}>
                                    {cell}
                                </Text>
                            </Box>
                        );
                    })}
                </Box>
            ))}

            <Box marginTop={1} justifyContent="space-between">
                <Text dimColor>
                    <Text bold color="yellow">A</Text> abrir · <Text bold color="yellow">G</Text> guardar · <Text bold color="yellow">Enter</Text> editar · <Text bold color="yellow">{'<'}</Text> asc · <Text bold color="yellow">{'>'}</Text> desc · <Text bold color="yellow">Esc</Text> salir
                </Text>
                <Text dimColor>
                    Fila {selectedRow + 1} · Columna {selectedCol + 1}
                </Text>
            </Box>
        </Box>
    );
}

render(<Editor />);
