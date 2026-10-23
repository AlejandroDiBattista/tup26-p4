#!/usr/bin/env -S node --import tsx

import React, { useState } from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename, delimiter, format} from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};

const VISIBLE_ROWS = Math.max(1, FILAS - 9);
const COLUMN_GAP = 2;
const LABELS = {
    open: 'Abrir',
    save: 'Guardar',
    edit: 'Editar',
};
const DELIMITER = ',';

function parseDelimited(content) {
    const normalized = content.split('\r\n').join('\n');
    // ["nombre,apellido,edad,salario,departamento", "Paula,Acosta1,48,86200,Ingeniería", "Ignacio,Aguirre,53,109700,Finanzas", ""]
    const allLines = normalized.split('\n');
    
    let lineCount = allLines.length;
    if (lineCount > 0 && allLines[lineCount - 1] === '') {
        lineCount--;
    }

    if (lineCount === 0) {
        throw new Error('El archivo está vacio');
    }

    const lines = [];
    for (const line of allLines.slice(0, lineCount)) {
        lines.push(line);
    }

    // ["nombre,apellido,edad,salario,departamento",  "Paula,Acosta1,48,86200,Ingeniería", "Ignacio,Aguirre,53,109700,Finanzas"]
    // ["nombre", "apellido", "edad", "salario", "departamento"]
    const header = lines[0].split(DEMILITER);

    // [["Paula", "Acosta", 48, 86200, "Ingeniería"],  ["Ignacio", "Aguirre", 53, 109700, "Finanzas"]]
    const rows = [];
    for (const line of lines.slice(1)) {
        rows.push(line.split(DELIMITER));
    }
    
    for (const [index, row] of rows.entries()) {
        if (row.length !== header.length) {
            throw new Error('La fila ' + (index + 1) + ' tiene una cantidad de campos distintas a header');
        }      
    }

    return { header, rows }; 
}   

async function loadCsv(path) {
    let text; 
    
    try {
        text = await readFile(path, 'utf8');
    } catch (error) {
        throw new Error('No se puede leer el archivo: "' + path + '"');
    }
    
    const { header, rows } = parseDelimited(text);

    return { header, rows, fileName: path };
}

function isNumericColumn(rows, column) {
    if (rows.length === 0) {
        return false;
    }

    for (const row of rows) {
        const value = row[column].trim();

        if (value === "" || isNaN(Number(value))) {
            return false; 
        }
    }

    return true;
}

function formatCell(cell, numeric) {
    if (numeric) {
        return Number(cell).toLocaleString('es-AR');
    }
    
    return cell;
}

function measureColumns(header, rows) {
    const columns = [];

    for (let column = 0; column < header.length; column++) {
        const numeric = isNumericColumn(rows, column);

        let width = header[column].length;
        for (const row of rows) {
            width = Math.max(width, formatCell(row[column], numeric).length);
        }

        columns.push({ width, numeric });
    }

    return columns;
}

function sortRows(rows, column, decending) {
    const numeric = isNumericColumn(rows, column);

    const compare = (firstRow, secondRow) => {
        let comparison;

        if (numeric) {
            comparison = Number(firstRow[column]) - Number(secondRow[column]);    
        } else {
            comparison = firstRow[column].localeCompare(secondRow[column], "es");    
        }
        
        if (decending) {
            comparison = -comparison;
        }

        return comparison;
    };

    const rowsToSort = [];
    for (const row of rows) {
        rowsToSort.push(row);
    }

    return rowsToSort.sort(compare);
}

function adjustFirstRow(firstRow, selectedRow) {
    if (selectedRow < firstRow) {
        return selectedRow;
    }
    if (selectedRow >= firstRow + VISIBLE_ROWS) {
        return selectedRow - VISIBLE_ROWS + 1;
    }
    return firstRow;
}

