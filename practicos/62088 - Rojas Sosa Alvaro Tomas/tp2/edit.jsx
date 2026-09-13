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

function Datos({rows, column}) {
    return (
            <Box flexDirection="column">
                {datos.map((fila, i) => (      

                    <Box key={i} flexDirection="row">
                        <Box width={4}>
                        <Text>{i + 1}</Text>
                        </Box>
                        {fila.map((celda, j) => (
                            <Box width={ANCHOS[j]} key={j}>
                            <Text wrap="truncate" inverse={i === rows && j === column}>{celda}  </Text>
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
    
    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    

    if (key.upArrow && rows > 0)  setrows(rows - 1);
    if (key.downArrow && rows < datos.length - 1)  setrows(rows + 1)
    if (key.leftArrow && column > 0)  setcolumn(column - 1);
    if (key.rightArrow && column < encabezado.length - 1)  setcolumn(column + 1)
    
    
    })

    return (
        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
            <Box flexDirection="column">
                <Box flexDirection="row" justifyContent="space-between">
                    <Text>{basename(archivoCsv)}</Text>
                    <Text>{datos.length} filas ·  {encabezado.length} columnas</Text>
                </Box>
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
                
                <Datos rows={rows} column={column}/>
                <Text color={COLORES.secundario}><Text bold color={COLORES.acento}>A abrir · G guardar · Enter editar · {'<'} ascendente · {'>'} descendente · Esc salir</Text></Text>



            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();