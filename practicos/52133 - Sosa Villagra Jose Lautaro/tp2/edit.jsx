#!/usr/bin/env -S node --import tsx

import React from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename, delimiter} from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};

const TABLE_WIDTH = COLUMNAS - 4;
const VISIBLE_ROWS = Math.max(1, FILAS - 9);
const COLUMN_GAP = 2;
const PROMPT_LABELS = {
    open: "Abrir",
    save: "Guardar",
    edit: "Editar",
}
const DELIMITER = ",";

function parseCsv(Text) {
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
		if (row.length !== columnCount) {
			throw new Error(
				"la fila " +
				(index + 1) +
				" tiene una cantidad de campos distinta a las demás",
			);
		}
	}

    return { header, rows }
}

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
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();

