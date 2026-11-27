#!/usr/bin/env -S node --import tsx
import React, {useEffect, useState} from 'react';
import {Box, Text, render, useApp, useInput, useStdout} from 'ink';
import {TextInput} from '@inkjs/ui';
import {readFile, writeFile} from 'node:fs/promises';
import {basename} from 'node:path';

function separar(texto) {
    const lineas = texto.replace(/^\uFEFF/, '').replace(/[\r\n]+$/, '');
    const [titulo, ...resto] = lineas.split(/\r?\n/);
    if (!titulo) throw new Error('El archivo está vacío.');
    const columnas = titulo.split(',');
    const filas = resto.map((linea, indice) => {
        const fila = linea.split(',');
        if (fila.length !== columnas.length) throw new Error('Revisá la fila ' + (indice + 2));
        return fila;
    });
    return {columnas, filas};
}

function App() {
    const {exit} = useApp();
    const {stdout} = useStdout();
    const [archivo, ponerArchivo] = useState('');
    const [tabla, ponerTabla] = useState({columnas: [], filas: []});
    const [error, ponerError] = useState('');
    const [modo, cambiarModo] = useState('tabla');
    const [fila, elegirFila] = useState(0);
    const [columna, elegirColumna] = useState(0);
    const [ocupado, ocupar] = useState(false);

    async function abrir(nombre) {
        ocupar(true);
        try {
            const datos = separar(await readFile(nombre, 'utf8'));
            ponerTabla(datos);
            ponerArchivo(nombre);
            elegirFila(0);
            elegirColumna(0);
            ponerError('');
            cambiarModo('tabla');
        } catch (e) {
            ponerError(e.message);
        } finally {
            ocupar(false);
        }
    }

    useEffect(() => {
        if (process.argv[2]) abrir(process.argv[2]);
        else cambiarModo('abrir');
    }, []);

    useInput((tecla, boton) => {
        if (ocupado) return;
        if (boton.escape) {
            if (modo === 'tabla') exit();
            else { cambiarModo('tabla'); ponerError(''); }
            return;
        }
        if (modo !== 'tabla') return;
        if (tecla.toLowerCase() === 'a') cambiarModo('abrir');

    });
    return <Box flexDirection="column" borderStyle="round" paddingX={1}>
        <Text bold>{archivo ? basename(archivo) : 'Editor CSV'} · {tabla.filas.length} filas · {tabla.columnas.length} columnas</Text>

        {error && <Text color="red">{error}</Text>}
        {modo === 'tabla' ? <Text>A abrir · Esc salir</Text> :
            <Box><Text>{'Abrir:'} </Text><TextInput key={modo}  onSubmit={abrir}/></Box>}
    </Box>;
}
render(<App/>);
