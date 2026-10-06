#!/usr/bin/env -S node --import tsx

import React, {useEffect, useState} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {TextInput} from '@inkjs/ui';
import {readFile, writeFile} from 'node:fs/promises';
import {basename} from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS = process.stdout.rows || 24;

const COLORES = {
    fondo: '#161310',
    borde: '#726b61',
    titulo: '#ede7db',
    secundario: '#ada79e',
    acento: '#edbb64',
};

function parseCSV(texto) {
    const lineas = texto.replace(/^\uFEFF/, '').split(/\r?\n/);
    while (lineas.length > 0 && lineas[lineas.length - 1] === '') {
        lineas.pop();
    }

    if (lineas.length === 0) {
        return {headers: [], rows: []};
    }

    const headers = lineas[0].split(',');
    const columnasEsperadas = headers.length;

    const rows = lineas.slice(1).map((linea, indice) => {
        const valores = linea.split(',');
        if (valores.length !== columnasEsperadas) {
            throw new Error(`Fila ${indice + 2}: cantidad de columnas inesperada`);
        }
        return valores;
    });

    return {headers, rows};
}

function toCSV(headers, rows) {
    const cabecera = headers.join(',');
    const contenido = rows.map((fila) => fila.join(',')).join('\n');
    return cabecera + (contenido ? '\n' + contenido : '');
}

function formatearCelda(valor, ancho, derecha = false) {
    const texto = String(valor ?? '');
    if (derecha) {
        return texto.slice(0, ancho).padStart(ancho, ' ');
    }
    return texto.padEnd(ancho, ' ').slice(0, ancho);
}

