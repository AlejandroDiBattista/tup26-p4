#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { TextInput } from '@inkjs/ui';
import fs from 'node:fs';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};

function App({ archivoInicial }) {
    const { exit } = useApp();
    const [archivoActual, setArchivoActual] = useState(archivoInicial || '');
    const [cabeceras, setCabeceras] = useState([]);
    const [filas, setFilas] = useState([]);
    const [error, setError] = useState('');

    const [filaActiva, setFilaActiva] = useState(0);
    const [columnaActiva, setColumnaActiva] = useState(0);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [valorEdicion, setValorEdicion] = useState('');

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
        if (filas.length > 0) {
            if (key.return) {
                setValorEdicion(filas[filaActiva][columnaActiva]);
                setModoEdicion(true);
                return;
            }
            if (tecla === '<') {
                setFilas([...filas].sort((a, b) => a[columnaActiva].localeCompare(b[columnaActiva], 'es', { numeric: true })));
            }
            if (tecla === '>') {
                setFilas([...filas].sort((a, b) => b[columnaActiva].localeCompare(a[columnaActiva], 'es', { numeric: true })));
            }
            if (key.upArrow) setFilaActiva(f => Math.max(0, f - 1));
            if (key.downArrow) setFilaActiva(f => Math.min(filas.length - 1, f + 1));
            if (key.leftArrow) setColumnaActiva(c => Math.max(0, c - 1));
            if (key.rightArrow) setColumnaActiva(c => Math.min(cabeceras.length - 1, c + 1));
        }
    }, { isActive: !modoEdicion });

    useInput((tecla, key) => {
        if (key.escape) {
            setModoEdicion(false);
        }
    }, { isActive: modoEdicion });

    useEffect(() => {
        if (archivoActual) {
            try {
                if (fs.existsSync(archivoActual)) {
                    const contenido = fs.readFileSync(archivoActual, 'utf-8');
                    const lineas = contenido.trim().split(/\r?\n/u);
                    if (lineas.length > 0) {
                        setCabeceras(lineas[0].split(','));
                        setFilas(lineas.slice(1).map(linea => linea.split(',')));
                        setFilaActiva(0);
                        setColumnaActiva(0);
                    }
                } else {
                    setError(`El archivo '${archivoActual}' no existe.`);
                }
            } catch (err) {
                setError(`Error al leer el archivo: ${err.message}`);
            }
        }
    }, [archivoActual]);

    const guardarEdicion = (nuevoValor) => {
        const nuevasFilas = [...filas];
        const nuevaFila = [...nuevasFilas[filaActiva]];
        nuevaFila[columnaActiva] = nuevoValor;
        nuevasFilas[filaActiva] = nuevaFila;
        setFilas(nuevasFilas);
        setModoEdicion(false);
    };

    const cantidadFilasVisibles = FILAS - 8;
    const inicioVentana = Math.max(0, Math.min(filaActiva - Math.floor(cantidadFilasVisibles / 2), filas.length - cantidadFilasVisibles));
    const filasMostradas = filas.slice(inicioVentana, inicioVentana + cantidadFilasVisibles);

    return (
        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
            <Box width={COLUMNAS - 4} height={FILAS - 4} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo} paddingX={1}>
                
                <Box justifyContent="space-between" marginBottom={1}>
                    <Text bold color={COLORES.titulo}>Editor CSV</Text>
                    <Text color={COLORES.secundario}>
                        {archivoActual ? `Archivo: ${archivoActual}` : 'Ningún archivo'} | Filas: {filas.length} | Columnas: {cabeceras.length}
                    </Text>
                </Box>

                {error && <Text color="red">{error}</Text>}

                <Box flexDirection="column" flexGrow={1}>
                    {cabeceras.length > 0 && (
                        <Box flexDirection="column">
                            <Box flexDirection="row" borderBottom borderColor={COLORES.borde}>
                                <Box width={4}><Text bold color={COLORES.acento}> N° </Text></Box>
                                {cabeceras.map((cabecera, i) => (
                                    <Box key={`h-${i}`} width={15}>
                                        <Text bold color={COLORES.acento}>{cabecera}</Text>
                                    </Box>
                                ))}
                            </Box>

                            {filasMostradas.map((fila, indexRelativo) => {
                                const indexFilaReal = inicioVentana + indexRelativo;
                                return (
                                    <Box key={`r-${indexFilaReal}`} flexDirection="row">
                                        <Box width={4}><Text color={COLORES.secundario}> {indexFilaReal + 1} </Text></Box>
                                        {fila.map((celda, indexCelda) => {
                                            const esActiva = indexFilaReal === filaActiva && indexCelda === columnaActiva;
                                            return (
                                                <Box key={`c-${indexFilaReal}-${indexCelda}`} width={15} backgroundColor={esActiva ? COLORES.acento : undefined}>
                                                    <Text color={esActiva ? COLORES.fondo : COLORES.titulo}>{celda}</Text>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </Box>

                <Box marginTop={1} justifyContent="space-between">
                    {modoEdicion ? (
                        <Box flexDirection="row">
                            <Text color={COLORES.acento} bold>Editando celda [{filaActiva + 1}, {columnaActiva + 1}]: </Text>
                            <TextInput value={valorEdicion} onChange={setValorEdicion} onSubmit={guardarEdicion} />
                        </Box>
                    ) : (
                        <Text color={COLORES.secundario}>
                            Celda: [{filaActiva + 1}, {columnaActiva + 1}] | Valor: <Text bold color={COLORES.titulo}>{filas[filaActiva]?.[columnaActiva] || ''}</Text>
                        </Text>
                    )}
                    <Text color={COLORES.secundario}>
                        {modoEdicion ? <Text><Text bold color={COLORES.acento}>Enter</Text> guardar | <Text bold color={COLORES.acento}>Esc</Text> cancelar</Text> : <Text><Text bold color={COLORES.acento}>Enter</Text> editar | <Text bold color={COLORES.acento}>&lt; &gt;</Text> ordenar | <Text bold color={COLORES.acento}>Esc</Text> salir</Text>}
                    </Text>
                </Box>
            </Box>
        </Box>
    );
}

const argumentoArchivo = process.argv[2];
const app = render(<App archivoInicial={argumentoArchivo} />);
await app.waitUntilExit();
console.clear();