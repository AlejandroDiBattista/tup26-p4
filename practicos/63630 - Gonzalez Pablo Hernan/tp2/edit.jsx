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

function App() {
    const {exit} = useApp();


    const [modo, setModo] = useState('navegando');
    const [encabezado, setEncabezado] = useState([]);
    const [filas, setFilas] = useState([]);
    const [filaSeleccionada, setFilaSeleccionada] = useState(0);
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);
    const [nombreArchivo, setNombreArchivo] = useState(null);
    const [error, setError] = useState(null);


    useEffect(() => {
    const archivo = process.argv[2];
    setNombreArchivo(archivo);

    async function cargar() {

        if(archivo != undefined){

        const contenido = await readFile(archivo, 'utf8')
        
        const lineas = contenido.split(/\r?\n/);
        const primeraLinea = lineas[0].split(',');
        const restoDeLineas = lineas.slice(1)
        .filter((linea) => linea !== '')
        .map((linea) => linea.split(','));


        setEncabezado(primeraLinea);
        setFilas(restoDeLineas);


        }

    }
    cargar();

    }, []);


    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
        if (key.downArrow) {
            setFilaSeleccionada(Math.min(filaSeleccionada + 1, filas.length - 1));
        }
        if (key.upArrow) {
            setFilaSeleccionada(Math.max(filaSeleccionada - 1, 0));
        }
        if (key.rightArrow) {
            setColumnaSeleccionada(Math.min(columnaSeleccionada + 1, encabezado.length - 1));
        }
        if (key.leftArrow) {
            setColumnaSeleccionada(Math.max(columnaSeleccionada - 1, 0));
        }
                if (tecla === '<') {
                    const copia = filas.slice();
                    copia.sort((filaA, filaB) => filaA[columnaSeleccionada].localeCompare(filaB[columnaSeleccionada]));
                    setFilas(copia);
                }
                if (tecla === '>') {
                    const copia = filas.slice();
                    copia.sort((filaA, filaB) => filaB[columnaSeleccionada].localeCompare(filaA[columnaSeleccionada]));
                    setFilas(copia);
                }

    })


    return (
    <Box flexDirection="column" width={120} borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>

        <Box flexDirection="row" justifyContent="space-between" marginBottom={1}>
            <Text>{nombreArchivo}</Text>
            <Text>{filas.length} filas · {encabezado.length} columnas</Text>
        </Box>

            <Box marginBottom={1}>
                <Text>Valor {'>'} {filas[filaSeleccionada]?.[columnaSeleccionada]}</Text>
            </Box>

        <Box flexDirection="row">
            <Box width={4}>
                <Text bold color={COLORES.titulo}>#</Text>
            </Box>
            {encabezado.map((columna, indice) => (
                <Box key={indice} width={20}>
                    <Text bold color={COLORES.titulo}> {columna} </Text>
                </Box>
            ))}
        </Box>

        <Box flexDirection="column" marginBottom={1}>

            {filas.map((fila, indiceFila) => (
                <Box key={indiceFila} flexDirection="row">
                    <Box width={4}>
                        <Text>{indiceFila + 1}</Text>
                    </Box>
                    {fila.map((valor, indiceColumna) => {
                        const esSeleccionada = indiceFila === filaSeleccionada && indiceColumna === columnaSeleccionada;
                        return (
                            <Box key={indiceColumna} width={20}>
                                <Text backgroundColor={esSeleccionada ? COLORES.acento : undefined}> {valor} </Text>
                            </Box>
                        );
                    })}

                </Box>
            ))}
        </Box>

        <Box flexDirection="row" justifyContent="space-between">
            <Text color={COLORES.secundario}>
                <Text bold color={COLORES.acento}>A</Text> abrir ·{' '}
                <Text bold color={COLORES.acento}>G</Text> guardar ·{' '}
                <Text bold color={COLORES.acento}>Enter</Text> editar ·{' '}
                <Text bold color={COLORES.acento}>{'<'}</Text> ascendente ·{' '}
                <Text bold color={COLORES.acento}>{'>'}</Text> descendente ·{' '}
                <Text bold color={COLORES.acento}>Esc</Text> salir
            </Text>
            <Text color={COLORES.secundario}>Fila {filaSeleccionada + 1} · Columna {columnaSeleccionada + 1}</Text>
        </Box>

    </Box>
);

}

const app = render(<App />);
await app.waitUntilExit();
console.clear();