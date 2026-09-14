#!/usr/bin/env -S node --import tsx

import React from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';
import { fail } from 'node:assert';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;
const archivo = process.argv[2]; 
const datos = await readFile(archivo, 'utf8');
const lineas = datos.trim().split('\n');
const filas = lineas.map(linea => linea.split(',')); 

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',

 
};

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
               
                <Box flexDirection= " colum ">
                    {filas.map((fila, indice) => (
                          <Text  key={indice}>
                            {fila.join(' | ')}
                    </Text> 

                    ))}
                  
                </Box>
                <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();
