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

function Tabla({cabecera, datos, filaSel, colSel}) {
    return (
        <Box flexDirection="column">
            <Box>
                <Text color={COLORES.secundario}>{'#  '}</Text>
                {cabecera.map((titulo, i) => (
                    <Text key={i} bold color={COLORES.titulo}>{titulo}{'  '}</Text>
                ))}
            </Box>
            {datos.map((fila, f) => (
                <Box key={f}>
                    <Text color={COLORES.secundario}>{f + 1}{'  '}</Text>
                    {fila.map((valor, c) => {
                        const activa = f === filaSel && c === colSel;
                        return (
                            <Text
                                key={c}
                                color={activa ? COLORES.fondo : COLORES.titulo}
                                backgroundColor={activa ? COLORES.acento : undefined}
                            >
                                {valor}{'  '}
                            </Text>
                        );
                    })}
                </Box>
            ))}
        </Box>
    );
}

function App() {
    async function leercsv(link) {
        const contenido = await readFile(link, 'utf-8')
        return contenido
        .trim()
        .split('\n')
        .map((fila)=>fila.split(','))
    }

    const [cabecera, setCabecera] = useState(null);
    const [datos, setDatos] = useState(null);
    const [colsel, setColsel] = useState(0);
    const [filasel, setFilasel] = useState(0);

    useEffect(()=>{
        leercsv('empleados.csv').then((filas)=>{
            setCabecera(filas[0]);
            setDatos(filas.slice(1));
        })
    },[])

    const {exit} = useApp();
    useInput((tecla, key) => {
        if (key.escape) {
            exit();
            return;
        }
        if (!datos) return;
        if(key.downArrow)setFilasel(f => Math.min(f+1, datos.length-1));
        if(key.rightArrow)setColsel(c => Math.min(c+1, cabecera.length-1));
        if(key.upArrow)setFilasel(f => Math.max(f-1,0));
        if(key.leftArrow)setColsel(c => Math.max(c-1,0));
    })


    return (
        <Box width={COLUMNAS} height={FILAS} flexDirection="column" padding={1}>
            {!datos ? (
                <Text color={COLORES.secundario}>Cargando...</Text>
            ) : (
                <Tabla cabecera={cabecera} datos={datos} filaSel={filasel} colSel={colsel} />
            )}
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();