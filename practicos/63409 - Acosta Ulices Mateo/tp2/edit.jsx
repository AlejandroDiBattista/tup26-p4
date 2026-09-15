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

function parsearCSV(texto) {
    const lineas = texto.split(/\r\n|\n/).filter((l) => l.length > 0);
    const header = lineas[0].split(',');
    const filas = lineas.slice(1).map((l) => l.split(','));
    return {header, filas};
}

function anchoDeColumnas(datos) {
    return datos.header.map((titulo, i) => {
        let ancho = titulo.length;
        for (const fila of datos.filas) {
            const valor = fila[i] || '';
            if (valor.length > ancho) ancho = valor.length;
        }
        return ancho;
    });
}

function App({archivoInicial}) {
    const {exit} = useApp();

    const [archivo, setArchivo] = useState(archivoInicial || null);
    const [datos, setDatos] = useState(null);
    const [filaSel, setFilaSel] = useState(0);
    const [colSel, setColSel] = useState(0);

    useEffect(() => {
        if (archivoInicial) {
            readFile(archivoInicial, 'utf8').then((texto) => {
                setDatos(parsearCSV(texto));
                setArchivo(archivoInicial);
            });
        }
    }, []);

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        } else if (!datos) {
            return;
        } else if (key.upArrow) {
            setFilaSel((f) => Math.max(0, f - 1));
        } else if (key.downArrow) {
            setFilaSel((f) => Math.min(datos.filas.length - 1, f + 1));
        } else if (key.leftArrow) {
            setColSel((c) => Math.max(0, c - 1));
        } else if (key.rightArrow) {
            setColSel((c) => Math.min(datos.header.length - 1, c + 1));
        }
    });

    const filasVisibles = Math.max(3, FILAS - 9);
    let inicio = 0;
    if (datos && filaSel >= filasVisibles) {
        inicio = filaSel - filasVisibles + 1;
    }

    const anchos = datos ? anchoDeColumnas(datos) : [];
    const filasAMostrar = datos ? datos.filas.slice(inicio, inicio + filasVisibles) : [];
    const anchoNumero = datos ? String(datos.filas.length).length : 1;

    return (
        <Box width={COLUMNAS} flexDirection="column" padding={1}>
            {!datos && (
                <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
                    <Box width={40} height={10} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
                        <Box flexGrow={1} justifyContent="center" alignItems="center">
                            <Text bold color={COLORES.titulo}>Editor CSV</Text>
                        </Box>
                        <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>
                    </Box>
                </Box>
            )}

            {datos && (
                <Box flexDirection="column">
                    <Box justifyContent="space-between">
                        <Text bold color={COLORES.titulo}>{basename(archivo)}</Text>
                        <Text color={COLORES.secundario}>{datos.filas.length} filas · {datos.header.length} columnas</Text>
                    </Box>

                    <Box marginTop={1}>
                        <Text color={COLORES.secundario}>Valor › <Text bold color={COLORES.titulo}>{datos.filas[filaSel][colSel]}</Text></Text>
                    </Box>

                    <Box marginTop={1} flexDirection="column">
                        <Box>
                            <Text color={COLORES.secundario}>{' '.repeat(anchoNumero + 1)}</Text>
                            {datos.header.map((titulo, i) => (
                                <Text
                                    key={i}
                                    bold
                                    color={i === colSel ? COLORES.fondo : COLORES.acento}
                                    backgroundColor={i === colSel ? COLORES.acento : undefined}
                                >
                                    {' ' + titulo.toUpperCase().padEnd(anchos[i]) + ' '}
                                </Text>
                            ))}
                        </Box>
                        {filasAMostrar.map((fila, i) => {
                            const numeroFila = inicio + i;
                            const esFilaSel = numeroFila === filaSel;
                            return (
                                <Box key={numeroFila}>
                                    <Text
                                        color={esFilaSel ? COLORES.fondo : COLORES.secundario}
                                        backgroundColor={esFilaSel ? COLORES.acento : undefined}
                                    >
                                        {String(numeroFila + 1).padStart(anchoNumero) + ' '}
                                    </Text>
                                    {fila.map((valor, c) => {
                                        const esCeldaSel = esFilaSel && c === colSel;
                                        return (
                                            <Text
                                                key={c}
                                                color={esCeldaSel ? COLORES.fondo : COLORES.titulo}
                                                backgroundColor={esCeldaSel ? '#ffffff' : undefined}
                                            >
                                                {' ' + valor.padEnd(anchos[c]) + ' '}
                                            </Text>
                                        );
                                    })}
                                </Box>
                            );
                        })}
                    </Box>

                    <Box marginTop={1} justifyContent="space-between">
                        <Text color={COLORES.secundario}><Text bold color={COLORES.acento}>Esc</Text> salir</Text>
                        <Text color={COLORES.secundario}>Fila {filaSel + 1} · Columna {colSel + 1}</Text>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

const archivoInicial = process.argv[2];
const app = render(<App archivoInicial={archivoInicial} />);
await app.waitUntilExit();
console.clear();