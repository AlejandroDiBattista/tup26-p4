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

function Fila({numero, fila}) {
    return (
        <Box flexDirection="row" gap={1}> 
            <Text width={4}>{numero}</Text>
            <Text width={13}>{fila[0]}</Text>
            <Text width={15}>{fila[1]}</Text>
            <Text width={6}>{fila[2]}</Text>
            <Text width={11}>{fila[3]}</Text>
            <Text width={20}>{fila[4]}</Text>
    
    </Box>
    );
}


function App() {
    const {exit} = useApp();
    
    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    }); 

    return (
        <Box 
          width={COLUMNAS} 
          height={FILAS} 
          flexDirection="column" 
        >

         
            <Text bold color={COLORES.titulo}>
                {basename(archivo)}
            </Text>

            <Text>
              {filas.length - 1} filas, {filas[0].length} columnas 
            </Text>


            <Box flexDirection="row" gap={1}>
                <Text bold width={4}>N°</Text>
                <Text bold width={13}>nombre</Text>
                <Text bold width={15}>apellido</Text>
                <Text bold width={6}>edad</Text>
                <Text bold width={11}>salario</Text>
                <Text bold width={20}>departamento</Text>
            </Box>
                  


            {filas.slice(1).map((fila, indice) => (
              <Fila
                  key={indice}
                  numero={indice + 1}
                  fila={fila}
              />
            ))}
                  
                <Text color={COLORES.secundario}>
                    <Text bold color={COLORES.acento}> Esc</Text> salir</Text>
            </Box>
        
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();
