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
    acento: '#edbb64'
};

function App() {
    const { exit } = useApp();
    const [archivo, setArchivo] = useState(process.argv[2] || '');
    const [cabeceras, setCabeceras] = useState([]);
    const [filas, setFilas] = useState([]);
    const [filaIdx, setFilaIdx] = useState(0);
    const [colIdx, setColIdx] = useState(0);
    const [scrollOffset, setScrollOffset] = useState(0);
    const [modo, setModo] = useState('ver');
    const [inputBuffer, setInputBuffer] = useState('');
    const [error, setError] = useState('');

    const maxVisibles = Math.max(5, FILAS - 12);

    const leerCSV = async (ruta) => {
        try {
            const data = await readFile(ruta, 'utf-8');
            const lineas = data.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
            if (lineas.length === 0) return;

            const headers = lineas[0].split(',').map(s => s.trim());
            const rows = lineas.slice(1).map(l => l.split(',').map(s => s.trim()));

            setCabeceras(headers);
            setFilas(rows);
            setArchivo(ruta);
            setFilaIdx(0);
            setColIdx(0);
            setScrollOffset(0);
            setError('');
            setModo('ver');
        } catch (e) {
            setError(`No se pudo abrir ${ruta}`);
            setModo('ver');
        }
    };

    const guardarCSV = async (ruta) => {
        try {
            const contenido = [cabeceras.join(','), ...filas.map(f => f.join(','))].join('\n') + '\n';
            await writeFile(ruta, contenido, 'utf-8');
            setArchivo(ruta);
            setError('');
            setModo('ver');
        } catch (e) {
            setError(`Error al guardar en ${ruta}`);
            setModo('ver');
        }
    };

    useEffect(() => {
        if (archivo) {
            leerCSV(archivo);
        }
    }, []);

    useInput((tecla, key) => {
        if (modo !== 'ver') {
            if (key.escape) {
                setModo('ver');
            }
            return;
        }

        if (key.escape) {
            exit();
            return;
        }

        if (key.upArrow) {
            setFilaIdx(prev => {
                const next = Math.max(0, prev - 1);
                if (next < scrollOffset) setScrollOffset(next);
                return next;
            });
        }

        if (key.downArrow) {
            setFilaIdx(prev => {
                const next = Math.min(filas.length - 1, prev + 1);
                if (next >= scrollOffset + maxVisibles) {
                    setScrollOffset(next - maxVisibles + 1);
                }
                return next;
            });
        }

        if (key.leftArrow) {
            setColIdx(prev => Math.max(0, prev - 1));
        }

        if (key.rightArrow) {
            setColIdx(prev => Math.min(cabeceras.length - 1, prev + 1));
        }

        if (tecla === 'a' || tecla === 'A') {
            setError('');
            setInputBuffer(archivo || '');
            setModo('abrir');
        }

        if (tecla === 'g' || tecla === 'G') {
            setError('');
            setInputBuffer(archivo || '');
            setModo('guardar');
        }

        if (key.return && filas.length > 0) {
            setError('');
            setInputBuffer(filas[filaIdx]?.[colIdx] || '');
            setModo('editar');
        }

        if (tecla === '<' && filas.length > 0) {
            const ordenada = [...filas].sort((a, b) => {
                const nA = parseFloat(a[colIdx]);
                const nB = parseFloat(b[colIdx]);
                if (!isNaN(nA) && !isNaN(nB)) return nA - nB;
                return (a[colIdx] || '').localeCompare(b[colIdx] || '');
            });
            setFilas(ordenada);
        }

        if (tecla === '>' && filas.length > 0) {
            const ordenada = [...filas].sort((a, b) => {
                const nA = parseFloat(a[colIdx]);
                const nB = parseFloat(b[colIdx]);
                if (!isNaN(nA) && !isNaN(nB)) return nB - nA;
                return (b[colIdx] || '').localeCompare(a[colIdx] || '');
            });
            setFilas(ordenada);
        }
    });

    const anchos = cabeceras.map((c, i) => {
        let max = c.length;
        for (let row of filas) {
            if (row[i] && row[i].length > max) max = row[i].length;
        }
        return Math.max(max + 2, 8);
    });

    const listaFilas = filas.slice(scrollOffset, scrollOffset + maxVisibles);

    return (
        <Box width={COLUMNAS} height={FILAS} flexDirection="column" paddingX={2} paddingY={1} backgroundColor={COLORES.fondo}>
            {/* Barra superior */}
            <Box justifyContent="space-between">
                <Text bold color={COLORES.titulo}>
                    {archivo ? basename(archivo) : '(Sin archivo)'}
                </Text>
                <Text color={COLORES.secundario}>
                    {filas.length} filas · {cabeceras.length} columnas
                </Text>
            </Box>

            {/* Input activo para Guardar / Abrir / Editar */}
            {modo === 'guardar' && (
                <Box marginY={1}>
                    <Text bold color={COLORES.acento}>Guardar › </Text>
                    <TextInput defaultValue={inputBuffer} onSubmit={(val) => guardarCSV(val.trim())} />
                </Box>
            )}

            {modo === 'abrir' && (
                <Box marginY={1}>
                    <Text bold color={COLORES.acento}>Abrir › </Text>
                    <TextInput defaultValue={inputBuffer} onSubmit={(val) => leerCSV(val.trim())} />
                </Box>
            )}

            {modo === 'editar' && (
                <Box marginY={1}>
                    <Text bold color={COLORES.acento}>Editar [{filaIdx + 1}, {cabeceras[colIdx]}] › </Text>
                    <TextInput
                        defaultValue={inputBuffer}
                        onSubmit={(val) => {
                            const mod = filas.map((r, i) => {
                                if (i !== filaIdx) return r;
                                const nueva = [...r];
                                nueva[colIdx] = val;
                                return nueva;
                            });
                            setFilas(mod);
                            setModo('ver');
                        }}
                    />
                </Box>
            )}

            {/* Tabla */}
            <Box flexDirection="column" flexGrow={1} marginY={1}>
                {cabeceras.length > 0 && (
                    <>
                        <Box>
                            <Box width={5}>
                                <Text bold color={COLORES.secundario}>#</Text>
                            </Box>
                            {cabeceras.map((head, i) => (
                                <Box key={i} width={anchos[i]}>
                                    <Text bold color={COLORES.titulo}>
                                        {head.toUpperCase()}
                                    </Text>
                                </Box>
                            ))}
                        </Box>

                        {listaFilas.map((fila, rel) => {
                            const abs = scrollOffset + rel;
                            const filaSeleccionada = abs === filaIdx;

                            return (
                                <Box key={abs}>
                                    <Box width={5}>
                                        <Text color={COLORES.secundario}>{String(abs + 1).padStart(2, ' ')}</Text>
                                    </Box>
                                    {fila.map((valor, c) => {
                                        const celdaActiva = filaSeleccionada && c === colIdx;
                                        return (
                                            <Box
                                                key={c}
                                                width={anchos[c]}
                                                backgroundColor={celdaActiva ? '#dcdcdc' : undefined}
                                            >
                                                <Text
                                                    bold={celdaActiva}
                                                    color={celdaActiva ? '#000000' : COLORES.titulo}
                                                >
                                                    {valor}
                                                </Text>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            );
                        })}
                    </>
                )}
            </Box>

            {/* Barra inferior */}
            {modo === 'ver' ? (
                <Box justifyContent="space-between">
                    <Text color={COLORES.secundario}>
                        <Text bold color={COLORES.acento}>A</Text> abrir · <Text bold color={COLORES.acento}>G</Text> guardar · <Text bold color={COLORES.acento}>Enter</Text> editar · <Text bold color={COLORES.acento}>&lt; &gt;</Text> ordenar · <Text bold color={COLORES.acento}>Esc</Text> salir
                    </Text>
                    <Text color={COLORES.secundario}>
                        Fila {filaIdx + 1} · Columna {colIdx + 1}
                    </Text>
                </Box>
            ) : (
                <Box justifyContent="space-between">
                    <Text color={COLORES.secundario}>
                        <Text bold color={COLORES.acento}>Enter</Text> confirmar · <Text bold color={COLORES.acento}>Esc</Text> cancelar
                    </Text>
                </Box>
            )}

            {error ? (
                <Box marginTop={1}>
                    <Text color="#ff6b6b">{error}</Text>
                </Box>
            ) : null}
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();