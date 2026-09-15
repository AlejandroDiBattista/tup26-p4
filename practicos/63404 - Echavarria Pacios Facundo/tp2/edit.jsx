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
let fileName = params[0]
if (params[0] !== undefined) {
    finishList = CompleteFileExtraction(fileName)
}

//Funcion para pasar de array a csv
const serialize = (data, delimiter) => {
    data = data.map(e => e.join(delimiter))

    return data.join('\n')
}

//Funcion para guardar archivos
const writeOutput = (outputFile, text) => {
    try {
        fs.writeFileSync(outputFile, text, 'utf-8')
    } catch (error) {
        showConsoleError(error.message)
    }
}

const COL_WIDTH = 20;

function App() {
    const {exit} = useApp();
    const visibleRows = 10

    const [listData, setListData] = useState(finishList ?? [])
    const [listStart, setListStart] = useState(1)
    const [selectedItem, setSelectedItem] = useState({
        row: 0,
        column:0
    })
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)

    const selectedValue = listData.slice(listStart, listStart + visibleRows)[selectedItem.row][selectedItem.column]

    useInput((tecla, key) => {
        if (!editing && !saving) {
            if (key.upArrow) {
                handleArrowKey('up')
            }
            if (key.downArrow) {
                handleArrowKey('down')
            }
            if (key.leftArrow) {
                handleArrowKey('left')
            }
            if (key.rightArrow) {
                handleArrowKey('right')
            }
            if (tecla === '>') {
                handleSortKey(tecla)
            }
            if (tecla === '<') {
                handleSortKey(tecla)
            }
            if (key.return) {
                hanldeEnterKey()
            }
            if (tecla.toLowerCase() === 'g') {
                handleGkey()
            }
        }
        if (key.escape) {
            handleEscapeKey(editing, saving)
        }
    })

    const handleArrowKey = (key) => {
        if (key === 'up') {
            if (selectedItem.row !== 0) {
                setSelectedItem({
                    row: selectedItem.row - 1,
                    column: selectedItem.column
                })
            } else {
                if (listStart > 1) {
                    setListStart(listStart - 1)
                }
            }
        }
        if (key === 'down') {
            if (selectedItem.row < (visibleRows - 1)) {
                setSelectedItem({
                    row: selectedItem.row + 1,
                    column: selectedItem.column
                })
            } else {
                if (listStart < listData.length - visibleRows) {
                    setListStart(listStart + 1)
                }
            }
        }
        if(key === 'left' && selectedItem.column !== 0) {
            setSelectedItem({
                row: selectedItem.row,
                column: selectedItem.column - 1
            })
        }
        if(key === 'right' && selectedItem.column < listData[0].length - 1 ) {
            setSelectedItem({
                row: selectedItem.row,
                column: selectedItem.column + 1
            })
        }
    }

    const handleSortKey = (key) => {
        const orderedList = listData.slice(1).sort((a,b) => orderTable(a[selectedItem.column], b[selectedItem.column], key))

        setListData([listData[0], ...orderedList])
    }

    const handleEscapeKey = (editing, saving) => {
        if (!editing && !saving) {
            exit()
        }else {
            setEditing(false)
            setSaving(false)
        }
    }

    const hanldeEnterKey = () => {
        setEditing(true)
    }

    const handleGkey = () => {
        setSaving(!saving)
    }

    const orderTable = (a, b, direc) => {
        const valueA = String(a ?? '')
        const valueB = String(b ?? '')

        if (direc === '<') {
            return valueA.localeCompare(valueB, undefined, {
                numeric: true,
                sensitivity: 'base'
            })
        } else {
            return valueA.localeCompare(valueB, undefined, {
                numeric: true,
                sensitivity: 'base'
            }) * -1
        }
        
    }

    const totalCol = listData[0]?.length || 1;
    const tableWidth = Math.max(40, (totalCol + 1) * COL_WIDTH + 4);

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
                <Box flexGrow={1} justifyContent="space-between">
                    <Text bold color={COLORES.titulo}>{fileName}</Text>
                    <Text bold color={COLORES.titulo}>{`${listData.length - 1} filas | ${listData[0].length} columnas`}</Text>
                </Box>
                <Box flexDirection='row'>
                    {
                        saving ? (
                            <Box>
                                <Text bold color={COLORES.acento}>Guardar › </Text>
                                <TextInput 
                                defaultValue={'Copia.csv'} 
                                onSubmit={(newValue) => {
                                    writeOutput(newValue, serialize(listData, ','))
                                    setSaving(false)
                                }} 
                                />
                            </Box>
                        ) : (  
                            (<Box>
                                <Text marginTop={2} color={COLORES.titulo}>Valor: </Text>
                                {
                                    editing ? (
                                        <TextInput 
                                        defaultValue={selectedValue} 
                                        onSubmit={(newValue) => {
                                            let editedList = [...listData] 
                                            editedList[selectedItem.row + listStart][selectedItem.column] = newValue
                                            setListData([...editedList])
                                            setEditing(false)
                                        }} 
                                        />
                                    ) : (
                                        <Text>{selectedValue}</Text>
                                    )
                                }
                            </Box>)
                        )
                    }
                </Box>
                {/* Data Table */}
                <Box flexDirection='column' marginTop={1}>
                    {/* Encabezados */}
                    <Box flexDirection="row">
                        <Box width={4}>
                            <Text
                                bold={true}
                                color={'#ede7db'}
                                wrap="truncate"
                                width={4}
                                >
                                #
                            </Text>
                        </Box>
                        {listData[0].map((item, iCol) => {
                            let selected = false
                            if(iCol===selectedItem.column){
                                selected = true
                            }
                            return (
                            <Box key={iCol} width={COL_WIDTH} backgroundColor={selected ? 'black' : ''}>
                                <Text
                                    bold={true}
                                    color={selected ? COLORES.acento : '#ede7db'}
                                    wrap="truncate"
                                    >
                                    {String(item)}
                                </Text>
                            </Box>
                        )})}
                    </Box>
                    {/* Datos de tabla */}
                    {listData.slice(listStart, listStart + visibleRows).map((row, iRow) => {
                        return (
                            <Box key={iRow} flexDirection="row">
                                
                                <Box key={iRow} width={4} backgroundColor={iRow === selectedItem.row ? 'black' : ''}>
                                    <Text
                                        color={iRow === selectedItem.row ? COLORES.acento : '#ada79e'}
                                        wrap="truncate"
                                    >
                                        {iRow + listStart}
                                    </Text>
                                </Box>
                            {row.map((item, iCol) => {
                                let selected = false
                                if(iCol===selectedItem.column && iRow === selectedItem.row){
                                    selected = true
                                }
                                return (
                                <Box key={iCol} width={COL_WIDTH} backgroundColor={selected ? '#ede7db' : COLORES.fondo}>
                                    <Text
                                        color={'#ada79e'}
                                        wrap="truncate"
                                        width={COL_WIDTH}
                                    >
                                        {String(item)}
                                    </Text>
                                </Box>
                            )})}
                        </Box>
                        );
                    })}
                </Box>
                <Box marginTop={1} flexDirection='row' justifyContent='space-between' width="100%">
                    {
                        saving || editing ?
                            (<Text color={COLORES.secundario}>
                                <Text bold color={COLORES.acento}> Esc </Text> 
                                Cancelar |
                                <Text bold color={COLORES.acento}> Enter </Text> 
                                Confirmar
                            </Text>)
                        : (<Text color={COLORES.secundario}>
                                <Text bold color={COLORES.acento}> Esc </Text> 
                                salir |
                                <Text bold color={COLORES.acento}> {`< `}</Text> 
                                ascendente |
                                <Text bold color={COLORES.acento}> {`> `}</Text> 
                                descendente |
                                <Text bold color={COLORES.acento}> A </Text> 
                                abrir |
                                <Text bold color={COLORES.acento}> G </Text> 
                                guardar |
                                <Text bold color={COLORES.acento}> Enter </Text> 
                                editar
                            </Text>)
                    }
                    <Text color={COLORES.secundario} flexDirection={'end'}>Fila {selectedItem.row + listStart} | Columna {selectedItem.column + 1}</Text>

                </Box>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();