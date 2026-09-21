#!/usr/bin/env -S node --import tsx

<<<<<<< HEAD
import React from 'react';
=======
import React, { useState } from 'react';
>>>>>>> parent of 5a1b03e (Delete practicos/52133 - Sosa Villagra Jose Lautaro/tp2/edit.jsx)
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

<<<<<<< HEAD
function App() {
    const {exit} = useApp();
    
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
=======
const TABLE_WIDTH = COLUMNAS - 4;
const VISIBLE_ROWS = Math.max(1, FILAS - 9);
const COLUMN_GAP = 2;
const PROMPT_LABELS = {
    open: "Abrir",
    save: "Guardar",
    edit: "Editar",
}
const DELIMITER = ",";

function parseCsv(text) {
    const normalized = text.split("\r\n").join("\n");
    const allLines = normalized.split("\n");
    
    let lineCount = allLines.length;
    if (lineCount > 0 && allLines[lineCount - 1] === "") {
        lineCount--;
    }
    
    if (lineCount === 0) {
        throw new Error("El archivo esta vacio");
    }

    const lines = [];

    for (const line of allLines.slice(0, lineCount)) {
        lines.push(line);
    }

    // ["nombre,apellido,edad,salario,departamento",  "Paula,Acosta1,48,86200,Ingeniería", "Ignacio,Aguirre,53,109700,Finanzas"]
    // ["nombre", "apellido", "edad", "salario", "departamento"]
    const header = lines[0].split(DELIMITER);

    const rows = [];
    for (const line of lines.slice(1)) {
        rows.push(line.split(DELIMITER));
    }

    for (const [index, row] of rows.entries()) {
		if (row.length !== header.length) {
			throw new Error(
				"la fila " +
				(index + 1) +
				" tiene una cantidad de campos distinta a las demás",
			);
		}
	}

    return { header, rows }
}

function isNumericColumn(rows, column) {
    if (rows.length === 0) {
        return false;
    }

    for (const row of rows) {
        const value = row[column].trim();
        if (value === "" || Number.isNaN(Number(value))) {
            return false;
        }
    }

    return true;
}

// Asignar dinamicamente un valor true o false segun las filas y la columna
function sortRows(rows, column, descending) {
    const numeric = isNumericColumn(rows, column);
    
    const compare = (firstRow, secondRow) => {
        const firstValue = firstRow[column];
        const secondValue = secondRow[column];
        let comparison;

        if (numeric) {
            comparison = Number(firstValue) - Number(secondValue)
        }
        else {
            comparison = firstValue.localeCompare(secondValue, "es");
        }

        if (descending) {
            comparison = -comparison; 
        }

        return comparison;
    }

    const rowsToSort = [];
    for (const row of rows) {
        rowsToSort.push(row);
    }

    return rowsToSort.sort(compare);
}

function serialize(header, rows) {
    const lines = [];
    lines.push(header.join(DELIMITER));
    
    
    for (const row of rows) {
        lines.push(row.join(DELIMITER));
    }

    return lines.join("\n");
}

function formatCell(value, numeric){
    if (numeric) {
        return Number(value).toLocaleString("es-AR");
    }
    return value;
}

function measureColumns(header, rows) {
    const columns = [];
    for (let column = 0; column < header.length; column++) {
        const numeric = isNumericColumn(rows, column);
        let width = header[column].length;
        for (const row of rows) {
            width = Math.max(width, formatCell(row[column], numeric).length);
        }
        columns.push({ numeric, width });
    }
    return columns;
}

async function loadCsv(path) {
    let text;

    try {
        text = await readFile(path, 'utf8');
    } catch (error) {
        throw new Error('no se pudo leer el archivo: "' + path + '"');
    }

    const table = parseCsv(text);
    
    return {
        fileName: path,
        header: table.header,
        rows: table.rows,
    }
}

async function saveCsv(path, header, rows) {
    try {
        await writeFile(path, serialize(header, rows), 'utf8');
    } catch (error) {
        throw new Error('no se pudo escribir el archivo: "' + path + '"');
    }
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

function Table({ table, columns, cursor }) {
    const numberWidth = String(table.rows.length).length + 3;
    const shownRows = table.rows.slice(cursor.firstRow, cursor.firstRow + VISIBLE_ROWS);
    
    return (
        <Box flexDirection="column">
            <Box>
                <Box width={numberWidth} marginRight={COLUMN_GAP} justifyContent="flex-end">
                    <Text bold color={COLORES.secundario}>#</Text>
                </Box>
                {table.header.map((name, column) => (
                    <Box key={column} width={columns[column].width} marginRight={COLUMN_GAP} justifyContent={columns[column].numeric ? 'flex-end' : 'flex-start'}>
                        <Text bold color={column === cursor.column ? COLORES.acento : COLORES.secundario}>{name.toUpperCase()}</Text>
                    </Box>
                ))}
            </Box>
            {shownRows.map((row, index) => {
                const rowIndex = cursor.firstRow + index;
                const selectedRow = rowIndex === cursor.row;
                return (
                    <Box key={rowIndex}>
                        <Box width={numberWidth} marginRight={COLUMN_GAP} justifyContent="flex-end">
                            <Text bold={selectedRow} color={selectedRow ? COLORES.acento : COLORES.secundario}>{rowIndex + 1}</Text>
                        </Box>
                        {row.map((value, column) => {
                            const selected = selectedRow && column === cursor.column;
                            return (
                                <Box key={column} width={columns[column].width} marginRight={COLUMN_GAP} justifyContent={columns[column].numeric ? 'flex-end' : 'flex-start'} backgroundColor={selected ? COLORES.titulo : undefined}>
                                    <Text bold={selected} color={selected ? COLORES.fondo : COLORES.titulo}>{formatCell(value, columns[column].numeric)}</Text>
                                </Box>
                            );
                        })}
                    </Box>
                );
            })}
        </Box>
    );
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

    function sortBy(descending) {
        setTable({
            ...table,
            rows: sortRows(table.rows, cursor.column, descending),
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
            const newTable = await loadCsv(path);
            setTable(newTable);
            setCursor({ row: 0, column: 0, firstRow: 0 });
            setMessage(null);
            setMode('view');
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    }

    async function saveFile(path) {
        try {
            await saveCsv(path, table.header, table.rows);
            setTable({ ...table, fileName: path });
            setMessage(null);
            setMode('view');
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    }

    function editCell(value) {
        const newRow = [...table.rows[cursor.row]];
        newRow[cursor.column] = value;
        const newRows = [...table.rows];
        newRows[cursor.row] = newRow;
        setTable({ ...table, rows: newRows });
        setMessage(null);
        setMode('view');
    }

    function handleSubmit(value) {
        if (mode === 'edit') {
            editCell(value);
        }
        else if (mode === 'open') {
            openFile(value);
        }
        else {
            saveFile(value);
        }
    }

    useInput((input, key) => {
        if (mode !== 'view') {
            if (key.escape) {
                cancel();
            }
            return;
        }

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
        else if (input === '<') {
            sortBy(false);
        }
        else if (input === '>') {
            sortBy(true);
        }
        else if (input === 'a' || input === 'A') {
            setMessage(null);
            setMode('open');
        }
        else if (input === 'g' || input === 'G') {
            setMessage(null);
            setMode('save');
        }
        else if (key.return && hasRows) {
            setMessage(null);
            setMode('edit');
        }
    })

    let defaultValue = '';
    if (mode === 'save') {
        defaultValue = table.fileName;
    }
    else if (mode === 'edit') {
        defaultValue = currentValue;
    }

    let hints = [
        { key: 'A', label: 'abrir' },
        { key: 'G', label: 'guardar' },
        { key: 'Enter', label: 'editar' },
        { key: '<', label: 'ascendente' },
        { key: '>', label: 'descendente' },
        { key: 'Esc', label: 'salir' },
    ];
    if (mode !== 'view') {
        hints = [
            { key: 'Enter', label: PROMPT_LABELS[mode].toLowerCase() },
            { key: 'Esc', label: table ? 'cancelar' : 'salir' },
        ];
    }

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
>>>>>>> parent of 5a1b03e (Delete practicos/52133 - Sosa Villagra Jose Lautaro/tp2/edit.jsx)
            </Box>
        </Box>
    );
}

<<<<<<< HEAD
const app = render(<App />);
await app.waitUntilExit();
console.clear();
=======
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
>>>>>>> parent of 5a1b03e (Delete practicos/52133 - Sosa Villagra Jose Lautaro/tp2/edit.jsx)
