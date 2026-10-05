#!/usr/bin/env -S node --import tsx

import React, {useEffect, useState} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {basename} from 'node:path';
import {leerCsv} from './csv.js';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
    error:     '#e06c5f',
};

const DATOS_VACIOS = {cabecera: [], filas: []};
const CODIGO_ERROR_ARCHIVO_INEXISTENTE = 'ENOENT';

function describirError(error) {
    if (error.code === CODIGO_ERROR_ARCHIVO_INEXISTENTE) {
        return 'el archivo no existe';
    }
    return error.message;
}

function Encabezado({rutaArchivo, cantidadFilas, cantidadColumnas}) {
    return (
        <Box justifyContent="space-between">
            <Text bold color={COLORES.titulo}>{rutaArchivo ? basename(rutaArchivo) : 'Sin archivo'}</Text>
            <Text color={COLORES.secundario}>{cantidadFilas} filas · {cantidadColumnas} columnas</Text>
        </Box>
    );
}

function LineaDeMensaje({mensajeError}) {
    if (mensajeError) {
        return <Text color={COLORES.error}>Error › {mensajeError}</Text>;
    }
    return <Text> </Text>;
}

function Atajo({tecla, accion}) {
    return (
        <Text color={COLORES.secundario}><Text bold color={COLORES.acento}>{tecla}</Text> {accion}</Text>
    );
}

function App({rutaInicial}) {
    const {exit} = useApp();
    const [rutaArchivo, setRutaArchivo] = useState('');
    const [datos, setDatos] = useState(DATOS_VACIOS);
    const [mensajeError, setMensajeError] = useState('');

    async function abrirArchivo(ruta) {
        try {
            setDatos(await leerCsv(ruta));
            setRutaArchivo(ruta);
            setMensajeError('');
        } catch (error) {
            setMensajeError(`No se pudo abrir "${ruta}": ${describirError(error)}`);
        }
    }

    useEffect(() => {
        if (rutaInicial) {
            abrirArchivo(rutaInicial);
        }
    }, [rutaInicial]);

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    });

    return (
        <Box width={COLUMNAS} height={FILAS} flexDirection="column" paddingX={1} borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
            <Encabezado rutaArchivo={rutaArchivo} cantidadFilas={datos.filas.length} cantidadColumnas={datos.cabecera.length} />
            <Box marginTop={1}>
                <LineaDeMensaje mensajeError={mensajeError} />
            </Box>
            <Box flexGrow={1} />
            <Atajo tecla="Esc" accion="salir" />
        </Box>
    );
}

const app = render(<App rutaInicial={process.argv[2]} />);
await app.waitUntilExit();
console.clear();
