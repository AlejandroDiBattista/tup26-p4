#!/usr/bin/env -S node --import tsx

import React, {useEffect, useState} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';


const COLORES = {
    fondo:     '#161310',
    borde:     '#7e300c',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};

function App() {
    const {exit} = useApp()
    const archivoInicial = process.argv[2]
    const [pidiendoArchivo, setPidiendoArchivo] = useState(!archivoInicial)
    const [nombreArchivo, setNombreArchivo] = useState('')
    const [contenido, setContenido] = useState('')

    async function abrirArchivo(nombre) {
        try {
            const datos = await readFile(nombre, 'utf-8')
            setContenido(datos)
            setNombreArchivo(nombre)
            setPidiendoArchivo(false)
        } catch {
            setContenido('Error: no se pudo abrir el archivo')
        }
    }

    useEffect(() => {
        if (archivoInicial) {
            abrirArchivo(archivoInicial)
        }
    }, [])

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    })

    if (pidiendoArchivo) {
        return (
            <Box>
                <Text>Ingrese el nombre del archivo a abrir: </Text>
                <TextInput 
                    defaultValue={nombreArchivo}
                    onChange={setNombreArchivo}
                    onSubmit={abrirArchivo} 
                />
            </Box>
        )
    }

    return (
        <Box flexDirection="column" gap={2} borderStyle="round" borderColor={COLORES.borde}>
            
            <Text>Archivo: {nombreArchivo}</Text>  
            <Text>{contenido}</Text>   
                    
        </Box>   
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();