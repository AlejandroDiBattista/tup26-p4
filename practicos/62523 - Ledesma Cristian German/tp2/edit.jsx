#!/usr/bin/env -S node --import tsx

import React from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';
import { text } from 'node:stream/consumers';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};
    const archivoInicial = process.argv[2] || null;

function procesarTxtCrudo(txtCrudo){

    if(!txtCrudo || txtCrudo.trim() === ""){
    return[];
    } 
    const lineas = txtCrudo.split(/\r??\n/);
    const matriz = [];

    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i];
        if(i === lineas.length -1 && linea === "")continue;
        
        const columnas = linea.split(',');
        matriz.push(columnas);
    }
    return matriz;
}

function App() {

    const [nombreArchivo,setNombreArchivo] = React.useState(archivoInicial);
    const [datos,setDatos] = React.useState([]);
    const [filaSelec,setFilaselec] = React.useState(0);
    const [columnselect,SetColumnSelect] = React.useState(0);

    React.useEffect(()=> {
        async function cargarArchivo() {
            if (nombreArchivo !== null) {
                try{
                const texto = await readFile(nombreArchivo,'utf-8' );
                const matrizConvertida = procesarTxtCrudo(texto);
                
                setDatos(matrizConvertida);
                }catch (error) {}
            }
        } cargarArchivo();
    },[nombreArchivo]);


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

const app = render(<App />);
await app.waitUntilExit();
console.clear();