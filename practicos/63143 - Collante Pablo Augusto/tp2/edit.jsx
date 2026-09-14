#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile, writeFile } from 'node:fs/promises';
import { TextInput } from '@inkjs/ui';
import { basename } from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS = process.stdout.rows || 24;

const COLORES = {
    fondo: '#161310',
    borde: '#726b61',
    titulo: '#ede7db',
    secundario: '#ada79e',
    acento: '#edbb64',
    celdaSeleccionada: '#ffffff',
    textoOscuro: '#000000'
};

const WINDOW_SIZE = 13;

function App() {
    const { exit } = useApp();

    const [archivo, setArchivo] = useState(process.argv[2] || '');
    const [datosCsv, setDatosCsv] = useState([["Columna 1", "Columna 2"], ["Fila 1", "Fila 2"]]);
    const [seleccion, setSeleccion] = useState({ fila: 0, columna: 0 });
    const [modo, setModo] = useState("vista");

    useEffect(() => {
        async function cargarArchivo() {
            if (!archivo) return;
            try {
                const contenido = await readFile(archivo, 'utf-8');
                const lineas = contenido.trim().replace(/\r/g, '').split('\n');
                const matriz = lineas.map(linea => linea.split(','));
                setDatosCsv(matriz);
            } catch (error) { }
        }
        cargarArchivo();
    }, [archivo]);



    useInput((tecla, key) => {
        if (key.escape) {
            if (modo === "vista") {
                exit();
            } else {
                setModo("vista");
            }
        }

        if (modo === "vista") {
            if (key.upArrow) {
                setSeleccion(prev => ({ ...prev, fila: Math.max(prev.fila - 1, 0) }));
            }
            if (key.downArrow) {
                setSeleccion(prev => ({ ...prev, fila: Math.min(prev.fila + 1, datosCsv.length - 1) }));
            }
            if (key.leftArrow) {
                setSeleccion(prev => ({ ...prev, columna: Math.max(prev.columna - 1, 0) }));
            }
            if (key.rightArrow) {
                setSeleccion(prev => ({ ...prev, columna: Math.min(prev.columna + 1, datosCsv[0].length - 1) }));
            }

            if (tecla && tecla.toLocaleLowerCase() === 'a' && modo === "vista") {
                setModo("abrir");
            }
            if (tecla && tecla.toLocaleLowerCase() === 'g' && modo === "vista") {
                setModo("guardar");
            }
        }
    });

    return (
        <Box width={COLUMNAS} flexDirection="column" backgroundColor={COLORES.fondo}>
            {modo === 'vista' ? (
                <Box flexDirection="column">
                    <Box marginBottom={1}><Text color={COLORES.titulo}>Archivo: {archivo || 'Ninguno'}</Text></Box>
                    {datosCsv.slice(seleccion.fila, seleccion.fila + 7).map((fila, i) => {
                        const indiceReal = seleccion.fila + i;
                        return (
                            <Box key={indiceReal} flexDirection="row">
                                {fila.map((celda, j) => (
                                    <Box key={j} width={14} borderStyle="single" borderColor={COLORES.borde} backgroundColor={seleccion.fila === indiceReal && seleccion.columna === j ? COLORES.acento : undefined}>
                                        <Text color={seleccion.fila === indiceReal && seleccion.columna === j ? COLORES.fondo : COLORES.titulo}>
                                            {celda}
                                        </Text>
                                    </Box>
                                ))}
                            </Box>
                        );
                    })
                    }

                    <Box marginTop={1} paddingX={1} borderStyle="single" borderColor={COLORES.secundario}>
                        <Text color={COLORES.acento}> Posicion: [{seleccion.fila}, {seleccion.columna}] | Valor: {datosCsv[seleccion.fila]?.[seleccion.columna]}</Text>
                    </Box>
                </Box>
            ) : (
                <Box flexGrow={1} justifyContent="center" alignItems="center">
                    <Box borderStyle="round" borderColor={COLORES.borde} padding={1}>
                        <Text>{modo === 'abrir' ? 'Abrir archivo: ' : 'Guardar archivo: '}</Text>
                        <TextInput
                            placeholder="empleados.csv"
                            onSubmit={async (valor) => {
                                if (modo === "abrir") {
                                    try {
                                        const contenido = await readFile(valor, 'utf-8');
                                        const matriz = contenido.trim().replace(/\r/g, '').split('\n').map(linea => linea.split(','));
                                        setDatosCsv(matriz);
                                        setArchivo(valor);
                                        setSeleccion({ fila: 0, columna: 0 });
                                        setModo("vista");
                                    } catch (error) {
                                        setModo("vista");
                                    }
                                } else if (modo === "guardar") {
                                    try {
                                        const texto = datosCsv.map(f => f.join(',')).join('\n');
                                        await writeFile(valor, texto, 'utf-8');
                                        setArchivo(valor);
                                        setModo("vista");
                                    } catch (error) {
                                        setModo("vista");
                                    }
                                }
                            }}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
}


const app = render(<App />);
await app.waitUntilExit();
console.clear();