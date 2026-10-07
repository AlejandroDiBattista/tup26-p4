#!/usr/bin/env -S node --import tsx

import React, {useState, useEffect} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';

const COLUMNAS = process.stdout.columns || 100;
const FILAS    = process.stdout.rows || 24;
const MAX_VISIBLES = FILAS - 12; 

const COLORES = {
    fondo:      '#161310',
    borde:      '#726b61',
    titulo:     '#ede7db',
    secundario: '#ada79e',
    acento:     '#edbb64',
    error:      '#ff6b6b'
};

const archivoInicial = process.argv[2] || null;

function App() {
    const [archivo, setArchivo]           = useState(archivoInicial);
    const [filaActual, setFilaActual]     = useState(0);
    const [colActual, setColActual]       = useState(0);
    const [offset, setOffset]             = useState(0); 
    const [filas, setFilas]               = useState([]);
    
    
    const [modo, setModo]                 = useState('normal'); 
    const [valorEdicion, setValorEdicion] = useState('');
    const [inputArchivo, setInputArchivo] = useState('');
    
    const [ordenCol, setOrdenCol]         = useState(null);
    const [ordenAsc, setOrdenAsc]         = useState(true);
    const [mensaje, setMensaje]           = useState(null); 
    const cargarDatos = async (rutaArchivo) => {
        try {
            const contenido = await readFile(rutaArchivo, 'utf-8');
            const filasLeidas = contenido.split('\n')
                .map(f => f.trimEnd())
                .filter(f => f !== '')
                .map(f => f.split(','));
            
            setFilas(filasLeidas);
            setArchivo(rutaArchivo);
            setFilaActual(0);
            setColActual(0);
            setOffset(0);
            setMensaje(null);
            return true;
        } catch (error) {
            setMensaje({ tipo: 'error', texto: `Error al abrir: ${error.message}` });
            return false;
        }
    };

    useEffect(() => {
        if (archivoInicial) cargarDatos(archivoInicial);
    }, []);

    const {exit} = useApp();

    const guardarDatos = async (rutaDestino) => {
        try {
            const contenido = filas.map(f => f.join(',')).join('\n');
            await writeFile(rutaDestino, contenido, 'utf-8');
            setArchivo(rutaDestino);
            setMensaje({ tipo: 'exito', texto: 'Guardado exitosamente.' });
            setTimeout(() => setMensaje(null), 3000);
        } catch (error) {
            setMensaje({ tipo: 'error', texto: `Error al guardar: ${error.message}` });
        }
    };

    const ordenar = (ascendente) => {
        if (filas.length <= 1) return;
        const encabezado = filas[0];
        const datos = filas.slice(1);

        const ordenados = [...datos].sort((a, b) => {
            const valA = a[colActual] || '';
            const valB = b[colActual] || '';
            const numA = Number(valA);
            const numB = Number(valB);

            if (!isNaN(numA) && !isNaN(numB)) {
                return ascendente ? numA - numB : numB - numA;
            }
            return ascendente ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });

        setFilas([encabezado, ...ordenados]);
        setOrdenCol(colActual);
        setOrdenAsc(ascendente);
    };

    const datos = filas.slice(1);
    const cantFilas = datos.length;
    const cantCols = filas[0]?.length || 0;

    useInput((tecla, key) => {
        
        if (modo !== 'normal') {
            if (key.escape) {
                setModo('normal');
                setMensaje(null);
            }
            return;
        }

        if (key.escape) exit();

        
        if (key.upArrow) {
            setFilaActual(prev => {
                const next = Math.max(prev - 1, 0);
                if (next < offset) setOffset(next);
                return next;
            });
        }
        if (key.downArrow) {
            setFilaActual(prev => {
                const next = Math.min(prev + 1, Math.max(0, cantFilas - 1));
                if (next >= offset + MAX_VISIBLES) setOffset(next - MAX_VISIBLES + 1);
                return next;
            });
        }
        if (key.leftArrow)  setColActual(prev => Math.max(prev - 1, 0));
        if (key.rightArrow) setColActual(prev => Math.min(prev + 1, Math.max(0, cantCols - 1)));

        
        if (key.return && cantFilas > 0) {
            setValorEdicion(datos[filaActual]?.[colActual] ?? '');
            setModo('edicion');
        }

        if (tecla === 'a' || tecla === 'A') {
            setInputArchivo('');
            setModo('abrir');
            setMensaje(null);
        }
        if (tecla === 'g' || tecla === 'G') {
            setInputArchivo(archivo || '');
            setModo('guardar');
            setMensaje(null);
        }

        if (tecla === '<') ordenar(true);
        if (tecla === '>') ordenar(false);
    });

    const encabezado = filas[0];
    const datosVisibles = datos.slice(offset, offset + MAX_VISIBLES);

    return (
        <Box width={COLUMNAS} flexDirection="column">
            
            
            <Box justifyContent="space-between" paddingX={1} paddingBottom={1}>
                <Text bold color={COLORES.titulo}>{archivo || 'Sin archivo'}</Text>
                {filas.length > 0 && (
                    <Text color={COLORES.secundario}>{cantFilas} filas - {cantCols} columnas</Text>
                )}
            </Box>

           
            <Box paddingX={1} paddingBottom={1}>
                {filas.length > 0 && (
                    <Text color={COLORES.secundario}>
                        Valor:{' '}
                        <Text bold color={COLORES.titulo}>
                            {datos[filaActual]?.[colActual] || ''}
                        </Text>
                    </Text>
                )}
            </Box>

            
            <Box flexGrow={1} flexDirection="column" paddingX={1}>
                {encabezado && (
                    <Box flexDirection="row" borderBottom={false}>
                        <Text color={COLORES.secundario}>{'  # '}</Text>
                        {encabezado.map((col, j) => (
                            <Text key={j} bold color={COLORES.acento}>
                                {(col + (ordenCol === j ? (ordenAsc ? ' ▲' : ' ▼') : '')).padEnd(20)}
                            </Text>
                        ))}
                    </Box>
                )}

                {datosVisibles.map((fila, indexRelativo) => {
                    const indexReal = offset + indexRelativo;
                    return (
                        <Box key={indexReal} flexDirection="row">
                            <Text color={COLORES.secundario}>{String(indexReal + 1).padStart(3) + ' '}</Text>
                            {fila.map((celda, j) => {
                                const esActual = indexReal === filaActual && j === colActual;

                               
                                if (esActual && modo === 'edicion') {
                                    return (
                                        <Box key={j} width={20}>
                                            <TextInput
                                                defaultValue={valorEdicion}
                                                onSubmit={(nuevoValor) => {
                                                    const filasNuevas = [...filas];
                                                    filasNuevas[filaActual + 1][colActual] = nuevoValor;
                                                    setFilas(filasNuevas);
                                                    setModo('normal');
                                                }}
                                            />
                                        </Box>
                                    );
                                }

                                return (
                                    <Text key={j} inverse={esActual}>
                                        {(celda || '').padEnd(20)}
                                    </Text>
                                );
                            })}
                        </Box>
                    );
                })}
            </Box>

            
            {mensaje && (
                <Box paddingX={1} paddingTop={1}>
                    <Text color={mensaje.tipo === 'error' ? COLORES.error : COLORES.acento}>
                        {mensaje.texto}
                    </Text>
                </Box>
            )}

            {(modo === 'abrir' || modo === 'guardar') && (
                <Box paddingX={1} paddingTop={1} gap={1}>
                    <Text bold color={COLORES.acento}>
                        {modo === 'abrir' ? 'Abrir >' : 'Guardar >'}
                    </Text>
                    <Box width={30}>
                        <TextInput 
                            defaultValue={inputArchivo} 
                            onSubmit={async (val) => {
                                if (modo === 'abrir') {
                                    const exito = await cargarDatos(val);
                                    if (exito) setModo('normal');
                                } else {
                                    await guardarDatos(val);
                                    setModo('normal');
                                }
                            }}
                        />
                    </Box>
                </Box>
            )}

            <Box justifyContent="space-between" paddingX={1} paddingTop={1}>
                {modo === 'normal' ? (
                    <Text color={COLORES.secundario}>
                        <Text bold color={COLORES.acento}>A</Text> abrir{'  '}
                        <Text bold color={COLORES.acento}>G</Text> guardar{'  '}
                        <Text bold color={COLORES.acento}>Enter</Text> editar{'  '}
                        <Text bold color={COLORES.acento}>{'<'}</Text> ascendente{'  '}
                        <Text bold color={COLORES.acento}>{'>'}</Text> descendente{'  '}
                        <Text bold color={COLORES.acento}>Esc</Text> salir
                    </Text>
                ) : (
                    <Text color={COLORES.secundario}>
                        <Text bold color={COLORES.acento}>Enter</Text> confirmar{'  '}
                        <Text bold color={COLORES.acento}>Esc</Text> cancelar
                    </Text>
                )}
                
                {filas.length > 0 && modo === 'normal' && (
                    <Text color={COLORES.secundario}>
                        Fila {filaActual + 1} - Columna {colActual + 1}
                    </Text>
                )}
            </Box>
            
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();