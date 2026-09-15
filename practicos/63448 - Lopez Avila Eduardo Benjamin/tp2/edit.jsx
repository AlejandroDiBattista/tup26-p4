#!/usr/bin/env -S node --import tsx

import React, { useMemo, useState } from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {TextInput} from '@inkjs/ui';
import {readFile, writeFile} from 'node:fs/promises';
import {basename} from 'node:path';

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
    error:     '#ff5555'
};

const FILAS_POR_PAGINA = 24;

async function parseFile(filePath) {
    const data = await readFile(filePath, 'utf8');
    const tabla = { header: [], filas: [] };
    tabla.filas = data.split(/\r?\n|\r/).map((fila) => fila.split(","));
    tabla.header = tabla.filas.shift();
    tabla.filas = tabla.filas.filter(fila => fila.length === tabla.header.length);
    tabla.filas = tabla.filas.map(fila => fila.map(campo => campo.trim()));
    return tabla;
}

function Header({ header, anchos, colSeleccionada }) {
    return (
        <Box flexDirection="row" marginBottom={1}>
            <Box width={4} alignItems="flex-end" paddingRight={1}>
                <Text color={COLORES.secundario} bold>N°</Text>
            </Box>
            {header.map((campo, index) => {
                const estaSeleccionada = index === colSeleccionada;
                return (
                    <Box key={index} width={anchos[index] + 4}>
                        <Text color={estaSeleccionada ? COLORES.acento : COLORES.titulo} bold>
                            {campo.toUpperCase()}
                        </Text>
                    </Box>
                );
            })}
        </Box>
    );
}

function Row({ fila, indice, anchos, filaSeleccionada, colSeleccionada }) {
    return (
        <Box flexDirection="row">
            <Box width={4} alignItems="flex-end" paddingRight={1}>
                <Text color={filaSeleccionada ? COLORES.acento : COLORES.titulo}>{indice}</Text>
            </Box>
            {fila.map((campo, index) => {
                const celdaSeleccionada = filaSeleccionada && index === colSeleccionada;
                return (
                    <Box 
                        key={index} 
                        width={anchos[index] + 4}
                        backgroundColor={celdaSeleccionada ? COLORES.titulo : undefined}
                    >
                        <Text color={celdaSeleccionada ? COLORES.fondo : COLORES.titulo}>
                            {campo}
                        </Text>
                    </Box>
                );
            })}
        </Box>
    );
}

