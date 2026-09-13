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
    const [mensaje, setMensaje] = useState('');
    const [rutaArchivo, setRutaArchivo] = useState('');

    /* modo actual: tabla, abrir, guardar */
    const [modo, setModo] = useState('tabla');

    /* guardar fila y columna seleccionada */
    const [filaSelec, setFilaSelect] = useState(0);
    const [colSelec, setColSelect] = useState(0);

    /* modo edición de celda */
    const [editando, setEditando] = useState(false);
    const [valorEdicion, setValorEdicion] = useState('');

    const cargarArchivo = async (ruta) => {                 // abrir y procesar el archivo csv
        try {
            const contenidoTexto = await readFile(ruta, 'utf-8');
            const { cabecera, filas } = parsearCSV(contenidoTexto);

            setHeaders(cabecera);
            setRows(filas);
            setNombreArchivo(basename(ruta));               // basename("ruta/empleados.csv") -> "empleados.csv"
            setMensaje('');
            setRutaArchivo(ruta);

            setFilaSelect(0);
            setColSelect(0);
            setModo('tabla');
        } catch (error) {
            setMensaje(`Error al abrir: ${error.message}`);
        }
    };

    useEffect(() => {                               // verificar si se indicó un archivo a ejecutar
        const archivoInicial = process.argv[2];
        if (archivoInicial) {
            cargarArchivo(archivoInicial);
        } else {
            setModo('abrir');
        }
    }, []);

    /* guardar cambios */
    const guardarArchivo = async (destino) => {
        if (!destino) {
            setMensaje("Error: No hay nombre de archivo para guardar");
            return;
        }

        try {
            const contenidoCSV = generarCSV(headers, rows);
            await writeFile(destino, contenidoCSV, 'utf-8');

            setRutaArchivo(destino);
            setNombreArchivo(basename(destino));
            setMensaje("Guardado con éxito");
            setModo('tabla');
        } catch (error) {
            setMensaje(`Error al guardar: ${error.message}`)
            setModo('tabla');
        }
    };

    /* navegar con flechas del teclado */
    useInput((input, key) => {
        if (key.escape) {       // salir si no se está editando
            if (modo !== 'tabla') {
                setModo('tabla');
            } else if (editando) {
                setEditando(false);
            } else {
                exit();
            }
            return;
        }

        if (modo !== 'tabla' || editando) return;       // si se pide nombre de archivo (abrir/guardar) o se está editando una celda, omitir navegación

        if (rows.length === 0 && input !== 'a' && input !== 'A') return;

        // flechas teclado
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

        // activar edición
        if (key.return && rows.length > 0) {
            setValorEdicion(rows[filaSelec][colSelec] || '');
            setEditando(true);
        }

        // abrir archivo
        if (input === 'a' || input === 'A') {
            setModo('abrir');
            return;
        }

        // guardar archivo
        if (input === 'g' || input === 'G') {
            setModo('guardar');
            return;
        }
    });

    /* confirmar edición al presionar enter */
    const guardarEdicion = (nuevoValor) => {
        const nuevasFilas = [...rows];
        nuevasFilas[filaSelec][colSelec] = nuevoValor;
        setRows(nuevasFilas);
        setEditando(false);
        setMensaje('Celda modificada');
    };

    /* pantalla interactiva para abrir y guardar */
    if (modo === 'abrir') {
        return (
            <Box flexDirection="column" padding={1}>
                <Text bold color={COLORES.titulo}>Abrir archivo CSV</Text>
                <Box marginTop={1}>
                    <Text color={COLORES.acento}>Ingrese la ruta del archivo: </Text>
                    <TextInput defaultValue="" onSubmit={(valor) => cargarArchivo(valor.trim())} />
                </Box>
                {mensaje ? <Text color="red">{mensaje}</Text> : null}
                <Text color={COLORES.secundario} marginTop={1}>Presione [Esc] para cancelar</Text>
            </Box>
        );
    }

    if (modo === 'guardar') {
        return (
            <Box flexDirection="column" padding={1}>
                <Text bold color={COLORES.titulo}>Guardar archivo CSV</Text>
                <Box marginTop={1}>
                    <Text color={COLORES.acento}>Guardar como: </Text>
                    <TextInput defaultValue={nombreArchivo || 'datos.csv'} onSubmit={(valor) => guardarArchivo(valor.trim())} />
                </Box>
                {mensaje ? <Text color="red">{mensaje}</Text> : null}
                <Text color={COLORES.secundario} marginTop={1}>Presione [Esc] para cancelar</Text>
            </Box>
        );
    }

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

            {/* mensaje de estado */}
            {mensaje ? <Text color={COLORES.acento}>{mensaje}</Text> : null}

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

                                return (
                                    <Box key={idxCol} width={18} overflow='hidden'>
                                        {celdaSeleccionada && editando ? (
                                            <TextInput defaultValue={valorEdicion} onSubmit={guardarEdicion} />
                                        ) : (
                                            <Text color={celdaSeleccionada ? '#000000' : COLORES.titulo} backgroundColor={celdaSeleccionada ? COLORES.acento : undefined}>
                                                {String(cell).slice(0, 16).padEnd(18, '')}
                                            </Text>
                                        )}
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
                    <Text bold color={COLORES.acento}>A</Text> abrir •{' '}
                    <Text bold color={COLORES.acento}>G</Text> guardar •{' '}
                    <Text bold color={COLORES.acento}>Enter</Text> editar •{' '}
                    <Text bold color={COLORES.acento}>Esc</Text> salir
                </Text>
                <Text color={COLORES.secundario}>
                    Valor: {rows[filaSelec]?.[colSelec] ?? ''} | Posición: [{filaSelec + 1}, {colSelec + 1}]
                </Text>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();