function App({ initialTable, initialMessage }) {
    const {exit} = useApp();
    const [table, setTable] = useState(initialTable);
    const [mode, setMode] = useState(initialTable ? 'view' : 'open');
    const [message, setMessage] = useState(initialMessage);
    const [cursor, setCursor] = useState({ row: 0, column: 0, firstRow: 0 });

    const columns = table ? measureColumns(table.header, table.rows) : [];
    const hasRows = table !== null && table.rows.length > 0;
    const currentValue = hasRows ? table.rows[cursor.row][cursor.column] : '';

    function moveTo(row, column) {
        const newRow = Math.min(Math.max(row, 0), Math.max(table.rows.length - 1, 0));
        const newColumn = Math.min(Math.max(column, 0), table.header.length - 1);
        setCursor({ row: newRow, column: newColumn, firstRow: adjustFirstRow(cursor.firstRow, newRow) });
    }

    function sortBy(decending) {
        setTable({
            ...table,
            rows: sortRows(table.rows, cursor.column, decending)
        });
    }

    function cancel() {
        if (table === null) {
            exit();
            return;
        }
        setMessage(null);
        setMode('view');
    }

    async function openFile(path) {
        try {
            const table = await loadCsv(path);
            
            setTable(table);
            setCursor({ row: 0, column: 0, firstRow: 0 });
            setMessage(null);
            setMode("view");
        } catch (error) {
            setMessage(error.message);
        }
    }

    async function saveFile(path) {
        try {
            await saveCsv(path, table);
            setMessage(null);
            setTable({ ...table, fileName: path});
            setMode('view');
        } catch (error) {
            setMessage(error.message); 
        }
    }

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
        else if (key.upArrow) {
            moveTo(cursor.row - 1, cursor.column);
        }
        else if (key.downArrow) {
            moveTo(cursor.row + 1, cursor.column);
        }
        else if (key.leftArrow) {
            moveTo(cursor.row, cursor.column - 1);
        }
        else if (key.rightArrow) {
            moveTo(cursor.row, cursor.column + 1);
        }
    })

    return (
        <Box width={COLUMNAS} height={FILAS} flexDirection="column" paddingX={1} borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
            <Box justifyContent="space-between">
                <Text bold color={COLORES.titulo}>{table ? basename(table.fileName) : 'Editor CSV'}</Text>
                {table && (
                    <Text color={COLORES.secundario}>{table.rows.length} filas · {table.header.length} columnas</Text>
                )}
            </Box>
            <Text> </Text>
            <Box>
                {mode === 'view' ? (
                    <Text color={COLORES.secundario} wrap="truncate-end">Valor › <Text color={COLORES.titulo}>{currentValue}</Text></Text>
                ) : (
                    <>
                        <Text bold color={COLORES.acento}>{PROMPT_LABELS[mode]} › </Text>
                        <TextInput key={mode} defaultValue={defaultValue} onSubmit={handleSubmit} />
                    </>
                )}
            </Box>
            <Text color={COLORES.acento} wrap="truncate-end">{message || ' '}</Text>
            {table && (
                <Table table={table} columns={columns} cursor={cursor} />
            )}
            <Box flexGrow={1} />
            <Box justifyContent="space-between">
                <Box flexShrink={1}>
                    <Text color={COLORES.secundario} wrap="truncate-end">
                        {hints.map((item, index) => (
                            <Text key={item.key}>
                                {index > 0 ? ' · ' : ''}
                                <Text bold color={COLORES.acento}>{item.key}</Text> {item.label}
                            </Text>
                        ))}
                    </Text>
                </Box>
                {hasRows && (
                    <Box flexShrink={0} marginLeft={2}>
                        <Text color={COLORES.secundario}>Fila {cursor.row + 1} · Columna {cursor.column + 1}</Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

const initialFile = process.argv[2];
let initialTable = null;
let initialMessage = null;

if (initialFile) {
    try {
        initialTable = await loadCsv(initialFile);
    } catch (error) {
        initialMessage = 'Error: ' + error.message;    
    }
}


const app = render(<App initialTable={initialTable} initialMessage={initialMessage} />);
await app.waitUntilExit();
console.clear();