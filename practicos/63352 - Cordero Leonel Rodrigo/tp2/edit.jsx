#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

const COLUMNS = process.stdout.columns || 80;
const ROWS    = process.stdout.rows || 24;

const COLORS = {
    background: '#161310',
    border:     '#726b61',
    title:      '#ede7db',
    secondary:  '#ada79e',
    accent:     '#edbb64',
    highlight:  '#ffffff',
    darkText:   '#000000', // Agregado para el texto de la celda activa
};

const parseCSV = (content) => {
    // FIX: Eliminamos \r para evitar glitches en la terminal por archivos guardados en Windows
    const lines = content.trim().replace(/\r/g, '').split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map(line => line.split(','));
    return { headers, rows };
};

// FIX: Recibimos fileNameInitial como prop
function App({ fileNameInitial }) {
    const { exit } = useApp();

    const [fileName, setFileName] = useState(fileNameInitial ? basename(fileNameInitial) : '');
    const [headers, setHeaders] = useState([]);
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');

    // --- ESTADOS PARA NAVEGACIÓN Y SCROLL ---
    const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });
    const [rowOffset, setRowOffset] = useState(0);
    const VISIBLE_ROWS = 12;

    useEffect(() => {
        if (fileNameInitial) {
            uploadFile(fileNameInitial);
        }
    }, [fileNameInitial]);

    const uploadFile = async (path) => {
        try {
            const content = await readFile(path, 'utf-8');
            const data = parseCSV(content);
            setHeaders(data.headers);
            setRows(data.rows);
            setFileName(basename(path));
            setError('');
            // Reiniciamos posición al cargar un archivo nuevo
            setActiveCell({ row: 0, col: 0 });
            setRowOffset(0);
        } catch (err) {
            setError(`Error al leer: ${err.message}`);
        }
    };
    
    // --- LÓGICA DE TECLADO ---
    useInput((input, key) => {
        if (key.escape) {
            exit();
        }

        if (headers.length === 0) return;

        if (key.upArrow) {
            setActiveCell(prev => {
                const newRow = Math.max(0, prev.row - 1);
                if (newRow < rowOffset) setRowOffset(newRow);
                return { ...prev, row: newRow };
            });
        }
        if (key.downArrow) {
            setActiveCell(prev => {
                const newRow = Math.min(rows.length - 1, prev.row + 1);
                if (newRow >= rowOffset + VISIBLE_ROWS) {
                    setRowOffset(newRow - VISIBLE_ROWS + 1);
                }
                return { ...prev, row: newRow };
            });
        }
        if (key.leftArrow) {
            setActiveCell(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
        }
        if (key.rightArrow) {
            setActiveCell(prev => ({ ...prev, col: Math.min(headers.length - 1, prev.col + 1) }));
        }
    });

    // Cálculos para la interfaz
    const currentValue = (rows.length > 0 && rows[activeCell.row]) 
        ? rows[activeCell.row][activeCell.col] 
        : '...';
        
    const visibleRows = rows.slice(rowOffset, rowOffset + VISIBLE_ROWS);

    return (
        <Box width={COLUMNS} height={ROWS} flexDirection="column" backgroundColor={COLORS.background}>
            
            {/* CABECERA */}
            <Box justifyContent="space-between" paddingX={1}>
                <Text bold color={COLORS.title}>{fileName || 'Sin archivo'}</Text>
                {headers.length > 0 && (
                    <Text color={COLORS.secondary}>
                        {rows.length} filas · {headers.length} columnas
                    </Text>
                )}
            </Box>

            {/* VALOR ACTUAL */}
            <Box paddingX={1} marginY={1}>
                <Text color={COLORS.secondary}>Valor › <Text color={COLORS.title}>{currentValue}</Text></Text>
            </Box>
            
            {/* TABLA DE DATOS */}
            <Box flexGrow={1} flexDirection="column" paddingX={1}>
                {error ? (
                    <Text color="red">{error}</Text>
                ) : headers.length > 0 ? (
                    <>
                        {/* Headers */}
                        <Box>
                            <Box width={5}><Text color={COLORS.secondary}>#</Text></Box>
                            {headers.map((h, i) => {
                                const isColActive = i === activeCell.col;
                                return (
                                    <Box key={i} width={15}>
                                        <Text bold color={isColActive ? COLORS.accent : COLORS.secondary} wrap="truncate">
                                            {h.toUpperCase()}
                                        </Text>
                                    </Box>
                                )
                            })}
                        </Box>

                        {/* Filas con Paginación Visual */}
                        {visibleRows.map((row, relativeIndex) => {
                            const rowIndex = rowOffset + relativeIndex;
                            const isRowActive = rowIndex === activeCell.row;

                            return (
                                <Box key={rowIndex}>
                                    <Box width={5}>
                                        <Text bold={isRowActive} color={isRowActive ? COLORS.accent : COLORS.secondary}>
                                            {rowIndex + 1}
                                        </Text>
                                    </Box>
                                    {row.map((cell, colIndex) => {
                                        const isCellActive = isRowActive && colIndex === activeCell.col;
                                        
                                        return (
                                            <Box 
                                                key={colIndex} 
                                                width={15} 
                                                backgroundColor={isCellActive ? COLORS.highlight : 'transparent'}
                                            >
                                                <Text 
                                                    color={isCellActive ? COLORS.darkText : COLORS.title} 
                                                    wrap="truncate"
                                                >
                                                    {cell}
                                                </Text>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            );
                        })}
                    </>
                ) : (
                    <Text color={COLORS.secondary}>Presiona 'A' para abrir un archivo CSV.</Text>
                )}
            </Box>

            {/* PIE DE PÁGINA */}
            <Box justifyContent="space-between" paddingX={1}>
                <Text color={COLORS.secondary}>
                    <Text bold color={COLORS.accent}>A</Text> abrir · <Text bold color={COLORS.accent}>G</Text> guardar · <Text bold color={COLORS.accent}>Enter</Text> editar · <Text bold color={COLORS.accent}>&lt;</Text> ascendente · <Text bold color={COLORS.accent}>&gt;</Text> descendente · <Text bold color={COLORS.accent}>Esc</Text> salir
                </Text>
                {headers.length > 0 ? (
                    <Text color={COLORS.secondary}>
                        Fila {activeCell.row + 1} · Columna {activeCell.col + 1}
                    </Text>
                ) : (
                    <Text color={COLORS.secondary}>Fila - · Columna -</Text>
                )}
            </Box>

        </Box>
    );
}

const fileNameInitial = process.argv[2];
const app = render(<App fileNameInitial={fileNameInitial} />);
await app.waitUntilExit();
console.clear();