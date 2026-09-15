#!/usr/bin/env -S node --import tsx

import React, { useEffect, useState } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile, writeFile } from 'node:fs/promises';
import { TextInput } from '@inkjs/ui';
import { basename } from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS = process.stdout.rows || 24;

const ANCHO_COLUMNA = 16;

const COLORES = {
    fondo: '#161310',
    borde: '#726b61',
    titulo: '#ede7db',
    secundario: '#ada79e',
    acento: '#edbb64',
};

function ajustarTexto(texto, ancho) {
    const valor = String(texto ?? '');

    if (valor.length >= ancho) {
        return valor.slice(0, ancho - 2) + '…';
    }

    return valor.padEnd(ancho - 1);
}

function App() {
    const { exit } = useApp();

    const [archivo, setArchivo] = useState(null);

    const [cabecera, setCabecera] = useState([]);
    const [datos, setDatos] = useState([]);

    const [filaSeleccionada, setFilaSeleccionada] = useState(0);
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);

    const [modo, setModo] = useState('normal');

    const [entrada, setEntrada] = useState('');

    const [mensaje, setMensaje] = useState('');

    function cargarCSV(texto) {
        const textoLimpio = texto.trim();

        if (!textoLimpio) {
            throw new Error('El archivo CSV está vacío.');
        }

        const lineas = textoLimpio
            .split('\n')
            .map(linea => linea.replace('\r', ''));

        const nuevaCabecera = lineas[0].split(',');

        const nuevasFilas = lineas
            .slice(1)
            .map(linea => linea.split(','));

        const cantidadColumnas = nuevaCabecera.length;

        const filaIncorrecta = nuevasFilas.some(
            fila => fila.length !== cantidadColumnas
        );

        if (filaIncorrecta) {
            throw new Error(
                'El archivo contiene filas con distinta cantidad de columnas.'
            );
        }

        setCabecera(nuevaCabecera);
        setDatos(nuevasFilas);
    }

    async function abrirArchivo(nombre) {
        try {
            const texto = await readFile(nombre, 'utf8');

            cargarCSV(texto);

            setArchivo(nombre);
            setFilaSeleccionada(0);
            setColumnaSeleccionada(0);

            setMensaje(`Archivo abierto: ${basename(nombre)}`);

            return true;
        } catch (error) {
            setMensaje(`Error: ${error.message}`);
            return false;
        }
    }

    function generarCSV() {
        const lineas = [
            cabecera.join(','),
            ...datos.map(fila => fila.join(','))
        ];

        return lineas.join('\n');
    }

    async function guardarArchivo(nombre) {
        try {
            if (!nombre.trim()) {
                throw new Error('Debe indicar un nombre de archivo.');
            }

            const contenido = generarCSV();

            await writeFile(nombre, contenido, 'utf8');

            setArchivo(nombre);
            setMensaje(`Archivo guardado: ${basename(nombre)}`);

            return true;
        } catch (error) {
            setMensaje(`Error: ${error.message}`);
            return false;
        }
    }

    function ordenarDatos(direccion) {
        if (datos.length === 0) {
            return;
        }

        const columna = columnaSeleccionada;

        const copia = [...datos];

        copia.sort((a, b) => {
            const valorA = a[columna] ?? '';
            const valorB = b[columna] ?? '';

            const numeroA = Number(valorA);
            const numeroB = Number(valorB);

            const sonNumeros =
                valorA !== '' &&
                valorB !== '' &&
                !Number.isNaN(numeroA) &&
                !Number.isNaN(numeroB);

            let resultado;

            if (sonNumeros) {
                resultado = numeroA - numeroB;
            } else {
                resultado = valorA.localeCompare(
                    valorB,
                    'es',
                    { sensitivity: 'base' }
                );
            }

            if (direccion === 'desc') {
                return -resultado;
            }

            return resultado;
        });

        setDatos(copia);
        setFilaSeleccionada(0);

        const nombreColumna =
            cabecera[columnaSeleccionada] ?? '';

        if (direccion === 'asc') {
            setMensaje(
                `Orden ascendente por: ${nombreColumna}`
            );
        } else {
            setMensaje(
                `Orden descendente por: ${nombreColumna}`
            );
        }
    }

    useEffect(() => {
        const nombreArchivo = process.argv[2];

        if (nombreArchivo) {
            abrirArchivo(nombreArchivo);
        }
    }, []);

    useInput((input, key) => {

        if (key.escape) {

            if (modo !== 'normal') {
                setModo('normal');
                setEntrada('');
                setMensaje('Acción cancelada.');
                return;
            }

            exit();
            return;
        }

        if (modo !== 'normal') {
            return;
        }

        if (key.upArrow) {
            setFilaSeleccionada(fila =>
                Math.max(0, fila - 1)
            );

            setMensaje('');
            return;
        }

        if (key.downArrow) {
            setFilaSeleccionada(fila =>
                Math.min(
                    Math.max(0, datos.length - 1),
                    fila + 1
                )
            );

            setMensaje('');
            return;
        }

        if (key.leftArrow) {
            setColumnaSeleccionada(columna =>
                Math.max(0, columna - 1)
            );

            setMensaje('');
            return;
        }

        if (key.rightArrow) {
            setColumnaSeleccionada(columna =>
                Math.min(
                    Math.max(0, cabecera.length - 1),
                    columna + 1
                )
            );

            setMensaje('');
            return;
        }

        if (key.return) {
            const valor =
                datos[filaSeleccionada]?.[
                columnaSeleccionada
                ];

            if (valor !== undefined) {
                setEntrada(valor);
                setModo('editar');
                setMensaje('');
            }

            return;
        }

        if (input?.toLowerCase() === 'a') {
            setEntrada('');
            setModo('abrir');
            setMensaje('');
            return;
        }

        if (input?.toLowerCase() === 'g') {
            setEntrada(
                archivo ? basename(archivo) : ''
            );

            setModo('guardar');
            setMensaje('');
            return;
        }

        if (input === '<') {
            ordenarDatos('asc');
            return;
        }

        if (input === '>') {
            ordenarDatos('desc');
        }
    });

    const valorSeleccionado =
        datos[filaSeleccionada]?.[
        columnaSeleccionada
        ] ?? '';

    const FILAS_VISIBLES = Math.max(
        3,
        FILAS - 12
    );

    const inicioFila = Math.max(
        0,
        Math.min(
            filaSeleccionada -
            Math.floor(FILAS_VISIBLES / 2),

            Math.max(
                0,
                datos.length - FILAS_VISIBLES
            )
        )
    );

    const filasVisibles = datos.slice(
        inicioFila,
        inicioFila + FILAS_VISIBLES
    );

    const COLUMNAS_VISIBLES = Math.max(
        1,
        Math.floor(
            (COLUMNAS - 8) / ANCHO_COLUMNA
        )
    );

    const inicioColumna = Math.max(
        0,
        Math.min(
            columnaSeleccionada -
            Math.floor(COLUMNAS_VISIBLES / 2),

            Math.max(
                0,
                cabecera.length - COLUMNAS_VISIBLES
            )
        )
    );

    const cabecerasVisibles = cabecera.slice(
        inicioColumna,
        inicioColumna + COLUMNAS_VISIBLES
    );

    return (
        <Box
            width={COLUMNAS}
            height={FILAS}
            flexDirection="column"
            padding={1}
        >

            <Box
                flexDirection="column"
                flexGrow={1}
                borderStyle="round"
                borderColor={COLORES.borde}
                backgroundColor={COLORES.fondo}
                paddingX={1}
            >



                <Box justifyContent="space-between">

                    <Text
                        bold
                        color={COLORES.titulo}
                    >
                        Editor CSV
                    </Text>

                    <Text color={COLORES.acento}>
                        {archivo
                            ? basename(archivo)
                            : 'Sin archivo'}
                    </Text>

                </Box>



                <Text color={COLORES.secundario}>
                    Filas: {datos.length}
                    {' | '}
                    Columnas: {cabecera.length}
                </Text>



                <Box marginTop={1}>

                    <Box width={5}>
                        <Text
                            bold
                            color={COLORES.acento}
                        >
                            #
                        </Text>
                    </Box>

                    {cabecerasVisibles.map(
                        (columna, indice) => (

                            <Box
                                key={
                                    inicioColumna +
                                    indice
                                }
                                width={ANCHO_COLUMNA}
                            >

                                <Text
                                    bold
                                    color={COLORES.acento}
                                >
                                    {ajustarTexto(
                                        columna,
                                        ANCHO_COLUMNA
                                    )}
                                </Text>

                            </Box>

                        )
                    )}

                </Box>



                {filasVisibles.map(
                    (fila, indiceVisibleFila) => {

                        const indiceFila =
                            inicioFila +
                            indiceVisibleFila;

                        const celdasVisibles =
                            fila.slice(
                                inicioColumna,
                                inicioColumna +
                                COLUMNAS_VISIBLES
                            );

                        return (

                            <Box key={indiceFila}>



                                <Box width={5}>

                                    <Text
                                        color={
                                            COLORES.secundario
                                        }
                                    >
                                        {indiceFila + 1}
                                    </Text>

                                </Box>



                                {celdasVisibles.map(
                                    (
                                        celda,
                                        indiceVisibleColumna
                                    ) => {

                                        const indiceColumna =
                                            inicioColumna +
                                            indiceVisibleColumna;

                                        const seleccionada =
                                            indiceFila ===
                                            filaSeleccionada &&
                                            indiceColumna ===
                                            columnaSeleccionada;

                                        return (

                                            <Box
                                                key={
                                                    indiceColumna
                                                }
                                                width={
                                                    ANCHO_COLUMNA
                                                }
                                            >

                                                <Text
                                                    bold={
                                                        seleccionada
                                                    }

                                                    color={
                                                        seleccionada
                                                            ? COLORES.fondo
                                                            : COLORES.titulo
                                                    }

                                                    backgroundColor={
                                                        seleccionada
                                                            ? COLORES.acento
                                                            : undefined
                                                    }
                                                >

                                                    {ajustarTexto(
                                                        celda,
                                                        ANCHO_COLUMNA
                                                    )}

                                                </Text>

                                            </Box>

                                        );
                                    }
                                )}

                            </Box>

                        );
                    }
                )}



                <Box
                    marginTop={1}
                    flexDirection="column"
                >



                    {modo === 'editar' && (

                        <Box>

                            <Text color={COLORES.titulo}>
                                Nuevo valor:{' '}
                            </Text>

                            <TextInput
                                value={entrada}
                                onChange={setEntrada}

                                onSubmit={nuevoValor => {

                                    const copia =
                                        datos.map(
                                            fila => [...fila]
                                        );

                                    copia[
                                        filaSeleccionada
                                    ][
                                        columnaSeleccionada
                                    ] = nuevoValor;

                                    setDatos(copia);

                                    setModo('normal');

                                    setEntrada('');

                                    setMensaje(
                                        'Celda modificada.'
                                    );
                                }}
                            />

                        </Box>

                    )}



                    {modo === 'abrir' && (

                        <Box>

                            <Text color={COLORES.titulo}>
                                Archivo a abrir:{' '}
                            </Text>

                            <TextInput
                                value={entrada}
                                onChange={setEntrada}

                                onSubmit={async nombre => {

                                    const ok =
                                        await abrirArchivo(
                                            nombre
                                        );

                                    if (ok) {
                                        setModo(
                                            'normal'
                                        );

                                        setEntrada('');
                                    }
                                }}
                            />

                        </Box>

                    )}



                    {modo === 'guardar' && (

                        <Box>

                            <Text color={COLORES.titulo}>
                                Guardar como:{' '}
                            </Text>

                            <TextInput
                                value={entrada}
                                onChange={setEntrada}

                                onSubmit={async nombre => {

                                    const ok =
                                        await guardarArchivo(
                                            nombre
                                        );

                                    if (ok) {
                                        setModo(
                                            'normal'
                                        );

                                        setEntrada('');
                                    }
                                }}
                            />

                        </Box>

                    )}



                    {modo === 'normal' &&
                        datos.length > 0 && (

                            <Text
                                color={
                                    COLORES.secundario
                                }
                            >
                                Celda: fila{' '}
                                {filaSeleccionada + 1},
                                columna{' '}
                                {columnaSeleccionada + 1}

                                {' | '}

                                Valor:{' '}

                                <Text
                                    bold
                                    color={COLORES.acento}
                                >
                                    {valorSeleccionado}
                                </Text>

                            </Text>

                        )}



                    {mensaje && (

                        <Text color={COLORES.secundario}>
                            {mensaje}
                        </Text>

                    )}

                </Box>



                <Box
                    flexGrow={1}
                    alignItems="flex-end"
                >

                    <Text color={COLORES.secundario}>

                        <Text
                            bold
                            color={COLORES.acento}
                        >
                            Flechas
                        </Text>
                        {' '}mover

                        {' | '}

                        <Text
                            bold
                            color={COLORES.acento}
                        >
                            Enter
                        </Text>
                        {' '}editar

                        {' | '}

                        <Text
                            bold
                            color={COLORES.acento}
                        >
                            A
                        </Text>
                        {' '}abrir

                        {' | '}

                        <Text
                            bold
                            color={COLORES.acento}
                        >
                            G
                        </Text>
                        {' '}guardar

                        {' | '}

                        <Text
                            bold
                            color={COLORES.acento}
                        >
                            {'<'}
                        </Text>
                        {' '}asc

                        {' | '}

                        <Text
                            bold
                            color={COLORES.acento}
                        >
                            {'>'}
                        </Text>
                        {' '}desc

                        {' | '}

                        <Text
                            bold
                            color={COLORES.acento}
                        >
                            Esc
                        </Text>
                        {' '}salir

                    </Text>

                </Box>

            </Box>

        </Box>
    );
}

const app = render(<App />);

await app.waitUntilExit();

console.clear();