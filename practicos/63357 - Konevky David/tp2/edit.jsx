#!/usr/bin/env -S node --import tsx

import React, {useState, useEffect} from 'react';
import {render, Box, Text, useInput, useApp, useStdout} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

async function parseFile(file) {
    const data = await readFile(file, {encoding: 'utf-8'});
    const [header, ...rows] = data.split(/\r?\n|\r/);
    const parsedColumns = header.split(',').map((c) => c.trim());
    const parsedData = rows
    .filter((r) => r.trim() !== '')
    .map((row) => {
        const values = row.split(',').map((v) => v.trim());
        return Object.fromEntries(parsedColumns.map((c, i) => [c, values[i]]));
    });
    return {parsedData, parsedColumns};
}

const TECLAS = [
    {funcion: "Abrir", tecla: "A"},
    {funcion: "Guardar", tecla: "G"},
    {funcion: "Editar", tecla: "Enter"},
    {funcion: "Salir", tecla: "Esc"},
]

function Tabla({data, columns, inicio, seleccionado, tablaFilas}) {
    const anchoIndice = String(data.length).length + 1;
    const anchos = columns.map((col) =>
        Math.max(col.length, ...data.map((fila) => String(fila[col]).length))
    );

    const esColumnaActiva = (i) => i === seleccionado.columna;
    const esFilaActiva = (filaAbsoluto) => filaAbsoluto === seleccionado.fila;
    const esCeldaActiva = (filaIdx, i) => esFilaActiva(filaIdx) && esColumnaActiva(i);

    const slicedData = data.slice(inicio, inicio + tablaFilas);

    return (
        <Box flexDirection="column">
            <Box>
                <Box width={anchoIndice + 2}>
                    <Text color={COLORES.titulo}>#</Text>
                </Box>
                {columns.map((col, i) => (
                    <Box key={col} width={anchos[i] + 2} backgroundColor={esColumnaActiva(i) ? COLORES.acentoDim : undefined}>
                        <Text color={esColumnaActiva(i) ? COLORES.acento : COLORES.titulo}>{col.toUpperCase()}</Text>
                    </Box>
                ))}
            </Box>
            {slicedData.map((fila, filaIdx) => (
                <Box flexShrink={0} key={filaIdx}>
                    <Box width={anchoIndice + 2} backgroundColor={esFilaActiva(inicio + filaIdx) ? COLORES.acentoDim : undefined}>
                        <Text color={esFilaActiva(inicio + filaIdx) ? COLORES.acento : COLORES.titulo}>{inicio + filaIdx + 1}</Text>
                    </Box>
                    {columns.map((col, i) => (
                        <Box key={col} width={anchos[i] + 2} backgroundColor={esCeldaActiva(inicio + filaIdx, i) ? 'white' : undefined}>
                            <Text color={esCeldaActiva(inicio + filaIdx, i) ? 'black' : COLORES.secundario}>{String(fila[col])}</Text>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
}

function useWindowSize() {
    const {stdout} = useStdout();
    const [size, setSize] = useState({
        columnas: stdout.columns || 80,
        filas: stdout.rows || 24,
    });

    useEffect(() => {
        const onResize = () => {
            setSize({
                columnas: stdout.columns || 80,
                filas: stdout.rows || 24,
            });
        };
        stdout.on('resize', onResize);
        return () => stdout.off('resize', onResize);
    }, [stdout]);

    return size;
}

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
    acentoDim: '#5c4d2c',
};

function totalSize(data) {
    const columnas = Object.keys(data[0]).length;
    const filas = data.length;
    return [filas, columnas];
}

function Teclas() {
    return (
        <Box paddingTop={1}>
            {TECLAS.map((tecla, i) => (
                <Text key={i} color={COLORES.secundario}>
                    <Text bold color={COLORES.acento}>{tecla.tecla}</Text> {tecla.funcion}{i < TECLAS.length - 1 ? ' · ' : ''}
                </Text>
            ))}
        </Box>
    );
}

function App({ruta, data, columns, rowAmount, columnAmount}) {
    const {exit} = useApp();
    const {columnas, filas} = useWindowSize();
    const [seleccionado, setSeleccionado] = useState({fila: 0, columna: 0});
    const [inicio, setInicio] = useState(0);
    const tablaFilas = filas - 9;

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }

        if (key.upArrow) {
            const nuevaFila = Math.max(0, seleccionado.fila - 1);
            setSeleccionado((s) => ({...s, fila: nuevaFila}));
            if (nuevaFila < inicio) {
                setInicio(nuevaFila);
            }
        }
        if (key.downArrow) {
            const nuevaFila = Math.min(data.length - 1, seleccionado.fila + 1);
            setSeleccionado((s) => ({...s, fila: nuevaFila}));
            if (nuevaFila > inicio + tablaFilas - 1) {
                setInicio(nuevaFila - tablaFilas + 1);
            }
        }
        if (key.leftArrow) {
            setSeleccionado((s) => ({...s, columna: Math.max(0, s.columna - 1)}));
        }
        if (key.rightArrow) {
            setSeleccionado((s) => ({...s, columna: Math.min(columns.length - 1, s.columna + 1)}));
        }

        if (tecla.toLowerCase() === 'g') {}
    })

    return (
        <Box width={columnas} height={filas} alignItems="stretch" flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo} paddingX={1}>
            <Box justifyContent="space-between">
                <Text bold>{basename(ruta)}</Text>
                <Text dimColor>{rowAmount} filas · {columnAmount} columnas</Text>
            </Box>
            <Box paddingBottom={1}>
                <Text>Valor seleccionado &gt; {data[seleccionado.fila][columns[seleccionado.columna]]}</Text>
            </Box>
            <Box flexGrow={1} paddingBottom={1}>
                <Tabla data={data} columns={columns} seleccionado={seleccionado} inicio={inicio} tablaFilas={tablaFilas} />
            </Box>
            <Teclas />
        </Box>
    );
}

function logError(message) {
    console.error(message);
    process.exit(1);
}

async function init() {
    const rutaArchivo = process.argv[2];
    if (!rutaArchivo) logError('No se especificó un archivo');
    let data;
    try {
        data = await parseFile(rutaArchivo);
    } catch (error) {logError(`No se pudo leer "${rutaArchivo}": ${e.message}`)};

    const [rowAmount, columnAmount] = totalSize(data.parsedData);
    const app = render(<App 
        ruta={rutaArchivo} 
        data={data.parsedData} 
        columns={data.parsedColumns} 
        columnAmount={columnAmount} 
        rowAmount={rowAmount} 
    />);
    await app.waitUntilExit();
    console.clear();
}

init();