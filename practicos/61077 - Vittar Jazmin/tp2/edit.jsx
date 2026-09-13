#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile, writeFile } from 'node:fs/promises';
import { TextInput } from '@inkjs/ui';
import { basename } from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS = process.stdout.rows || 24;

const FILAS_POR_PAGINA = 8             // cantidad máx. de líneas visibles

const COLORES = {
    fondo: '#161310',
    borde: '#726b61',
    titulo: '#ede7db',
    secundario: '#ada79e',
    acento: '#edbb64',
};


/* leer y representar csv */
function parsearCSV(textoCSV) {

    if (!textoCSV || textoCSV.trim() === '') {                  // si el texto está vacío o solo tiene espacios, devolver listas vacías
        return { cabecera: [], filas: [] };
    }

    const lineas = textoCSV.trim().split(/\r?\n/).filter(linea => linea.trim().length > 0);        // quitar espacios exteriores, dividir el texto por líneas y eliminar líneas vacías
    // eliminar líneas vacías o que solo contienen espacios

    const cabecera = lineas[0].split(',').map(campo => campo.trim());           // primera linea contiene los nombres de las columnas

    const filas = lineas.slice(1).map(linea =>                              // líneas de datos desde la posición 1
        linea.split(',').map(campo => campo.trim())
    );

    return { cabecera, filas };
}

function generarCSV(cabecera, filas) {
    const lineaCabecera = cabecera.join(',');           // convertir encabezado a texto separado por comas
    const lineasFilas = filas.map(fila => fila.join(','));          // convertir filas a texto separado por comas

    return [lineaCabecera, ...lineasFilas].join('\n');          // unir encabezado y filas con salto de línea
}

function App() {
    const { exit } = useApp();

    /* estados y lectura del archivo */
    const [nombreArchivo, setNombreArchivo] = useState('');
    const [headers, setHeaders] = useState([]);
    const [rows, setRows] = useState([]);
    const [mensajeError, setMensajeError] = useState('');

    /* guardar fila y columna seleccionada */
    const [filaSelec, setFilaSelect] = useState(0);
    const [colSelec, setColSelect] = useState(0);

    const cargarArchivo = async (ruta) => {                 // abrir y procesar el archivo csv
        try {
            const contenidoTexto = await readFile(ruta, 'utf-8');
            const { cabecera, filas } = parsearCSV(contenidoTexto);

            setHeaders(cabecera);
            setRows(filas);
            setNombreArchivo(basename(ruta));               // basename("ruta/empleados.csv") -> "empleados.csv"
            setMensajeError('');

            setFilaSelect(0);
            setColSelect(0);
        } catch (error) {
            setMensajeError(`Error al abrir: ${error.message}`);
        }
    };

    useEffect(() => {                               // verificar si se indicó un archivo a ejecutar
        const archivoInicial = process.argv[2];
        if (archivoInicial) {
            cargarArchivo(archivoInicial);
        }
    }, []);

    /* navegar con flechas del teclado */
    useInput((input, key) => {
        if (key.escape) {
            exit();
        }

        if (rows.length === 0) return;

        if (key.upArrow) {
            setFilaSelect(prev => Math.max(0, prev - 1));
        }

        if (key.downArrow) {
            setFilaSelect(prev => Math.min(rows.length - 1, prev + 1));
        }

        if (key.leftArrow) {
            setColSelect(prev => Math.max(0, prev - 1));
        }

        if (key.rightArrow) {
            setColSelect(prev => Math.min(headers.length - 1, prev + 1));
        }
    });

    /* calcular filas visibles según fila seleccionada */
    const pagActual = Math.floor(filaSelec / FILAS_POR_PAGINA);
    const inicioFila = pagActual * FILAS_POR_PAGINA;
    const filasVisibles = rows.slice(inicioFila, inicioFila + FILAS_POR_PAGINA);

    return (
        <Box flexDirection='column' padding={1}>
            {/* información superior (nombre del archivo, filas, columnas) */}
            <Box justifyContent="space-between" marginBottom={1}>
                <Text bold color={COLORES.titulo}>
                    {nombreArchivo ? `Archivo: ${nombreArchivo}` : 'Sin archivo cargado'}
                </Text>
                <Text color={COLORES.secundario}>
                    Filas: {rows.length} | Columnas: {headers.length}
                </Text>
            </Box>

            {mensajeError ? <Text color="red">{mensajeError}</Text> : null}

            {/* tabla de datos */}
            <Box flexDirection='column'>
                {/* encabezado */}
                <Box marginBottom={1}>
                    <Box width={5}>
                        {/* número de fila */}
                        <Text bold color={COLORES.acento}>#</Text>
                    </Box>
                    {/* nombre columnas */}
                    {headers.map((h, idxCol) => (
                        <Box key={idxCol} width={18} overflow='hidden'>
                            <Text bold color={idxCol === colSelec ? COLORES.acento : COLORES.secundario}>
                                {h.toUpperCase().slice(0, 16).padEnd(18, '')}
                            </Text>
                        </Box>
                    ))}
                </Box>

                {/* filas visibles */}
                {filasVisibles.map((row, indexRelativo) => {
                    const idxFilaReal = inicioFila + indexRelativo;
                    const filaSeleccionada = idxFilaReal === filaSelec;

                    return (
                        <Box key={idxFilaReal}>
                            {/* número de fila */}
                            <Box width={5}>
                                <Text color={filaSeleccionada ? COLORES.acento : COLORES.secundario}>
                                    {String(idxFilaReal + 1).padEnd(4, '')}
                                </Text>
                            </Box>
                            {/* celdas de la fila */}
                            {row.map((cell, idxCol) => {
                                const celdaSeleccionada = filaSeleccionada && idxCol === colSelec;
                                const textoLimpio = String(cell).slice(0, 16).padEnd(18, '');

                                return (
                                    <Box key={idxCol} width={18} overflow='hidden'>
                                        <Text color={celdaSeleccionada ? '#000000' : COLORES.titulo} backgroundColor={celdaSeleccionada ? COLORES.acento : undefined}>
                                            {textoLimpio}
                                        </Text>
                                    </Box>
                                );
                            })}
                        </Box>
                    );
                })}
            </Box>

            {/* pie de página */}
            <Box marginTop={1} justifyContent='space-between'>
                <Text color={COLORES.secundario}>
                    <Text bold color={COLORES.acento}>Flechas</Text> mover | <Text bold color={COLORES.acento}>Esc</Text> salir
                </Text>
                <Text color={COLORES.secundario}>
                    Posición: [{filaSelec + 1}, {colSelec + 1}]
                </Text>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();