function TablaCSV({headers, rows, primeraFila, filasVisibles, selectedRow, selectedCol}) {
    if (headers.length === 0) {
        return <Text color={COLORES.secundario}>No hay datos para mostrar.</Text>;
    }

    const numericas = headers.map((header, index) => rows.length > 0 && rows.every((fila) => fila[index].trim() !== '' && Number.isFinite(Number(fila[index]))));
    const columnasVisibles = Math.max(1, Math.floor((COLUMNAS - 12) / 12));
    const primeraCol = Math.max(0, selectedCol - columnasVisibles + 1);
    const indices = headers.map((header, index) => index).slice(primeraCol, primeraCol + columnasVisibles);
    const pesos = indices.map((index) => numericas[index] ? 1 : 1.6);
    const espacio = Math.max(indices.length, COLUMNAS - 12 - indices.length * 2);
    const totalPesos = pesos.reduce((total, peso) => total + peso, 0);
    const anchos = pesos.map((peso) => Math.max(1, Math.floor(espacio * peso / totalPesos)));

    return (
        <Box flexDirection="column" flexShrink={0} marginTop={1}>
            <Box>
                <Text bold color={COLORES.secundario}>{'   #  '}</Text>
                {indices.map((index, posicion) => (
                    <Box key={index} marginRight={2}>
                        <Text bold color={index === selectedCol ? COLORES.acento : COLORES.secundario} backgroundColor={index === selectedCol ? '#000000' : undefined}>
                            {formatearCelda(headers[index].toUpperCase(), anchos[posicion], numericas[index])}
                        </Text>
                    </Box>
                ))}
            </Box>

            {rows.slice(primeraFila, primeraFila + filasVisibles).map((fila, filaIndex) => (
                <Box key={primeraFila + filaIndex}>
                    <Text bold={primeraFila + filaIndex === selectedRow} color={primeraFila + filaIndex === selectedRow ? COLORES.acento : COLORES.titulo}>{String(primeraFila + filaIndex + 1).padStart(4, ' ') + '  '}</Text>
                    {indices.map((colIndex, posicion) => (
                        <Box key={colIndex} marginRight={2}>
                        <Text
                            bold={primeraFila + filaIndex === selectedRow && colIndex === selectedCol}
                            color={primeraFila + filaIndex === selectedRow && colIndex === selectedCol ? '#666666' : COLORES.titulo}
                            backgroundColor={primeraFila + filaIndex === selectedRow && colIndex === selectedCol ? '#e5e5e5' : undefined}
                        >
                            {formatearCelda(numericas[colIndex] ? Number(fila[colIndex]).toLocaleString('es-AR') : fila[colIndex], anchos[posicion], numericas[colIndex])}
                        </Text>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
}

function App() {
    const {exit} = useApp();
    const archivoInicial = process.argv[2] ?? '';
    const [archivo, setArchivo] = useState(archivoInicial);
    const [headers, setHeaders] = useState([]);
    const [rows, setRows] = useState([]);
    const [selectedRow, setSelectedRow] = useState(0);
    const [selectedCol, setSelectedCol] = useState(0);
    const [primeraFila, setPrimeraFila] = useState(0);
    const [mode, setMode] = useState(archivoInicial ? 'view' : 'open');
    const [draft, setDraft] = useState('');
    const [error, setError] = useState(null);
    const [ocupado, setOcupado] = useState(false);
    const filasVisibles = 10;
    const altoVista = Math.max(FILAS, filasVisibles + (COLUMNAS < 120 ? 10 : 9) + (error ? 1 : 0));

    useEffect(() => {
        setPrimeraFila((prev) => {
            const inicio = Math.min(prev, Math.max(0, rows.length - filasVisibles));
            if (selectedRow < inicio) {
                return selectedRow;
            }
            if (selectedRow >= inicio + filasVisibles) {
                return selectedRow - filasVisibles + 1;
            }
            return inicio;
        });
    }, [selectedRow, filasVisibles, rows.length]);

    const abrirArchivo = async (nombre) => {
        setOcupado(true);
        try {
            if (!nombre.trim()) {
                throw new Error('Ingresá el nombre del archivo');
            }
            const contenido = await readFile(nombre, 'utf8');
            const parsed = parseCSV(contenido);
            setArchivo(nombre);
            setHeaders(parsed.headers);
            setRows(parsed.rows);
            setSelectedRow(0);
            setSelectedCol(0);
            setPrimeraFila(0);
            setMode('view');
            setDraft('');
            setError(null);
        } catch (err) {
            setError(err.message || 'No se pudo abrir el archivo');
        } finally {
            setOcupado(false);
        }
    };

    useEffect(() => {
        if (archivoInicial) {
            abrirArchivo(archivoInicial);
        }
    }, []);

    const confirmarAccion = async (valor) => {
        if (ocupado) {
            return;
        }
        if (mode === 'open') {
            await abrirArchivo(valor);
            return;
        }
        if (mode === 'save') {
            setOcupado(true);
            try {
                if (!valor.trim()) {
                    throw new Error('Ingresá el nombre del archivo');
                }
                await writeFile(valor, toCSV(headers, rows), 'utf8');
                setArchivo(valor);
                setMode('view');
                setDraft('');
                setError(null);
            } catch (err) {
                setError(err.message || 'No se pudo guardar el archivo');
            } finally {
                setOcupado(false);
            }
            return;
        }
        if (mode === 'edit' && rows[selectedRow]) {
            if (/[,"\r\n]/.test(valor)) {
                setError('No se permiten comas, comillas ni saltos de línea');
                return;
            }
            const copia = rows.map((fila) => [...fila]);
            copia[selectedRow][selectedCol] = valor;
            setRows(copia);
            setMode('view');
            setDraft('');
            setError(null);
        }
    };

    useInput((input, key) => {
        if (ocupado) {
            return;
        }
        const isEscapeKey =
            key.escape ||
            key.name === 'escape' ||
            input === '\u001b' ||
            input === 'escape';

        if (isEscapeKey) {
            if (mode !== 'view') {
                setError(null);
                setMode('view');
                setDraft('');
                return;
            }
            exit();
            return;
        }

        if (key.ctrl && input === 'c') {
            exit();
            return;
        }

        if (mode === 'view') {
            if (input.toLowerCase() === 'a' || input.toLowerCase() === 'g') {
                setDraft(input.toLowerCase() === 'g' ? archivo : '');
                setError(null);
                setMode(input.toLowerCase() === 'a' ? 'open' : 'save');
                return;
            }
            if ((input === '<' || input === '>') && rows.length > 0) {
                const numerica = rows.every((fila) => fila[selectedCol].trim() !== '' && Number.isFinite(Number(fila[selectedCol])));
                const copia = [...rows].sort((a, b) => {
                    const comparacion = numerica
                        ? Number(a[selectedCol]) - Number(b[selectedCol])
                        : a[selectedCol].localeCompare(b[selectedCol], 'es', {sensitivity: 'base'});
                    return input === '<' ? comparacion : -comparacion;
                });
                setRows(copia);
                return;
            }
            if (key.leftArrow && headers.length > 0) {
                setSelectedCol((prev) => Math.max(0, prev - 1));
            }
            if (key.rightArrow && headers.length > 0) {
                setSelectedCol((prev) => Math.min(headers.length - 1, prev + 1));
            }
            if (key.upArrow && rows.length > 0) {
                setSelectedRow((prev) => Math.max(0, prev - 1));
            }
            if (key.downArrow && rows.length > 0) {
                setSelectedRow((prev) => Math.min(rows.length - 1, prev + 1));
            }
            if (key.return && rows.length > 0 && headers.length > 0) {
                setDraft(rows[selectedRow][selectedCol]);
                setMode('edit');
            }
            return;
        }

    });

    const valorActual = rows[selectedRow]?.[selectedCol] ?? '';

    return (
        <Box width={COLUMNAS} height={altoVista} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo} paddingLeft={1} paddingRight={1}>
            <Box justifyContent="space-between">
                <Text bold color={COLORES.titulo}>{archivo ? basename(archivo) : 'Sin archivo'}</Text>
                <Text color={COLORES.secundario}>{rows.length} filas · {headers.length} columnas</Text>
            </Box>

            <Box marginTop={1}>
                <Text bold={mode !== 'view'} color={mode === 'view' ? COLORES.secundario : COLORES.acento}>{mode === 'open' ? 'Abrir › ' : mode === 'save' ? 'Guardar › ' : 'Valor › '}</Text>
                {mode !== 'view' ? (
                    <Box>
                        <TextInput
                            key={mode}
                            defaultValue={draft}
                            isDisabled={ocupado}
                            onChange={setDraft}
                            onSubmit={confirmarAccion}
                        />
                    </Box>
                ) : (
                    <Text color={COLORES.titulo} wrap="truncate-end">{valorActual}</Text>
                )}
            </Box>

            {error ? (
                <Text color="red" wrap="truncate-end">Error: {error}</Text>
            ) : null}

            <TablaCSV
                headers={headers}
                rows={rows}
                primeraFila={primeraFila}
                filasVisibles={filasVisibles}
                selectedRow={selectedRow}
                selectedCol={selectedCol}
            />

            <Box flexGrow={1} />
            <Box flexDirection={COLUMNAS < 120 ? 'column' : 'row'} justifyContent="space-between" flexShrink={0}>
                {mode === 'view' ? (
                <Text color={COLORES.secundario}>
                    <Text bold color={COLORES.acento}>A</Text> abrir · <Text bold color={COLORES.acento}>G</Text> guardar · <Text bold color={COLORES.acento}>Enter</Text> editar · <Text bold color={COLORES.acento}>&lt;</Text>{COLUMNAS < 120 ? ' asc. · ' : ' ascendente · '}<Text bold color={COLORES.acento}>&gt;</Text>{COLUMNAS < 120 ? ' desc. · ' : ' descendente · '}<Text bold color={COLORES.acento}>Esc</Text> salir
                </Text>
                ) : (
                    <Text color={COLORES.secundario}><Text bold color={COLORES.acento}>Enter</Text> {mode === 'save' ? 'guardar' : mode === 'open' ? 'abrir' : 'confirmar'} · <Text bold color={COLORES.acento}>Esc</Text> cancelar</Text>
                )}
                <Text color={COLORES.secundario}>Fila {rows.length ? selectedRow + 1 : 0} · Columna {headers.length ? selectedCol + 1 : 0}</Text>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();