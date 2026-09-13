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

const leerEmpleados = await readFile(process.argv[2], "utf-8")
const separarEmpleados = leerEmpleados.split("\n")
// console.log(leerEmpleados);
// console.log(separarEmpleados);

const resultados = separarEmpleados.map(texto => texto.trim())
// console.log(resultados)
const separarFilas = resultados.map(resultados => resultados.split(","))
console.log(separarFilas[0]);

function mostrarDatos(){

    const nombreArchivo = "empleados.csv"
    const filas = resultados.length 
    const columnas = separarFilas[0].length

    return `Nombre de fila es : ${nombreArchivo} , filas: ${filas} y columnas: ${columnas}`

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
            <Box >
                {/* {separarFilas.map((fila, indice) => (
                    <Text key={indice}> {fila.map((col, indice) => (
                        <Text key={indice}> 
                            {col}
                        </Text>
                     ))}
                    </Text>
                ))} */}
            </Box>
            <Text>
                {mostrarDatos()}
            </Text>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear(); 