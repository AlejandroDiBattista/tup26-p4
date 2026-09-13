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
    seleccion: '#ffffff',
    textoSel:  '#000000',
    fondoSel:  '#2a2218',
};

function parseCSV(texto) {
    const lineas = texto.split(/\r?\n/);
    if (lineas.length > 0 && lineas[lineas.length - 1] === '') {
        lineas.pop();
    }
    if (lineas.length === 0) {
        return {headers: [], rows: []};
    }
    const headers = lineas[0].split(',');
    const rows = lineas.slice(1).map(l => l.split(','));
    return {headers, rows};
}

function serializeCSV(headers, rows) {
    const todas = [headers, ...rows];
    return todas.map(fila => fila.join(',')).join('\n') + '\n';
}

function esNumero(valor) {
    if (typeof valor !== 'string') return false;
    const limpio = valor.trim();
    if (limpio === '') return false;
    return !isNaN(Number(limpio));
}

function App() {
    const {exit} = useApp();
    const [archivo, setArchivo] = useState('');
    const [headers, setHeaders] = useState([]);
    const [rows, setRows] = useState([]);
    const [selectedRow, setSelectedRow] = useState(0);
    const [selectedCol, setSelectedCol] = useState(0);
    const [scrollOffset, setScrollOffset] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        const argArchivo = process.argv.slice(2).find(arg => !arg.startsWith('-'));
        if (argArchivo) {
            cargarArchivo(argArchivo);
        }
    }, []);

    async function cargarArchivo(nombre) {
        try {
            const contenido = await readFile(nombre, 'utf-8');
            const parsed = parseCSV(contenido);
            setArchivo(nombre);
            setHeaders(parsed.headers);
            setRows(parsed.rows);
            setSelectedRow(0);
            setSelectedCol(0);
            setScrollOffset(0);
            setError(null);
        } catch (err) {
            setError('Error al leer el archivo: ' + nombre);
        }
    }

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    }, {isActive: Boolean(process.stdin.isTTY)});

    const colWidths = headers.map((h, colIndex) => {
        let max = h.length;
        for (let r = 0; r < rows.length; r++) {
            const val = rows[r][colIndex] || '';
            if (val.length > max) {
                max = val.length;
            }
        }
        return Math.max(max + 2, 8);
    });

    const isColNumeric = headers.map((_, colIndex) => {
        if (rows.length === 0) return false;
        return rows.every(r => esNumero(r[colIndex] || ''));
    });

    const maxLineasVisibles = Math.max(FILAS - 9, 8);
    const visibleRows = rows.slice(scrollOffset, scrollOffset + maxLineasVisibles);
    const valorCelda = rows[selectedRow]?.[selectedCol] ?? '';

    return (
        <Box width={COLUMNAS} height={FILAS} flexDirection="column" paddingX={2} paddingY={1}>
            <Box justifyContent="space-between">
                <Text bold color={COLORES.titulo}>{archivo ? basename(archivo) : 'Sin archivo'}</Text>
                <Text color={COLORES.secundario}>{rows.length} filas · {headers.length} columnas</Text>
            </Box>

            <Box marginY={1}>
                <Text color={COLORES.secundario}>Valor › </Text>
                <Text bold color={COLORES.titulo}>{valorCelda}</Text>
            </Box>

            {error && (
                <Box marginBottom={1}>
                    <Text color="red">{error}</Text>
                </Box>
            )}

            <Box flexDirection="column" flexGrow={1}>
                {headers.length > 0 && (
                    <Box marginBottom={1}>
                        <Box width={5} justifyContent="flex-end">
                            <Text color={COLORES.secundario}>#  </Text>
                        </Box>
                        {headers.map((h, i) => {
                            const isSelected = i === selectedCol;
                            const ancho = colWidths[i];
                            const nombreCol = h.toUpperCase();
                            return (
                                <Box key={i} width={ancho}>
                                    <Text
                                        bold={isSelected}
                                        color={isSelected ? COLORES.acento : COLORES.secundario}
                                        backgroundColor={isSelected ? COLORES.fondoSel : undefined}
                                    >
                                        {isColNumeric[i] ? nombreCol.padStart(ancho - 1) + ' ' : nombreCol.padEnd(ancho)}
                                    </Text>
                                </Box>
                            );
                        })}
                    </Box>
                )}

                {visibleRows.map((fila, indexRelativo) => {
                    const indiceFila = scrollOffset + indexRelativo;
                    const esFilaSeleccionada = indiceFila === selectedRow;

                    return (
                        <Box key={indiceFila}>
                            <Box width={5} justifyContent="flex-end">
                                <Text
                                    bold={esFilaSeleccionada}
                                    color={esFilaSeleccionada ? COLORES.acento : COLORES.secundario}
                                    backgroundColor={esFilaSeleccionada ? COLORES.fondoSel : undefined}
                                >
                                    {String(indiceFila + 1).padStart(3)}  
                                </Text>
                            </Box>

                            {headers.map((_, colIndex) => {
                                const esCeldaSeleccionada = esFilaSeleccionada && colIndex === selectedCol;
                                const ancho = colWidths[colIndex];
                                const valor = fila[colIndex] || '';
                                const formateado = isColNumeric[colIndex]
                                    ? valor.padStart(ancho - 1) + ' '
                                    : valor.padEnd(ancho);

                                return (
                                    <Box key={colIndex} width={ancho}>
                                        <Text
                                            color={esCeldaSeleccionada ? COLORES.textoSel : COLORES.titulo}
                                            backgroundColor={esCeldaSeleccionada ? COLORES.seleccion : undefined}
                                        >
                                            {formateado}
                                        </Text>
                                    </Box>
                                );
                            })}
                        </Box>
                    );
                })}
            </Box>

            <Box justifyContent="space-between" marginTop={1}>
                <Text color={COLORES.secundario}>
                    <Text bold color={COLORES.acento}>A</Text> abrir · <Text bold color={COLORES.acento}>G</Text> guardar · <Text bold color={COLORES.acento}>Enter</Text> editar · <Text bold color={COLORES.acento}>&lt;</Text> ascendente · <Text bold color={COLORES.acento}>&gt;</Text> descendente · <Text bold color={COLORES.acento}>Esc</Text> salir
                </Text>
                <Text color={COLORES.secundario}>
                    Fila {rows.length > 0 ? selectedRow + 1 : 0} · Columna {headers.length > 0 ? selectedCol + 1 : 0}
                </Text>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();