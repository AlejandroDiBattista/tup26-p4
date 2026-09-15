#!/usr/bin/env -S node --import tsx

import React, { useState } from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';
import fs from "node:fs"

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};

let params = process.argv.slice(2)

//Funcion para mostar errores en consola
const showConsoleError = (message) => {
    console.error(`Error: ${message}`)
    process.exit(1)
}

//Funcion para validar el nombre del archivo
const validFileName = (fileName) => {
        let fileType = fileName.split('.').pop().toLowerCase()
        if(fileType !== 'csv'){
            return false
        }
        
        return true
    }

//Funcion para convertir el texto en filas y columnas.
const parseDelimited = (text, delimiter) => {
    const cleanText = text.replace(/\r/g, "").trim();

    let data = cleanText.split("\n")

    data = data.map(e => e.split(delimiter))

    for (const element of data) {
        if (data[0].length != element.length) {
            showConsoleError("Todas las filas tiene que tener la misma cantidad de campos.")
        }
    }

    return data
}

//Funcion para leer el archivo
const readInput = (inputFile) => {
    try {
        const data = fs.readFileSync(inputFile, 'utf-8')
        if (data.includes('"')) {
            showConsoleError("El archivo no puede contener comillas")
        }
        return data
    } catch (error) {
        showConsoleError(error.message)
    }
}

//Funcion completa para manejo del csv
const CompleteFileExtraction = (fileName) => {
    if (!validFileName(fileName)) {
        showConsoleError("El tipo de archivo no es .csv")
    }

    let fileData = readInput(fileName)

    let fileArray = parseDelimited(fileData, ',')

    return fileArray
}

//Si se ajecuta con el nombre del archivo hacer:
let finishList = []
if (params[0] !== undefined) {
    const fileName = params.shift()
    finishList = CompleteFileExtraction(fileName)
}

const COL_WIDTH = 14;

function App() {
    const {exit} = useApp();

    const [listData, setListData] = useState(finishList ?? [])
    const [listStart, setListStart] = useState(1)

    const visibleRows = 10

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    })

    const totalCol = listData[0]?.length || 1;
    const tableWidth = Math.max(40, totalCol * COL_WIDTH + 4);

    return (
        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
            <Box 
                width={tableWidth}  
                flexDirection="column" 
                borderStyle="round" 
                borderColor={COLORES.borde} 
                backgroundColor={COLORES.fondo}
                padding={1}
            >
                {/* Header */}
                <Box flexGrow={1} justifyContent="center" alignItems="center">
                    <Text bold color={COLORES.titulo}>Editor CSV</Text>
                </Box>
                {/* Data Table */}
                <Box flexDirection='column' marginTop={1}>
                    <Box flexDirection="row">
                        {listData[0].map((item, iCol) => (
                            <Box key={iCol} width={COL_WIDTH}>
                                <Text
                                    bold={true}
                                    color={'#ede7db'}
                                    wrap="truncate"
                                    >
                                    {String(item)}
                                </Text>
                            </Box>
                        ))}
                    </Box>
                    {listData.slice(listStart, listStart + visibleRows).map((row, iRow) => {
                        return (
                            <Box key={iRow} flexDirection="row">
                            {row.map((item, iCol) => (
                                <Box key={iCol} width={COL_WIDTH}>
                                <Text
                                    color={'#ada79e'}
                                    wrap="truncate"
                                >
                                    {String(item)}
                                </Text>
                            </Box>
                            ))}
                        </Box>
                        );
                    })}
                </Box>
                <Box marginTop={1}>
                    <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>
                </Box>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();