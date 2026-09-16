#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile, writeFile } from 'node:fs/promises';
import { TextInput } from '@inkjs/ui';
import { basename } from 'node:path';

const SCREEN_W = process.stdout.columns || 80;
const SCREEN_H = process.stdout.rows || 24;

const PALETA = {
    fondo: '#161310',
    borde: '#726b61',
    textoPrincipal: '#ede7db',
    textoSecundario: '#ada79e',
    destacado: '#edbb64',
    celdaActiva: '#dcdcdc',
    textoActivo: '#000000',
    alerta: '#e06c75'
};

function parsearContenidoCSV(str) {
    const renglones = str.split(/\r?\n/).map(r => r.trim()).filter(Boolean);
    if (!renglones.length) return { cabecera: [], matriz: [] };
    const cabecera = renglones[0].split(',').map(c => c.trim());
    const matriz = renglones.slice(1).map(r => r.split(',').map(c => c.trim()));
    return { cabecera, matriz };
}

function generarTextoCSV(cabecera, matriz) {
    return [cabecera.join(','), ...matriz.map(fila => fila.join(','))].join('\n') + '\n';
}

function EditorCSV() {
    const { exit } = useApp();

    const [archivoActual, setArchivoActual] = useState(process.argv[2] || '');
    const [headers, setHeaders] = useState([]);
    const [filasDatos, setFilasDatos] = useState([]);

    const [indiceFila, setIndiceFila] = useState(0);
    const [indiceCol, setIndiceCol] = useState(0);
    const [vistaInicio, setVistaInicio] = useState(0);

    const [accion, setAccion] = useState('navegar'); // 'navegar' | 'abrir' | 'guardar' | 'editar'
    const [textoInput, setTextoInput] = useState('');
    const [mensajeError, setMensajeError] = useState('');

    const renglonesVisibles = Math.max(5, SCREEN_H - 12);

    const cargarDesdeDisco = async (ruta) => {
        try {
            const raw = await readFile(ruta, 'utf-8');
            const { cabecera, matriz } = parsearContenidoCSV(raw);
            setHeaders(cabecera);
            setFilasDatos(matriz);
            setArchivoActual(ruta);
            setIndiceFila(0);
            setIndiceCol(0);
            setVistaInicio(0);
            setMensajeError('');
            setAccion('navegar');
        } catch (err) {
            setMensajeError(`Error al leer: ${ruta}`);
            setAccion('navegar');
        }
    };

    const escribirEnDisco = async (ruta) => {
        try {
            const salida = generarTextoCSV(headers, filasDatos);
            await writeFile(ruta, salida, 'utf-8');
            setArchivoActual(ruta);
            setMensajeError('');
            setAccion('navegar');
        } catch (err) {
            setMensajeError(`Error al guardar: ${ruta}`);
            setAccion('navegar');
        }
    };

    useEffect(() => {
        if (archivoActual) {
            cargarDesdeDisco(archivoActual);
        }
    }, []);

    useInput((tecla, keys) => {
        if (accion !== 'navegar') {
            if (keys.escape) setAccion('navegar');
            return;
        }

        if (keys.escape) {
            exit();
            return;
        }

        // Movimiento vertical
        if (keys.upArrow) {
            setIndiceFila(actual => {
                const destino = Math.max(0, actual - 1);
                if (destino < vistaInicio) setVistaInicio(destino);
                return destino;
            });
        }
        if (keys.downArrow) {
            setIndiceFila(actual => {
                const destino = Math.min(filasDatos.length - 1, actual + 1);
                if (destino >= vistaInicio + renglonesVisibles) {
                    setVistaInicio(destino - renglonesVisibles + 1);
                }
                return destino;
            });
        }

        // Movimiento horizontal
        if (keys.leftArrow) {
            setIndiceCol(actual => Math.max(0, actual - 1));
        }
        if (keys.rightArrow) {
            setIndiceCol(actual => Math.min(headers.length - 1, actual + 1));
        }

        // Teclas de atajo
        const t = tecla.toLowerCase();
        if (t === 'a') {
            setMensajeError('');
            setTextoInput(archivoActual || '');
            setAccion('abrir');
        } else if (t === 'g') {
            setMensajeError('');
            setTextoInput(archivoActual || '');
            setAccion('guardar');
        } else if (keys.return && filasDatos.length > 0) {
            setMensajeError('');
            setTextoInput(filasDatos[indiceFila]?.[indiceCol] || '');
            setAccion('editar');
        } else if (tecla === '<' && filasDatos.length > 0) {
            const ord = [...filasDatos].sort((rA, rB) => {
                const a = rA[indiceCol] ?? '';
                const b = rB[indiceCol] ?? '';
                const nA = parseFloat(a);
                const nB = parseFloat(b);
                if (!isNaN(nA) && !isNaN(nB)) return nA - nB;
                return a.localeCompare(b);
            });
            setFilasDatos(ord);
        } else if (tecla === '>' && filasDatos.length > 0) {
            const ord = [...filasDatos].sort((rA, rB) => {
                const a = rA[indiceCol] ?? '';
                const b = rB[indiceCol] ?? '';
                const nA = parseFloat(a);
                const nB = parseFloat(b);
                if (!isNaN(nA) && !isNaN(nB)) return nB - nA;
                return b.localeCompare(a);
            });
            setFilasDatos(ord);
        }
    });

    const colWidths = headers.map((h, col) => {
        let mayor = h.length;
        for (let i = 0; i < filasDatos.length; i++) {
            const val = filasDatos[i][col] || '';
            if (val.length > mayor) mayor = val.length;
        }
        return Math.max(mayor + 2, 8);
    });

    const renglonesEnPantalla = filasDatos.slice(vistaInicio, vistaInicio + renglonesVisibles);

    return (
        <Box width={SCREEN_W} height={SCREEN_H} flexDirection="column" paddingX={2} paddingY={1} backgroundColor={PALETA.fondo}>
            {/* Barra superior */}
            <Box justifyContent="space-between">
                <Text bold color={PALETA.textoPrincipal}>
                    {archivoActual ? basename(archivoActual) : '(Sin archivo)'}
                </Text>
                <Text color={PALETA.textoSecundario}>
                    {filasDatos.length} filas · {headers.length} columnas
                </Text>
            </Box>

            {/* Acciones de input */}
            {accion === 'guardar' && (
                <Box marginY={1}>
                    <Text bold color={PALETA.destacado}>Guardar › </Text>
                    <TextInput defaultValue={textoInput} onSubmit={val => escribirEnDisco(val.trim())} />
                </Box>
            )}

            {accion === 'abrir' && (
                <Box marginY={1}>
                    <Text bold color={PALETA.destacado}>Abrir › </Text>
                    <TextInput defaultValue={textoInput} onSubmit={val => cargarDesdeDisco(val.trim())} />
                </Box>
            )}

            {accion === 'editar' && (
                <Box marginY={1}>
                    <Text bold color={PALETA.destacado}>Editar [{indiceFila + 1}, {headers[indiceCol]}] › </Text>
                    <TextInput
                        defaultValue={textoInput}
                        onSubmit={val => {
                            const actualizadas = filasDatos.map((r, i) => {
                                if (i !== indiceFila) return r;
                                const copia = [...r];
                                copia[indiceCol] = val;
                                return copia;
                            });
                            setFilasDatos(actualizadas);
                            setAccion('navegar');
                        }}
                    />
                </Box>
            )}

            {/* Grilla con datos */}
            <Box flexDirection="column" flexGrow={1} marginY={1}>
                {headers.length > 0 && (
                    <>
                        <Box>
                            <Box width={5}>
                                <Text bold color={PALETA.textoSecundario}>#</Text>
                            </Box>
                            {headers.map((nombreCol, c) => (
                                <Box key={c} width={colWidths[c]}>
                                    <Text bold color={PALETA.textoPrincipal}>
                                        {nombreCol.toUpperCase()}
                                    </Text>
                                </Box>
                            ))}
                        </Box>

                        {renglonesEnPantalla.map((registro, idxRel) => {
                            const filaGlobal = vistaInicio + idxRel;
                            const filaSeleccionada = filaGlobal === indiceFila;

                            return (
                                <Box key={filaGlobal}>
                                    <Box width={5}>
                                        <Text color={PALETA.textoSecundario}>
                                            {String(filaGlobal + 1).padStart(2, ' ')}
                                        </Text>
                                    </Box>
                                    {registro.map((dato, colIdx) => {
                                        const foco = filaSeleccionada && colIdx === indiceCol;
                                        return (
                                            <Box
                                                key={colIdx}
                                                width={colWidths[colIdx]}
                                                backgroundColor={foco ? PALETA.celdaActiva : undefined}
                                            >
                                                <Text
                                                    bold={foco}
                                                    color={foco ? PALETA.textoActivo : PALETA.textoPrincipal}
                                                >
                                                    {dato}
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

            {/* Pie de pantalla */}
            {accion === 'navegar' ? (
                <Box justifyContent="space-between">
                    <Text color={PALETA.textoSecundario}>
                        <Text bold color={PALETA.destacado}>A</Text> abrir · <Text bold color={PALETA.destacado}>G</Text> guardar · <Text bold color={PALETA.destacado}>Enter</Text> editar · <Text bold color={PALETA.destacado}>&lt; &gt;</Text> ordenar · <Text bold color={PALETA.destacado}>Esc</Text> salir
                    </Text>
                    <Text color={PALETA.textoSecundario}>
                        Fila {indiceFila + 1} · Columna {indiceCol + 1}
                    </Text>
                </Box>
            ) : (
                <Box justifyContent="space-between">
                    <Text color={PALETA.textoSecundario}>
                        <Text bold color={PALETA.destacado}>Enter</Text> confirmar · <Text bold color={PALETA.destacado}>Esc</Text> cancelar
                    </Text>
                </Box>
            )}

            {mensajeError ? (
                <Box marginTop={1}>
                    <Text color={PALETA.alerta}>{mensajeError}</Text>
                </Box>
            ) : null}
        </Box>
    );
}

const app = render(<EditorCSV />);
await app.waitUntilExit();
console.clear();