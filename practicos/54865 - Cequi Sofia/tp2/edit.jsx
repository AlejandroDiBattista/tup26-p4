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

function App() {
    const {exit} = useApp();

    const [archivo, setArchivo] = React.useState(null);
    const [cabecera, setCabecera] = React.useState([]);
    const [datos, setDatos] = React.useState([]);

    async function abrirArchivo(nombre) {
        const contenido = await readFile(nombre, "utf8");

        const lineas = contenido.trim().split("\n");

        const nuevaCabecera = lineas[0].split(",");

        const nuevosDatos = lineas.slice(1).map(linea => linea.split(","));

        setArchivo(nombre);
        setCabecera(nuevaCabecera);
        setDatos(nuevosDatos);

    }

    React.useEffect(() =>{
        const archivoInicial = process.argv[2];

        if (archivoInicial) {
            abrirArchivo(archivoInicial)
    }}, []);
    
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

const app = render(<App />);
await app.waitUntilExit();
console.clear();