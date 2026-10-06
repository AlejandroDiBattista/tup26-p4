#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { TextInput } from '@inkjs/ui';
import { readFile, writeFile } from 'node:fs/promises';
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
    darkText:   '#000000',
};

const parseCSV = (content) => {
    const lines = content.trim().replace(/\r/g, '').split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map(line => line.split(','));
    return { headers, rows };
};

function App({ fileNameInitial }) {
    const { exit } = useApp();

    const [fileName, setFileName] = useState(fileNameInitial ? basename(fileNameInitial) : '');
    const [headers, setHeaders] = useState([]);
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');

    const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });
    const [rowOffset, setRowOffset] = useState(0);
    const VISIBLE_ROWS = 12;

    const [mode, setMode] = useState('normal');
    const [inputValue, setInputValue] = useState('');

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
            setActiveCell({ row: 0, col: 0 });
            setRowOffset(0);
        } catch (err) {
            setError(`Error al leer: ${err.message}`);
        }
    };

    const sortRows = (colIndex, direction) => {
        const sortedRows = [...rows].sort((a, b) => {
            const valA = a[colIndex];
            const valB = b[colIndex];
            
            const numA = Number(valA);
            const numB = Number(valB);
            
            if (!isNaN(numA) && !isNaN(numB)) {
                return direction === 'asc' ? numA - numB : numB - numA;
            }
            
            return direction === 'asc' 
                ? valA.localeCompare(valB) 
                : valB.localeCompare(valA);
        });
        setRows(sortedRows);
    };

    useInput((input, key) => {
        if (key.escape) {
            if (mode !== 'normal') {
                setMode('normal');
                return;
            }
            exit();
        }

        if (mode !== 'normal') return;

        if (input.toLowerCase() === 'a') {
            setMode('open');
            setInputValue('');
            return;
        }

        if (headers.length > 0) {
            if (input.toLowerCase() === 'g') {
                setMode('save');
                setInputValue(fileName);
                return;
            }
            
            if (key.return) {
                setMode('edit');
                setInputValue(rows[activeCell.row][activeCell.col]);
                return;
            }
                
            if (input === '<') sortRows(activeCell.col, 'asc');
            if (input === '>') sortRows(activeCell.col, 'desc');

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
        }
    });

    const handleSubmit = async (value) => {
        if (mode === 'edit') {
            const updatedRows = [...rows];
            updatedRows[activeCell.row][activeCell.col] = value;
            setRows(updatedRows);
        } else if (mode === 'open') {
            await uploadFile(value);
        } else if (mode === 'save') {
            try {
                const csvContent = [
                    headers.join(','),
                    ...rows.map(r => r.join(','))
                ].join('\n');
                await writeFile(value, csvContent, 'utf-8');
                setFileName(basename(value));
                setError('');
            } catch (err) {
                setError(`Error al guardar: ${err.message}`);
            }
        }
        setMode('normal');
    };

    const currentValue = (rows.length > 0 && rows[activeCell.row]) 
        ? rows[activeCell.row][activeCell.col] 
        : '...';
        
    const visibleRows = rows.slice(rowOffset, rowOffset + VISIBLE_ROWS);

    return (
        <Box width={COLUMNS} height={ROWS} flexDirection="column" backgroundColor={COLORS.background}>
            
            <Box justifyContent="space-between" paddingX={1}>
                <Text bold color={COLORS.title}>{fileName || 'Sin archivo'}</Text>
                {headers.length > 0 && (
                    <Text color={COLORS.secondary}>
                        {rows.length} filas · {headers.length} columnas
                    </Text>
                )}
            </Box>

            <Box paddingX={1} marginY={1}>
                {mode === 'normal' && (
                    <Text color={COLORS.secondary}>Valor › <Text color={COLORS.title}>{currentValue}</Text></Text>
                )}
                {mode === 'edit' && (
                    <>
                        <Text color={COLORS.secondary}>Valor › </Text>
                        <Box backgroundColor={COLORS.highlight}>
                            <TextInput value={inputValue} onChange={setInputValue} onSubmit={handleSubmit} />
                        </Box>
                    </>
                )}
                {mode === 'save' && (
                    <>
                        <Text bold color={COLORS.accent}>Guardar › </Text>
                        <TextInput value={inputValue} onChange={setInputValue} onSubmit={handleSubmit} />
                    </>
                )}
                {mode === 'open' && (
                    <>
                        <Text bold color={COLORS.accent}>Abrir › </Text>
                        <TextInput value={inputValue} onChange={setInputValue} onSubmit={handleSubmit} />
                    </>
                )}
            </Box>
            
            <Box flexGrow={1} flexDirection="column" paddingX={1}>
                {error ? (
                    <Text color="red">{error}</Text>
                ) : headers.length > 0 ? (
                    <>
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
                                                backgroundColor={isCellActive ? COLORS.highlight : undefined}
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

            <Box justifyContent="space-between" paddingX={1}>
                {mode === 'normal' ? (
                    <Text color={COLORS.secondary}>
                        <Text bold color={COLORS.accent}>A</Text> abrir · <Text bold color={COLORS.accent}>G</Text> guardar · <Text bold color={COLORS.accent}>Enter</Text> editar · <Text bold color={COLORS.accent}>&lt;</Text> ascendente · <Text bold color={COLORS.accent}>&gt;</Text> descendente · <Text bold color={COLORS.accent}>Esc</Text> salir
                    </Text>
                ) : (
                    <Text color={COLORS.secondary}>
                        <Text bold color={COLORS.accent}>Enter</Text> {mode === 'open' ? 'abrir' : mode === 'save' ? 'guardar' : 'editar'} · <Text bold color={COLORS.accent}>Esc</Text> cancelar
                    </Text>
                )}
                
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
