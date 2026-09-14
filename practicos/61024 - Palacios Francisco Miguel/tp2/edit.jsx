#!/usr/bin/env -S node --import tsx

import React, {useState} from 'react';
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

const archivo = process.argv[2];
const nombreArchivo = basename(archivo);

function convertirACsv(datos) {
    return datos.map(fila => fila.join(',')).join('\n');
}

function App({tabla}) {
    const {exit} = useApp();
    const [filaSeleccionada, setFilaSeleccionada] = useState(0);
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);
    const [editando, setEditando] = useState(false);
    const [datos, setDatos] = useState(tabla);
    const cantidadFilas = datos.length;
    const cantidadColumnas = datos[0].length;
    const valorActual = datos[filaSeleccionada][columnaSeleccionada];

    async function guardar() {
        const contenido = convertirACsv(datos);
        await writeFile(archivo, contenido, 'utf-8');
    }

    function ordenar() {
        const encabezado = datos[0];
        const filas = datos.slice(1);
        const nuevasFilas = filas.sort((a, b) => {
            return a[columnaSeleccionada].localeCompare(b[columnaSeleccionada]);
        });
        setDatos([encabezado, ...nuevasFilas]);
    }
    
    useInput((tecla, key) => {
        if (key.escape) {
            if (editando) {
                setEditando(false);
            } else {
                exit();
            }
        }

        if (key.ctrl && tecla === 's') {
            guardar();
        }

        if (tecla === 's') {
            ordenar();
        }

        if (key.downArrow) {
            setFilaSeleccionada(fila => Math.min(fila + 1, tabla.length - 1));
        }
        
        if (key.upArrow) {
            setFilaSeleccionada(fila => Math.max(fila - 1, 0));
        }

        if (key.rightArrow) {
            setColumnaSeleccionada(columna => Math.min(columna + 1, tabla[0].length - 1));
        }
        if (key.leftArrow) {
            setColumnaSeleccionada(columna => Math.max(columna - 1, 0));
        }
        if (key.return) {
            setEditando(true);
        }
    })

    return (
        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
            <Box width={40} height={10} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
                <Box flexGrow={1} justifyContent="center" alignItems="center">
                    <Text bold color={COLORES.titulo}>Editor CSV</Text>
                    <Text color={COLORES.secundario}>{nombreArchivo}</Text>
                    <Text color={COLORES.secundario}>
                        Filas:{cantidadFilas} | Columnas:{cantidadColumnas}
                    </Text>
                </Box>
            {datos.map((fila, indice) => (
                <Text key={indice}>
                    {fila.map((columna, indiceColumna) => (
                    <Text key={indiceColumna} color={indice === filaSeleccionada && indiceColumna === columnaSeleccionada ? COLORES.acento : undefined}>
                        {indice === filaSeleccionada && indiceColumna === columnaSeleccionada && editando ? (
                            <TextInput defaultValue={valorActual}
                            onSubmit={(valorNuevo) => {
                            const nuevosDatos = datos.map((fila, indiceFila) =>
                              indiceFila === filaSeleccionada
                            ? fila.map((columna, indiceColumna) =>
                                indiceColumna === columnaSeleccionada ? valorNuevo : columna
                            )
                            : fila
                        );
                    setDatos(nuevosDatos);
                    setEditando(false);
                    }}
                    />
                    ) : (
                        columna
                    )}
                    {' | '}
                    </Text>
                ))}
                </Text>
            ))}
                <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>
            </Box>
        </Box>
    );
}

const contenido = await readFile(archivo, 'utf-8');
const filas = contenido.split('\n').filter(fila => fila.trim() !== '');
const tabla = filas.map(fila => fila.split(','));


const app = render(<App tabla = {tabla} />);
await app.waitUntilExit();
console.clear();