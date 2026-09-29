#!/usr/bin/env -S node --import tsx

import React from 'react';
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

function App(resultado) {
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


const texto = await readFile("empleados.csv","utf-8") 
// console.log(texto)

function parseTexto(texto) {
    const fila = texto.trim().split('\n')
    const header = fila[0]
    const campo = header.trim().split(',')
    const registros = 
    fila.slice(1).map(fila => fila.trim().split(','))

    let tabla = []
    tabla.push(campo,registros)
    
    return tabla 
    
    
}
const resultado = parseTexto(texto)


function parseObjeto(resultado) {
    
    const objetos = resultado[1].map(registro =>{
        const objeto = {}

        for (let i = 0; i < resultado[0].length; i++) {
            objeto[resultado[0] [i]] = registro[i];
            
        }
        return objeto
    })
    console.log(objetos)
    
}
parseObjeto(resultado)

const app = render(<App resultado={resultado} />);
await app.waitUntilExit();
console.clear();