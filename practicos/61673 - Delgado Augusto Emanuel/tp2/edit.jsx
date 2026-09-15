#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
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

const parsearCSV = (txt) => {
    const lineas = txt.replace(/\r/g, '').trim().split('\n');
    return {
        cabecera: lineas[0].split(','),
        filas: lineas.slice(1).map((l) => l.split(','))
    };
};

const aCSV = (cabecera, filas) =>
    [cabecera.join(','), ...filas.map((f) => f.join(','))].join('\n') + '\n';


function App() {
    const {exit} = useApp();
    
    const [archivo, setArchivo]   = useState(process.argv[2] ? basename(process.argv[2]) : '');
    const [cabecera, setCabecera] = useState([]);
    const [filas, setFilas]       = useState([]);
    const [fila, setFila]         = useState(0);
    const [col, setCol]           = useState(0);
    const [offset, setOffset]     = useState(0);
    const [modo, setModo]         = useState('ver'); 
    const [error, setError]       = useState('');
    const filasVisibles = Math.max(5, FILAS - 7);

     // función para leer y cargar un archivo CSV 
    const cargar = async (ruta) => {
        try {
            const data = await readFile(ruta, 'utf-8');
            const res = parsearCSV(data);
            setCabecera(res.cabecera);
            setFilas(res.filas);
            setArchivo(basename(ruta));
            setFila(0);
            setCol(0);
            setOffset(0);
            setError('');
            setModo('ver');
        } catch (e) {
            setError(e.message);
            setModo('ver');
        }
    };

    // guarda los datos actuales en el archivo especificado
    const guardar = async (ruta) => {
        try {
            await writeFile(ruta, aCSV(cabecera, filas), 'utf-8');
            setArchivo(basename(ruta));
            setError('');
            setModo('ver');
        } catch (e) {
            setError(e.message);
            setModo('ver');
        }
    };


    // al iniciar si se especificó un archivo por línea de comandos lo carga directamente
    useEffect(() => {
        if (process.argv[2]) {
            cargar(process.argv[2]);
        }
    }, []);

    // navegación con teclado
    useInput((char, key) => {
        // si estamos en un modo secundario, Esc cancela y vuelve a 'ver'
        if (modo !== 'ver') {
            if (key.escape) setModo('ver');
            return;
        }
        if (key.escape) return exit();

        // navegación con flechas
        if (key.upArrow && fila > 0) {
            setFila((f) => f - 1);
            if (fila - 1 < offset) setOffset(fila - 1);
        }
        if (key.downArrow && fila < filas.length - 1) {
            setFila((f) => f + 1);
            if (fila + 1 >= offset + filasVisibles) setOffset(fila + 2 - filasVisibles);
        }
        if (key.leftArrow && col > 0) {
            setCol((c) => c - 1);
        }
        if (key.rightArrow && col < cabecera.length - 1) {
            setCol((c) => c + 1);
        }
    });

     const anchos = cabecera.map((c, i) =>
        Math.max(c.length, ...filas.map((f) => (f[i] || '').length)) + 3
    );
    
    // Valor de la celda actualmente seleccionada
     const valorCelda = filas[fila]?.[col] ?? '';

    return (
        <Box flexDirection="column" width={COLUMNAS} paddingX={1} paddingTop={1}>
            {/* Información superior */}
            <Box justifyContent="space-between">
                <Text bold color={COLORES.titulo}>{archivo || 'editor.csv'}</Text>
                {cabecera.length > 0 && (
                    <Text color={COLORES.secundario}>{filas.length} filas · {cabecera.length} columnas</Text>
                )}
            </Box>
            {/* Muestra el valor de la celda enfocada */}
             <Box marginY={1}>
                {modo === 'abrir' && (
                    <Box>
                        <Text bold color={COLORES.acento}>Abrir › </Text>
                        <TextInput placeholder="nombre archivo..." onSubmit={cargar} />
                    </Box>
                )}
                {modo === 'guardar' && (
                    <Box>
                        <Text bold color={COLORES.acento}>Guardar › </Text>
                        <TextInput defaultValue={archivo} onSubmit={guardar} />
                    </Box>
                )}
                {modo === 'ver' && (
                    <Text color={COLORES.secundario}>Valor › <Text bold color={COLORES.titulo}>{valorCelda}</Text></Text>
                )}
            </Box>
            {error ? <Text color="red">Error: {error}</Text> : null}
            {/* Cabecera de la tabla */}
            {cabecera.length > 0 && (
                <Box>
                    <Box width={5} justifyContent="flex-end" paddingRight={1}>
                        <Text bold color={COLORES.secundario}>#</Text>
                    </Box>
                    {cabecera.map((c, i) => (
                        <Box key={i} width={anchos[i]}>
                            {/* Resalta la columna activa con color */}
                            <Text bold color={i === col ? COLORES.acento : COLORES.secundario}>
                                {c.toUpperCase()}
                            </Text>
                        </Box>
                    ))}
                </Box>
            )}
            {/* Filas con scroll según offset */}
            {filas.slice(offset, offset + filasVisibles).map((f, i) => {
                const ri = offset + i;
                const esFila = ri === fila;
                return (
                    <Box key={ri}>
                        <Box width={5} justifyContent="flex-end" paddingRight={1}>
                            <Text bold color={esFila ? COLORES.acento : COLORES.secundario}>{ri + 1}</Text>
                        </Box>
                        {f.map((v, ci) => (
                            <Box key={ci} width={anchos[ci]}>
                                {/* Celda activa resaltada con fondo claro */}
                                {esFila && ci === col ? (
                                    <Text backgroundColor="#eae4d9" color="#161310" bold>{v}</Text>
                                ) : (
                                    <Text color={COLORES.titulo}>{v}</Text>
                                )}
                            </Box>
                        ))}
                    </Box>
                );
            })}
            {/* Barra inferior con posición actual */}
            <Box marginTop={1} justifyContent="space-between">
                {modo === 'ver' ? (
                <Text color={COLORES.secundario}>
                    <Text bold color={COLORES.acento}>A</Text> abrir · <Text bold color={COLORES.acento}>G</Text> guardar · <Text bold color={COLORES.acento}>Esc</Text> salir
                </Text>
                ) : (
                    <Text color={COLORES.secundario}>
                        <Text bold color={COLORES.acento}>Enter</Text> {modo === 'abrir' ? 'abrir' : 'guardar'} · <Text bold color={COLORES.acento}>Esc</Text> cancelar
                    </Text>
                )}
                {cabecera.length > 0 && (
                    <Text color={COLORES.secundario}>Fila {fila + 1} · Columna {col + 1}</Text>
                )}
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();