function App({ rutaInicial, dataInicial }) {
    const {exit} = useApp();
    
    const [ruta, setRuta] = useState(rutaInicial);
    const [header, setHeader] = useState(dataInicial.header);
    const [filas, setFilas] = useState(dataInicial.filas);
    
    const [selectedRow, setSelectedRow] = useState(0);
    const [selectedCol, setSelectedCol] = useState(0);
    const [windowStart, setWindowStart] = useState(0);
    
    const [modo, setModo] = useState('normal'); 
    const [mensaje, setMensaje] = useState('');

    useInput((input, key) => {
        if (modo !== 'normal') {
            if (key.escape) {
                setModo('normal');
                setMensaje('');
            }
            return;
        }

        if (key.escape) {
            exit();
        }
        
        if (key.return) {
            setModo('editar');
            return;
        }

        const char = input.toLowerCase();
        if (char === 'a') {
            setModo('abrir');
            return;
        }
        if (char === 'g') {
            setModo('guardar');
            return;
        }

        if (key.upArrow || key.downArrow || key.leftArrow || key.rightArrow) {
            setMensaje('');
        }

        if (key.upArrow) {
            setSelectedRow((prev) => {
                const next = Math.max(0, prev - 1);
                setWindowStart((prevStart) => (next < prevStart ? next : prevStart));
                return next;
            });
        }
        if (key.downArrow) {
            setSelectedRow((prev) => {
                const next = Math.min(filas.length - 1, prev + 1);
                setWindowStart((prevStart) => {
                    if (next >= prevStart + FILAS_POR_PAGINA) {
                        return next - FILAS_POR_PAGINA + 1;
                    }
                    return prevStart;
                });
                return next;
            });
        }
        if (key.leftArrow) {
            setSelectedCol((prev) => Math.max(0, prev - 1));
        }
        if (key.rightArrow) {
            setSelectedCol((prev) => Math.min(header.length - 1, prev + 1));
        }
        if (input === '<') {
            setFilas((prevFilas) => {
                return [...prevFilas].sort((a, b) => {
                    const valA = a[selectedCol] ?? '';
                    const valB = b[selectedCol] ?? '';
                    return valA.localeCompare(valB, undefined, { numeric: true });
                });
            });
        }
        if (input === '>') {
            setFilas((prevFilas) => {
                return [...prevFilas].sort((a, b) => {
                    const valA = a[selectedCol] ?? '';
                    const valB = b[selectedCol] ?? '';
                    return valB.localeCompare(valA, undefined, { numeric: true });
                });
            });
        }
    });

    const onSubmitEditar = (valor) => {
        const nuevasFilas = [...filas];
        nuevasFilas[selectedRow] = [...nuevasFilas[selectedRow]];
        nuevasFilas[selectedRow][selectedCol] = valor;
        setFilas(nuevasFilas);
        setModo('normal');
    };

    const onSubmitGuardar = async (valor) => {
        try {
            const contenido = [
                header.join(','),
                ...filas.map(f => f.join(','))
            ].join('\n');
            await writeFile(valor, contenido, 'utf8');
            setRuta(valor);
            setMensaje('Archivo guardado correctamente.');
            setModo('normal');
        } catch (error) {
            setMensaje(`Error al guardar: ${error.message}`);
            setModo('normal');
        }
    };

    const onSubmitAbrir = async (valor) => {
        try {
            const tabla = await parseFile(valor);
            setHeader(tabla.header);
            setFilas(tabla.filas);
            setRuta(valor);
            setSelectedRow(0);
            setSelectedCol(0);
            setWindowStart(0);
            setMensaje('');
            setModo('normal');
        } catch (error) {
            setMensaje(`Error al abrir: ${error.message}`);
            setModo('normal');
        }
    };

    const anchos = useMemo(() => {
        return header.map((col, i) => {
            const maxFila = Math.max(...filas.map(f => (f[i] || '').length));
            return Math.max(col.length, maxFila);
        });
    }, [header, filas]);

    const filasVisibles = filas.slice(windowStart, windowStart + FILAS_POR_PAGINA);
    
    return (
        <Box flexDirection="column" borderStyle="round" borderColor={COLORES.borde} paddingX={1} paddingY={0}>
            <Box flexDirection="row" justifyContent="space-between" marginBottom={1}>
                <Text bold color={COLORES.titulo}>{basename(ruta)}</Text>
                <Text color={COLORES.secundario}>{filas.length} filas · {header.length} columnas</Text>
            </Box>

            <Box marginBottom={1}>
                {modo === 'normal' && (
                    <Text color={COLORES.secundario}>
                        Valor › <Text color={COLORES.titulo}>{filas[selectedRow]?.[selectedCol] || ''}</Text>
                        {mensaje && <Text color={COLORES.error}>  ({mensaje})</Text>}
                    </Text>
                )}
                {modo === 'editar' && (
                    <Box>
                        <Text color={COLORES.secundario}>Valor › </Text>
                        <TextInput defaultValue={filas[selectedRow][selectedCol]} onSubmit={onSubmitEditar} />
                    </Box>
                )}
                {modo === 'guardar' && (
                    <Box>
                        <Text color={COLORES.secundario}>Guardar en: </Text>
                        <TextInput defaultValue={ruta} onSubmit={onSubmitGuardar} />
                    </Box>
                )}
                {modo === 'abrir' && (
                    <Box>
                        <Text color={COLORES.secundario}>Abrir archivo: </Text>
                        <TextInput placeholder="ruta/del/archivo.csv" onSubmit={onSubmitAbrir} />
                    </Box>
                )}
            </Box>

            <Header header={header} anchos={anchos} colSeleccionada={selectedCol} />
            {filasVisibles.map((fila, index) => {
                const indiceReal = windowStart + index;
                return (
                    <Row 
                        key={indiceReal} 
                        fila={fila} 
                        indice={indiceReal + 1} 
                        anchos={anchos} 
                        filaSeleccionada={indiceReal === selectedRow}
                        colSeleccionada={selectedCol}
                    />
                );
            })}
            <Box flexDirection="row" justifyContent="space-between" marginTop={2}>
                <Text color={COLORES.secundario}>
                    <Text color={COLORES.acento} bold>A</Text> abrir · <Text color={COLORES.acento} bold>G</Text> guardar · <Text color={COLORES.acento} bold>Enter</Text> editar · <Text color={COLORES.acento} bold>{'<'}</Text> ascendente · <Text color={COLORES.acento} bold>{'>'}</Text> descendente · <Text color={COLORES.acento} bold>Esc</Text> salir
                </Text>
                <Text color={COLORES.secundario}>Fila {selectedRow + 1} · Columna {selectedCol + 1}</Text>
            </Box>
        </Box>
    );
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Uso: npx tsx edit.jsx <archivo.csv>");
        process.exit(1);
    }
    const filePath = args[0];
    try {
        const tabla = await parseFile(filePath);
        console.clear();
        await render(<App rutaInicial={filePath} dataInicial={tabla} />);
    } catch (error) {
        console.error(`Error al leer el archivo inicial ${filePath}:`, error.message);
        process.exit(1);
    }
}

main();