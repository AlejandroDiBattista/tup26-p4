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
    const [seleccion, setSeleccion] = useState({ fila: 1, columna: 0 });
    const [modo, setModo] = useState("vista");
    const [valorEdicion, setValorEdicion] = useState("");

    const ordenar = (ascendente) => {
        if (datosCsv.length <= 1) return;
        const col = seleccion.columna;
        const filas = [...datosCsv.slice(1)].sort((a, b) => {
            const vA = a[col] || "", vB = b[col] || "";
            if (!isNaN(vA) && !isNaN(vB) && vA && vB) return ascendente ? Number(vA) - Number(vB) : Number(vB) - Number(vA);
            return ascendente ? vA.localeCompare(vB) : vB.localeCompare(vA);
        });
        setDatosCsv([datosCsv[0], ...filas]);
    };

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
                setSeleccion(prev => ({ ...prev, fila: Math.max(prev.fila - 1, 1) }));
            }
            if (key.downArrow) {
                setSeleccion(prev => ({ ...prev, fila: Math.min(prev.fila + 1, Math.max(1, datosCsv.length - 1)) }));
            }
            if (key.leftArrow) {
                setSeleccion(prev => ({ ...prev, columna: Math.max(prev.columna - 1, 0) }));
            }
            if (key.rightArrow) {
                setSeleccion(prev => ({ ...prev, columna: Math.min(prev.columna + 1, datosCsv[0] ? datosCsv[0].length - 1 : 0) }));
            }
            if (tecla === '<') ordenar(true);
            if (tecla === '>') ordenar(false);
            if (key.return) {
                setValorEdicion(datosCsv[seleccion.fila]?.[seleccion.columna] || "");
                setModo("editar");
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
                    <Box marginBottom={1} flexDirection="row" justifyContent="space-between">
                        <Text bold color={COLORES.titulo}>{archivo ? basename(archivo) : 'Ninguno'}</Text>
                        <Text color={COLORES.secundario}>{Math.max(0, datosCsv.length - 1)} filas • {datosCsv[0]?.length || 0} columnas</Text>
                    </Box>

                    <Box marginBottom={1} flexDirection="row">
                        <Text color={COLORES.secundario}>Valor {'>'} </Text>
                        {modo === "editar" ? (
                            <Box width={40}>
                                <TextInput value={valorEdicion} onChange={setValorEdicion} onSubmit={() => {
                                    const nd = [...datosCsv];
                                    nd[seleccion.fila][seleccion.columna] = valorEdicion;
                                    setDatosCsv(nd);
                                    setModo("vista");
                                }} />
                            </Box>
                        ) : <Text color={COLORES.titulo} bold>{datosCsv[seleccion.fila]?.[seleccion.columna]}</Text>}
                    </Box>

                    {datosCsv[0] && (
                        <Box flexDirection="row">
                            <Box width={4} justifyContent="flex-end" paddingRight={1}><Text color={COLORES.secundario}>#</Text></Box>
                            {datosCsv[0].map((celda, j) => (
                                <Box key={j} width={15} paddingX={1} backgroundColor={modo === "vista" && seleccion.columna === j ? COLORES.textoOscuro : undefined}>
                                    <Text bold color={modo === "vista" && seleccion.columna === j ? COLORES.acento : COLORES.titulo}>{celda.toUpperCase()}</Text>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {datosCsv.slice(seleccion.fila < 1 ? 1 : seleccion.fila, (seleccion.fila < 1 ? 1 : seleccion.fila) + 7).map((fila, i) => {
                        const indiceReal = (seleccion.fila < 1 ? 1 : seleccion.fila) + i;
                        if (indiceReal === 0) return null;
                        const rowSel = modo === "vista" && seleccion.fila === indiceReal;
                        return (
                            <Box key={indiceReal} flexDirection="row">
                                <Box width={4} justifyContent="flex-end" paddingRight={1} backgroundColor={rowSel ? COLORES.acento : undefined}>
                                    <Text color={rowSel ? COLORES.textoOscuro : COLORES.titulo}>{indiceReal}</Text>
                                </Box>
                                {fila.map((celda, j) => (
                                    <Box key={j} width={15} paddingX={1} backgroundColor={rowSel && seleccion.columna === j ? COLORES.celdaSeleccionada : undefined}>
                                        <Text color={rowSel && seleccion.columna === j ? COLORES.textoOscuro : COLORES.titulo} wrap="truncate-end">
                                            {celda}
                                        </Text>
                                    </Box>
                                ))}
                            </Box>
                        );
                    })}

                    <Box marginTop={1} flexDirection="row" justifyContent="space-between">
                        <Text color={COLORES.secundario}>
                            <Text color={COLORES.acento} bold>A</Text> abrir • <Text color={COLORES.acento} bold>G</Text> guardar • <Text color={COLORES.acento} bold>Enter</Text> editar • <Text color={COLORES.acento} bold>{'<'}</Text> ascend • <Text color={COLORES.acento} bold>{'>'}</Text> descend • <Text color={COLORES.acento} bold>Esc</Text> salir
                        </Text>
                        <Text color={COLORES.secundario}>Fila {seleccion.fila} • Columna {seleccion.columna + 1}</Text>
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