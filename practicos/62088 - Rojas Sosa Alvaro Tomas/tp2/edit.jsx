#!/usr/bin/env -S node --import tsx

import React, {useState} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;
const archivoCsv = process.argv[2]

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};

const ANCHOS = [15, 18, 8, 13, 18];
const FILAS_VISIBLES = FILAS - 4
const contenido = await readFile(archivoCsv, "utf8")

const textolimpio = contenido.replaceAll("\r", "")
let textSeparado = textolimpio.split("\n")
textSeparado = textSeparado.filter(t => t !== "")

let SeparadoFinal = []

for(let i = 0; i < textSeparado.length; i++) 
    {
        let separado = textSeparado[i].split(",")
        SeparadoFinal.push(separado)
    }

let encabezado = SeparadoFinal[0]
let datos = SeparadoFinal.slice(1)

function Datos({rows, column, tabla}) {

let inicio = 0;
if (rows >= FILAS_VISIBLES) {
inicio = rows - FILAS_VISIBLES + 1;
}

    return (
            <Box flexDirection="column">
                {tabla.slice(inicio, inicio + FILAS_VISIBLES).map((fila, i) => (      

                    <Box key={i} flexDirection="row">
                        <Box width={4}>
                        <Text>{inicio + i + 1}</Text>
                        </Box>
                        {fila.map((celda, j) => (
                            <Box width={ANCHOS[j]} key={j}>
                            <Text wrap="truncate" inverse={inicio + i === rows && j === column}>{celda}  </Text>
                            </Box>
                        ))}
                        
                    </Box>
                ))}
            </Box>
            )
}

function App() {
    const {exit} = useApp();
    const [rows, setrows] = useState(0)
    const [column, setcolumn] = useState(0)
    const [tabla, settabla] = useState(datos)
    const [modo, setmodo] = useState('normal')
    
    
    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    if (tecla === '<') 
        {
            const copyTabla = [...tabla];
            copyTabla.sort(function (a, b) {
            return a[column].localeCompare(b[column]);
            });
            settabla(copyTabla)
        }
    if (tecla === '>') 
        {
            const copyTabla = [...tabla];
            copyTabla.sort(function (a, b) {
            return b[column].localeCompare(a[column]);
            });
            settabla(copyTabla)
        }
        

    if (key.upArrow && rows > 0)  setrows(rows - 1);
    if (key.downArrow && rows < tabla.length - 1)  setrows(rows + 1)
    if (key.leftArrow && column > 0)  setcolumn(column - 1);
    if (key.rightArrow && column < encabezado.length - 1)  setcolumn(column + 1)
    if (key.return) {setmodo('editando')}
    
    }, {isActive: modo === 'normal'})

    return (
        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
            <Box flexDirection="column">
                <Box flexDirection="row" justifyContent="space-between">
                    <Text>{basename(archivoCsv)}</Text>
                    <Text>{tabla.length} filas ·  {encabezado.length} columnas</Text>
                </Box>
                {modo === 'editando'
                ? <TextInput defaultValue={tabla[rows][column]} onSubmit={(valor) => {
                    const copia = [...tabla];        
                    copia[rows] = [...copia[rows]];        
                    copia[rows][column] = valor;           
                    settabla(copia);                       
                    setmodo('normal');                     
                }} />
                : <Text>Valor › {tabla[rows][column]}</Text>
                }
                <Box flexDirection="row"> 
                    <Box width={4}>
                    <Text color="green">#</Text>
                    </Box>
                    {encabezado.map((celda, j) => (
                    <Box width={ANCHOS[j]} key={j}>
                    <Text color="green">{celda}  </Text>
                    </Box>
                    ))} 
                
                </Box>
                
                <Datos rows={rows} column={column} tabla={tabla}/>
                <Box flexDirection="row" justifyContent="space-between">
                <Text color={COLORES.secundario}><Text bold color={COLORES.acento}>A abrir · G guardar · Enter editar · {'<'} ascendente · {'>'} descendente · Esc salir  </Text></Text>
                <Text>fila {rows + 1}  ·  columna {column + 1}</Text>
                </Box>


            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();