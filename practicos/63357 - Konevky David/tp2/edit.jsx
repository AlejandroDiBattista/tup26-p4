#!/usr/bin/env -S node --import tsx

import React, {useState, useEffect} from 'react';
import {render, Box, Text, useInput, useApp, useStdout} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

const COLUMNNAME_PLACEHOLDER = ["nombre","apellido","edad","salario","departamento"];

const TABLA_PLACEHOLDER = [
  {nombre: "Juan", apellido: "Pérez", edad: 30, salario: 50000, departamento: "Ventas"},
  {nombre: "María", apellido: "Gómez", edad: 25, salario: 60000, departamento: "Marketing"},
  {nombre: "Pedro", apellido: "López", edad: 35, salario: 70000, departamento: "Finanzas"},
  {nombre: "Ana", apellido: "Martínez", edad: 28, salario: 55000, departamento: "Recursos Humanos"},
];

const TECLAS = [
    {funcion: "Abrir", tecla: "A"},
    {funcion: "Guardar", tecla: "G"},
    {funcion: "Salir", tecla: "Esc"},
]

function Table({data, columns, seleccionado}) {
    const anchoIndice = String(data.length).length + 1; // ancho de "#"
    const anchos = columns.map((col) =>
        Math.max(col.length, ...data.map((fila) => String(fila[col]).length))
    );

    const esColumnaActiva = (i) => i === seleccionado.columna;
    const esFilaActiva = (filaIdx) => filaIdx === seleccionado.fila;
    const esCeldaActiva = (filaIdx, i) => esFilaActiva(filaIdx) && esColumnaActiva(i);

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
            {data.map((fila, filaIdx) => (
                <Box key={filaIdx}>
                    <Box width={anchoIndice + 2} backgroundColor={esFilaActiva(filaIdx) ? COLORES.acentoDim : undefined}>
                        <Text color={esFilaActiva(filaIdx) ? COLORES.acento : COLORES.titulo}>{filaIdx + 1}</Text>
                    </Box>
                    {columns.map((col, i) => (
                        <Box key={col} width={anchos[i] + 2} backgroundColor={esCeldaActiva(filaIdx, i) ? 'white' : undefined}>
                            <Text color={esCeldaActiva(filaIdx, i) ? 'black' : COLORES.secundario}>{String(fila[col])}</Text>
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

const rutaArchivo = process.argv[2]; 

const [rowAmount, columnAmount] = totalSize(TABLA_PLACEHOLDER);

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

function App({ruta}) {
    const {exit} = useApp();
    const {columnas, filas} = useWindowSize();
    const [seleccionado, setSeleccionado] = useState({fila: 0, columna: 0});

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }

        if (key.upArrow) {
            setSeleccionado((s) => ({...s, fila: Math.max(0, s.fila - 1)}));
        }
        if (key.downArrow) {
            setSeleccionado((s) => ({...s, fila: Math.min(TABLA_PLACEHOLDER.length - 1, s.fila + 1)}));
        }
        if (key.leftArrow) {
            setSeleccionado((s) => ({...s, columna: Math.max(0, s.columna - 1)}));
        }
        if (key.rightArrow) {
            setSeleccionado((s) => ({...s, columna: Math.min(COLUMNNAME_PLACEHOLDER.length - 1, s.columna + 1)}));
        }

        if (tecla.toLowerCase() === 'g') {}
    })

    return (
        <Box width={columnas} height={filas} alignItems="stretch" flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo} paddingX={1}>
            <Box justifyContent="space-between" paddingBottom={1}>
                <Text bold>{basename(ruta)}</Text>
                <Text dimColor>{rowAmount} filas · {columnAmount} columnas</Text>
            </Box>
            <Box flexGrow={1} paddingBottom={1}>
                <Table data={TABLA_PLACEHOLDER} columns={COLUMNNAME_PLACEHOLDER} seleccionado={seleccionado}/>
            </Box>
            <Teclas />
        </Box>
    );
}

const app = render(<App ruta={rutaArchivo} />);
await app.waitUntilExit();
console.clear();