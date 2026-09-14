#!/usr/bin/env -S node --import tsx

import React, { useState } from 'react';
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
};

const ANCHO_CELDA = 18;
const archivo = process.argv[2] || 'empleados.csv';
const nombreArchivo = basename(archivo);

function convertirACsv(datos) {
    return datos.map(fila => fila.join(',')).join('\n');
}

function App({ tabla }) {
    const { exit } = useApp();

    const [filaSeleccionada, setFilaSeleccionada] = useState(0);
    const [filaInicio, setFilaInicio] = useState(0);
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);
    const [editando, setEditando] = useState(false);
    const [datos, setDatos] = useState(tabla);
    const [modoPrompt, setModoPrompt] = useState(null);
    const [mensaje, setMensaje] = useState('');

    const encabezado = datos[0];
    const filas = datos.slice(1);
    const filasVisibles = 5;
    const cantidadFilas = filas.length;
    const cantidadColumnas = encabezado.length;
    const valorActual = filas[filaSeleccionada]?.[columnaSeleccionada] ?? '';
    const filaActual = filaSeleccionada + 1;
    const columnaActual = columnaSeleccionada + 1;

    async function guardarEn(path) {
        try {
            await writeFile(path, convertirACsv(datos), 'utf-8');
            setMensaje(`Guardado en ${path}`);
        } catch (error) {
            setMensaje(`Error: ${error.message}`);
        }
    }

    async function abrirArchivo(path) {
        try {
            const contenido = await readFile(path, 'utf-8');
            const nuevaTabla = contenido
                .split('\n')
                .filter(fila => fila.trim() !== '')
                .map(fila => fila.split(','));

            setDatos(nuevaTabla);
            setFilaSeleccionada(0);
            setFilaInicio(0);
            setColumnaSeleccionada(0);
            setMensaje(`Abierto ${path}`);
        } catch (error) {
            setMensaje(`Error: ${error.message}`);
        }
    }

    function ordenar(asc = true) {
        const encabezadoActual = datos[0];
        const filasActuales = [...datos.slice(1)];

        filasActuales.sort((a, b) => {
            const uno = String(a[columnaSeleccionada]);
            const dos = String(b[columnaSeleccionada]);
            return asc ? uno.localeCompare(dos) : dos.localeCompare(uno);
        });

        setDatos([encabezadoActual, ...filasActuales]);
    }

    useInput((tecla, key) => {
        if (modoPrompt) return;

        if (key.ctrl && tecla === 'c') {
            exit();
            return;
        }

        if (key.escape) {
            if (editando) {
                setEditando(false);
                return;
            }
            exit();
            return;
        }

        if (editando) return;

        if (tecla === 'a') {
            setModoPrompt('abrir');
            setMensaje('Nombre del archivo:');
            return;
        }

        if (tecla === 'g') {
            setModoPrompt('guardar');
            setMensaje('Guardar como:');
            return;
        }

        if (tecla === '<') {
            ordenar(true);
            return;
        }

        if (tecla === '>') {
            ordenar(false);
            return;
        }

        if (tecla === 's') {
            ordenar(true);
            return;
        }

        if (key.downArrow) {
            setFilaSeleccionada(fila => {
                const nuevaFila = Math.min(fila + 1, filas.length - 1);

                if (nuevaFila >= filaInicio + filasVisibles) {
                    setFilaInicio(inicio => inicio + 1);
                }

                return nuevaFila;
            });
        }

        if (key.upArrow) {
            setFilaSeleccionada(fila => {
                const nuevaFila = Math.max(fila - 1, 0);

                if (nuevaFila < filaInicio) {
                    setFilaInicio(inicio => inicio - 1);
                }

                return nuevaFila;
            });
        }

        if (key.rightArrow) {
            setColumnaSeleccionada(columna =>
                Math.min(columna + 1, cantidadColumnas - 1)
            );
        }

        if (key.leftArrow) {
            setColumnaSeleccionada(columna => Math.max(columna - 1, 0));
        }

        if (key.return) {
            setEditando(true);
        }

        if (key.ctrl && tecla === 's') {
            guardarEn(archivo);
        }
    });

    if (modoPrompt) {
        return (
            <Box
                width={COLUMNAS}
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
            >
                <Box
                    width={COLUMNAS - 10}
                    borderStyle="round"
                    borderColor={COLORES.borde}
                    flexDirection="column"
                    paddingX={2}
                >
                    <Text color={COLORES.titulo}>{mensaje}</Text>
                    <TextInput
                        defaultValue={archivo}
                        onSubmit={async valor => {
                            const nombre = valor.trim() || archivo;

                            if (modoPrompt === 'guardar') {
                                await guardarEn(nombre);
                            } else {
                                await abrirArchivo(nombre);
                            }

                            setModoPrompt(null);
                            setMensaje('');
                        }}
                    />
                </Box>
            </Box>
        );
    }

    return (
        <Box
            width={COLUMNAS}
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            paddingLeft={1}
            paddingRight={1}
        >
            <Box
                width={COLUMNAS - 4}
                flexDirection="column"
                borderStyle="round"
                borderColor={COLORES.borde}
                backgroundColor={COLORES.fondo}
                paddingX={1}
            >
                <Box justifyContent="space-between" alignItems="center">
                    <Text bold color={COLORES.titulo}>{nombreArchivo}</Text>
                    <Text color={COLORES.secundario}>
                        {cantidadFilas} filas · {cantidadColumnas} columnas
                    </Text>
                </Box>

                <Text color={COLORES.secundario}>
                    Valor seleccionado: {valorActual}
                </Text>

                <Text color={COLORES.secundario}>
                    Posición: fila {filaActual}, columna {columnaActual}
                </Text>

                <Box flexDirection="row">
                    <Box width={4} minWidth={4} paddingRight={1}>
                        <Text color={COLORES.titulo}>#</Text>
                    </Box>

                    {encabezado.map((titulo, indice) => (
                        <Box key={indice} width={ANCHO_CELDA} minWidth={ANCHO_CELDA} paddingRight={1}>
                            <Text
                                wrap="truncate"
                                color={
                                    indice === columnaSeleccionada
                                        ? COLORES.acento
                                        : COLORES.titulo
                                }
                            >
                                {String(titulo)}
                            </Text>
                        </Box>
                    ))}
                </Box>

                <Box height={filasVisibles} flexDirection="column">
                    {filas.slice(filaInicio, filaInicio + filasVisibles).map((fila, indice) => {
                        const indiceReal = filaInicio + indice;
                        const esFilaActual = indiceReal === filaSeleccionada;

                        return (
                            <Box key={indiceReal} flexDirection="row" alignItems="center">
                                <Box width={4} minWidth={4} paddingRight={1}>
                                    <Text color={COLORES.secundario}>{indiceReal + 1}</Text>
                                </Box>

                                {fila.map((columna, indiceColumna) => {
                                    const esCeldaActual =
                                        esFilaActual && indiceColumna === columnaSeleccionada;
                                    const mostrandoInput = esCeldaActual && editando;

                                    return (
                                        <React.Fragment key={`${indiceReal}-${indiceColumna}`}>
                                            <Box
                                                width={ANCHO_CELDA}
                                                minWidth={ANCHO_CELDA}
                                                paddingRight={1}
                                            >
                                                {mostrandoInput ? (
                                                    <TextInput
                                                        defaultValue={String(columna)}
                                                        onSubmit={valorNuevo => {
                                                            const nuevosDatos = datos.map(
                                                                (filaDatos, indiceFila) =>
                                                                    indiceFila === indiceReal + 1
                                                                        ? filaDatos.map(
                                                                              (valor, columnaIndex) =>
                                                                                  columnaIndex === indiceColumna
                                                                                      ? valorNuevo
                                                                                      : valor
                                                                          )
                                                                        : filaDatos
                                                            );

                                                            setDatos(nuevosDatos);
                                                            setEditando(false);
                                                        }}
                                                    />
                                                ) : (
                                                    <Text
                                                        wrap="truncate"
                                                        color={
                                                            esCeldaActual
                                                                ? COLORES.acento
                                                                : COLORES.titulo
                                                        }
                                                    >
                                                        {String(columna)}
                                                    </Text>
                                                )}
                                            </Box>

                                            {indiceColumna < fila.length - 1 && (
                                                <Text color={COLORES.secundario}>{' | '}</Text>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </Box>
                        );
                    })}
                </Box>

                <Text color={COLORES.secundario}>
                    <Text bold color={COLORES.acento}>Esc</Text> salir
                </Text>

                {mensaje ? <Text color={COLORES.secundario}>{mensaje}</Text> : null}
            </Box>
        </Box>
    );
}

const contenido = await readFile(archivo, 'utf-8');
const filas = contenido.split('\n').filter(fila => fila.trim() !== '');
const tabla = filas.map(fila => fila.split(','));

const app = render(<App tabla={tabla} />);
await app.waitUntilExit();
console.clear();