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

function parseCSV(contenido) {
    const lineas = contenido.trim().split(/\r?\n/).filter(linea => linea.length > 0);
    if (lineas.length === 0) return { headers: [], rows: [] };
    const headers = lineas[0].split(',');
    const rows = lineas.slice(1).map(linea => linea.split(','));
    return { headers, rows };
}

function serializeCSV(headers, rows) {
    const lineas = [headers.join(',')];
    for (let i = 0; i < rows.length; i++) {
        lineas.push(rows[i].join(','));
    }
    return lineas.join('\n');
}

function ordenarFilas(filas, indice, descendente) {
    const copia = [...filas];
    copia.sort((a, b) => {
        const colA = a[indice] ?? '';
        const colB = b[indice] ?? '';
        const comp = colA.localeCompare(colB, 'es');
        if (descendente) {
            if (comp < 0) return 1;
            else if (comp > 0) return -1;
            else return 0;
        } else {
            if (comp < 0) return -1;
            else if (comp > 0) return 1;
            else return 0;
        }
    });
    return copia;
}

function App({archivoInicial}) {
    const {exit} = useApp();
    const [nombreArchivo, setNombreArchivo] = useState(archivoInicial || '');
    const [headers, setHeaders] = useState([]);
    const [filas, setFilas] = useState([]);
    const [error, setError] = useState(null);
    const [filaSeleccionada, setFilaSeleccionada] = useState(0);
    const [colSeleccionada, setColSeleccionada] = useState(0);
    const [desplazamiento, setDesplazamiento] = useState(0);
    const [modo, setModo] = useState('normal');
    const [valorEdicion, setValorEdicion] = useState('');
    const [inputArchivo, setInputArchivo] = useState('');

    const filasVisibles = FILAS - 6;

    async function abrirArchivo(nombre) {
        try {
            const contenido = await readFile(nombre, 'utf-8');
            const parsed = parseCSV(contenido);
            setHeaders(parsed.headers);
            setFilas(parsed.rows);
            setNombreArchivo(nombre);
            setFilaSeleccionada(0);
            setColSeleccionada(0);
            setDesplazamiento(0);
            setError(null);
        } catch (err) {
            setError('Error al abrir: ' + nombre);
        }
        setModo('normal');
    }

    async function guardarArchivo(nombre) {
        try {
            const contenido = serializeCSV(headers, filas);
            await writeFile(nombre, contenido, 'utf-8');
            setNombreArchivo(nombre);
            setError(null);
        } catch (err) {
            setError('Error al guardar: ' + nombre);
        }
        setModo('normal');
    }

    useEffect(() => {
        if (!archivoInicial) return;
        abrirArchivo(archivoInicial);
    }, [archivoInicial]);

    useInput((tecla, key) => {
        if (modo === 'edicion' || modo === 'abrir' || modo === 'guardar') return;

        if (key.escape) {
            exit();
        }
        if (tecla === '<') {
            setFilas(ordenarFilas(filas, colSeleccionada, false));
        }
        if (tecla === '>') {
            setFilas(ordenarFilas(filas, colSeleccionada, true));
        }
        if (key.upArrow) {
            const nueva = Math.max(0, filaSeleccionada - 1);
            setFilaSeleccionada(nueva);
            if (nueva < desplazamiento) setDesplazamiento(nueva);
        }
        if (key.downArrow) {
            const nueva = Math.min(filas.length - 1, filaSeleccionada + 1);
            setFilaSeleccionada(nueva);
            if (nueva >= desplazamiento + filasVisibles) setDesplazamiento(nueva - filasVisibles + 1);
        }
        if (key.leftArrow) {
            setColSeleccionada(col => Math.max(0, col - 1));
        }
        if (key.rightArrow) {
            setColSeleccionada(col => Math.min(headers.length - 1, col + 1));
        }
        if (key.return && filas.length > 0) {
            setValorEdicion(filas[filaSeleccionada][colSeleccionada]);
            setModo('edicion');
        }
        if (tecla === 'a' || tecla === 'A') {
            setInputArchivo('');
            setModo('abrir');
        }
        if (tecla === 'g' || tecla === 'G') {
            setInputArchivo(nombreArchivo);
            setModo('guardar');
        }
    });

    function confirmarEdicion(nuevoValor) {
        const nuevasFilas = filas.map((fila, fi) => {
            if (fi !== filaSeleccionada) return fila;
            return fila.map((celda, ci) => ci === colSeleccionada ? nuevoValor : celda);
        });
        setFilas(nuevasFilas);
        setModo('normal');
    }

    const valorActual = filas[filaSeleccionada] ? filas[filaSeleccionada][colSeleccionada] : '';
    const filasMostradas = filas.slice(desplazamiento, desplazamiento + filasVisibles);

    return (
        <Box width={COLUMNAS} height={FILAS} flexDirection="column">
            <Box flexDirection="row" borderStyle="round" borderColor={COLORES.borde}>
                <Text bold color={COLORES.titulo}> {nombreArchivo || 'sin archivo'} </Text>
                <Text color={COLORES.secundario}> {filas.length} filas × {headers.length} columnas</Text>
            </Box>

            <Box flexDirection="column" flexGrow={1} overflow="hidden">
                <Box flexDirection="row">
                    <Text color={COLORES.secundario}>{'    '}</Text>
                    {headers.map((h, i) => (
                        <Box key={i} width={14}>
                            <Text bold color={i === colSeleccionada ? COLORES.acento : COLORES.titulo}>{h.padEnd(13).slice(0, 13)}</Text>
                        </Box>
                    ))}
                </Box>

                {filasMostradas.map((fila, fi) => {
                    const filaReal = fi + desplazamiento;
                    return (
                        <Box key={filaReal} flexDirection="row">
                            <Text color={COLORES.secundario}>{String(filaReal + 1).padStart(3) + ' '}</Text>
                            {fila.map((celda, ci) => {
                                const seleccionada = filaReal === filaSeleccionada && ci === colSeleccionada;
                                return (
                                    <Box key={ci} width={14}>
                                        <Text backgroundColor={seleccionada ? COLORES.acento : undefined}
                                              color={seleccionada ? COLORES.fondo : COLORES.titulo}>
                                            {celda.padEnd(13).slice(0, 13)}
                                        </Text>
                                    </Box>
                                );
                            })}
                        </Box>
                    );
                })}
            </Box>

            {error && <Text color="red">{error}</Text>}

            {modo === 'edicion' && (
                <Box borderStyle="round" borderColor={COLORES.acento} flexDirection="row">
                    <Text color={COLORES.secundario}> Editar: </Text>
                    <TextInput
                        value={valorEdicion}
                        onChange={setValorEdicion}
                        onSubmit={confirmarEdicion}
                    />
                    <Text color={COLORES.secundario}> Esc cancela</Text>
                </Box>
            )}

            {modo === 'abrir' && (
                <Box borderStyle="round" borderColor={COLORES.acento} flexDirection="row">
                    <Text color={COLORES.secundario}> Abrir archivo: </Text>
                    <TextInput
                        value={inputArchivo}
                        onChange={setInputArchivo}
                        onSubmit={nombre => nombre ? abrirArchivo(nombre) : setModo('normal')}
                    />
                </Box>
            )}

            {modo === 'guardar' && (
                <Box borderStyle="round" borderColor={COLORES.acento} flexDirection="row">
                    <Text color={COLORES.secundario}> Guardar como: </Text>
                    <TextInput
                        value={inputArchivo}
                        onChange={setInputArchivo}
                        onSubmit={nombre => nombre ? guardarArchivo(nombre) : setModo('normal')}
                    />
                </Box>
            )}

            {modo === 'normal' && (
                <Box flexDirection="row" borderStyle="single" borderColor={COLORES.borde}>
                    <Text color={COLORES.secundario}>
                        {'  '}fila <Text color={COLORES.acento}>{filaSeleccionada + 1}</Text>
                        {'  '}col <Text color={COLORES.acento}>{colSeleccionada + 1}</Text>
                        {'  '}valor: <Text color={COLORES.titulo}>{valorActual}</Text>
                    </Text>
                    <Text color={COLORES.secundario}>
                        {'  '}<Text bold color={COLORES.acento}>Esc</Text> salir
                        {'  '}<Text bold color={COLORES.acento}>Enter</Text> editar
                        {'  '}<Text bold color={COLORES.acento}>A</Text> abrir
                        {'  '}<Text bold color={COLORES.acento}>G</Text> guardar
                        {'  '}<Text bold color={COLORES.acento}>{'<'}</Text> asc
                        {'  '}<Text bold color={COLORES.acento}>{'>'}</Text> desc
                    </Text>
                </Box>
            )}
        </Box>
    );
}

const archivoInicial = process.argv[2];
const app = render(<App archivoInicial={archivoInicial} />);
await app.waitUntilExit();
console.clear();