#!/usr/bin/env -S node --import tsx

import React, {useState} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

const texto = process.argv[2] ? await readFile(process.argv[2], 'utf-8') : '';
const partes = texto.replaceAll('\r\n', '\n').trim().split('\n');

const cabecera = partes[0] || '';

//solo 5 nombres de columnas 
const titulos = cabecera.split(',');

const filas = partes.slice(1) ; 

const datos = filas.map(fila => fila.split(','));


const anchos = titulos.map((titulo , i ) => {

const listanombres = datos.map(fila => fila[i] || '');
const cuenta = listanombres.map(nom => nom.length);
return Math.max(titulo.length, ...cuenta);

});





const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};

function App() {
    const {exit} = useApp();
    const [fila, setFila] = useState(0);
    const [columna, setColumna] = useState(0);

    useInput((tecla, key) => {
        if (key.escape) {

            exit();
        }
            if (key.downArrow) {
                setFila(Math.min(fila + 1, datos.length - 1));
            }
            if (key.upArrow) {
                setFila(Math.max(fila - 1, 0));
            }
            if (key.rightArrow) {
                setColumna(Math.min(columna + 1, titulos.length - 1));
            }
            if (key.leftArrow) {
                setColumna(Math.max(columna - 1, 0));
            }

    })
///aqui 

    return (
        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
            <Box width={COLUMNAS} height={FILAS} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
                <Box flexGrow={1} justifyContent="flex-start" alignItems="flex-start" flexDirection="column" >
                    <Box flexDirection="row" gap={1} >
                     {titulos.map((titulo, j) => (
                      <Text key={j} color={COLORES.titulo} bold>
                        {titulo.toUpperCase().padEnd(anchos[j])} 
                      </Text>
                    ))}
                    </Box>
                 {datos.slice(0, FILAS - 5).map((registro, i) => (
                  <Box key={i} flexDirection="row" gap={1} >
                    {registro.map((campo, j) => (
                      <Text key={j} color={COLORES.titulo} backgroundColor={i === fila && j === columna ? COLORES.secundario : undefined}>
                        {campo.padEnd(anchos[j])}
                      </Text>
                    ))}   

                 </Box>  
                ))}
                </Box>
                <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>
            </Box>
        </Box>
    );
}
//{fila.map((campo, i ) => campo.padEnd(anchos[i])).join(' ')


const app = render(<App />);
await app.waitUntilExit();
console.clear();