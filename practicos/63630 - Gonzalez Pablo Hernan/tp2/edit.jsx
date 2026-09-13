#!/usr/bin/env -S node --import tsx

import React, {useState, useEffect} from 'react';
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

function App() {
    const {exit} = useApp();


    const [modo, setModo] = useState('navegando');
    const [encabezado, setEncabezado] = useState([]);
    const [filas, setFilas] = useState([]);
    const [filaSeleccionada, setFilaSeleccionada] = useState(0);
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);
    const [nombreArchivo, setNombreArchivo] = useState(null);
    const [error, setError] = useState(null);


    useEffect(() => {
    const archivo = process.argv[2];
    setNombreArchivo(archivo);

    async function cargar() {

        if(archivo != undefined){

        const contenido = await readFile(archivo, 'utf8')
        
        const lineas = contenido.split(/\r?\n/);
        const primeraLinea = lineas[0].split(',');
        const restoDeLineas = lineas.slice(1)
        .filter((linea) => linea !== '')
        .map((linea) => linea.split(','));


        setEncabezado(primeraLinea);
        setFilas(restoDeLineas);


        }

    }
    cargar();

    }, []);







    
    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    })

    return (
    <Box flexDirection="column" width={COLUMNAS} borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
        <Box flexDirection="row" justifyContent="space-between">
        <Text>{nombreArchivo}</Text>
        <Text>{filas.length} filas · {encabezado.length} columnas</Text>
        </Box>
        
        <Box width={COLUMNAS} justifyContent="center" alignItems="center">
            <Box>
                <Box flexGrow={1} justifyContent="center" alignItems="center">
                    <Text bold color={COLORES.titulo}>Editor CSV</Text>
                </Box>
                <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>
            </Box>
        </Box>
    </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();