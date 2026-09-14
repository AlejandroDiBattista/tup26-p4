#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile, writeFile } from 'node:fs/promises';
import { TextInput } from '@inkjs/ui';
import { basename } from 'node:path';


const COLUMNAS = process.stdout.columns || 80;
const FILAS = process.stdout.rows || 24;

const COLORES = {
    fondo: '#161310',
    borde: '#726b61',
    titulo: '#ede7db',
    secundario: '#ada79e',
    acento: '#edbb64',
};
//parsearCSV convierte el CSV a datos con una estructura
function parsearCSV(texto) {
    const lineas = texto
        .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
        .split('\n')
        .filter((linea, i, arr) => !(i === arr.length - 1 && linea === ''));

    if (lineas.length === 0) return { cabecera: [], filas: [] };
    const cabecera = lineas[0].split(',').map(celda => celda.trim());

    const filas = lineas.slice(1).map(linea => {
        const celdas = linea.split(',').map(celda => celda.trim());

        const normalizacion = cabecera.map((x, i) => celdas[i] ?? '');
        return normalizacion;
    });

    return { cabecera, filas };
}
// une los arrays de cabecera y filas en un string CSV
function serializarCSV(cabecera, filas) {
    const lineas = [
        cabecera.join(','),
        ...filas.map(fila => fila.join(',')),
    ];
    return lineas.join('\n')
}
//funcion de callback para sort
function compararCeldas(a, b) {
    const ta = a.trim();
    const tb = b.trim();
    const na = Number(ta);
    const nb = Number(tb);
    const ambosNum = ta !== '' && tb !== '' && !Number.isNaN(na) && !Number.isNaN(nb);
    if (ambosNum) return na - nb;
    return String(a).localeCompare(String(b), 'es', { sensitivity: 'base' });
}

function App({ archivoInicial }) {

    const { exit } = useApp();
    const [archivo, setArchivo] = useState(null);
    const [cabecera, setCabecera] = useState([]);
    const [filas, setFilas] = useState([]);
    const [filaSel, setFilaSel] = useState(0);
    const [colSel, setColSel] = useState(0);
    const [scrollFila, setScrollFila] = useState(0);
    const [modo, setModo] = useState(archivoInicial ? null : 'abrir');
    const [error, setError] = useState(null);
    const [listo, setListo] = useState(!archivoInicial);
    const filasVisibles = Math.max(3, FILAS - 8);
    const tieneDatos = cabecera.length > 0;



    async function abrirArchivo(path) {
        try {
            const texto = await readFile(path, 'utf-8');
            const datos = parsearCSV(texto);
            setArchivo(path);
            setCabecera(datos.cabecera);
            setFilas(datos.filas);
            setFilaSel(0);
            setColSel(0);
            setScrollFila(0);
            setError(null);
            setModo(null)

        } catch (err) {
            setError(`No se pudo abrir ${err.message}`);
            setModo('error');
        }
    }

    async function guardarArchivo(path) {
        try {
            await writeFile(path, serializarCSV(cabecera, filas), 'utf-8');
            setArchivo(path);
            setError(null);
            setModo(null);
        } catch (err) {
            setError(`no se pudo guardar: ${err.message}`);
            setModo('error');
        }

    }

    useEffect(() => {
        if (!archivoInicial) return;
        abrirArchivo(archivoInicial).finally(() => setListo(true));
    }, [archivoInicial]);

    //funcion para calcular la posicion del scroll
    function asegurarScroll(nuevaFila) {
        setScrollFila(actual => {
            if (nuevaFila < actual) return nuevaFila;
            if (nuevaFila >= actual + filasVisibles) return nuevaFila - filasVisibles + 1;
            return actual;
        })
    }

    function ordenar(direccion) {
        if (!tieneDatos || filas.length === 0) return;
        const factor = direccion === 'asc' ? 1 : -1;
        const ordenadas = [...filas].sort((a, b) =>
            factor * compararCeldas(a[colSel] ?? '', b[colSel] ?? ''));
        setFilas(ordenadas);
    }

    useInput((input, key) => {
        if (modo != null) {
            if (key.escape) {
                setModo(null);
            }
        }
        if (key.escape) { exit(); return; }
        if (key.upArrow) {
            const nueva = Math.max(0, filaSel - 1);
            setFilaSel(nueva)
            asegurarScroll(nueva)
        }
        if (key.downArrow) {
            const nueva = Math.min(Math.max(0, filas.length - 1), filaSel + 1);
            setFilaSel(nueva)
            asegurarScroll(nueva)
            return;
        }
        if (key.leftArrow) { setColSel(col => Math.max(0, col - 1)); }
        if (key.rightArrow) { setColSel(col => Math.min(Math.max(0, cabecera.length - 1), col + 1)); return; }
        if (key.return && tieneDatos) { setModo('editar'); return; }
        if (input === 'a' || input === 'A') { setModo('abrir'); return; }
        if ((input === 'g' || input === 'G') && tieneDatos) { setModo('guardar'); return; }
        if (input === '<' && tieneDatos) ordenar('asc')
        if (input == '>' && tieneDatos) ordenar('desc');

    }, { isActive: listo });

    if (!listo) {
        return (
            <Box width={COLUMNAS} height={FILAS} justifyContent='center' alignItems='center'>
                <Text color={COLORES.secundario}>...Cargando</Text>
            </Box>
        )
    }

    const valorCelda = tieneDatos && filas[filaSel] ? (filas[filaSel][colSel] ?? '') : '';
    const filasMostradas = filas.slice(scrollFila, scrollFila + filasVisibles);

    function renderBarraSuperior() {
        if (modo === 'abrir') {
            return (
                <Box>
                    <Text bold color={COLORES.acento}>Abrir</Text>
                    <Text color={COLORES.secundario}>›</Text>
                    <TextInput defaultValue='' placeholder='archivo.csv' onSubmit={ruta => {
                        if (ruta.trim()) abrirArchivo(ruta.trim());
                    }} />
                </Box>
            )
        }
        if (modo === 'guardar') {
            return (
                <Box>
                    <Text bold color={COLORES.acento}>Guardar </Text>
                    <Text color={COLORES.secundario}>›</Text>
                    <TextInput defaultValue={archivo ? basename(archivo) : ''} onSubmit={ruta => {
                        if (ruta.trim()) guardarArchivo(ruta.trim())
                    }} />
                </Box>
            )
        }
        if (modo === 'editar') {
            return (
                <Box>
                    <Text bold color={COLORES.acento}>Editar</Text>
                    <Text color={COLORES.secundario}>›</Text>
                    <TextInput key={`${filaSel}-${colSel} - ${valorCelda}`} defaultValue={valorCelda}
                        onSubmit={nuevo => {
                            setFilas(prev => {
                                const copia = prev.map(fila => [...fila]);
                                if (copia[filaSel]) copia[filaSel][colSel] = nuevo;
                                return copia;
                            })
                            setModo(null);
                        }} />
                </Box>
            )
        }
        if (modo === 'error') return <Text color="#e07070">{error}</Text>;
        return (
            <Text color={COLORES.secundario}>
                Valor <Text>› </Text><Text color={COLORES.titulo}>{valorCelda}</Text>
            </Text>
        );
    }
    return (
        <Box flexDirection='column' width={COLUMNAS} height={FILAS} paddingX={1} backgroundColor={COLORES.fondo}>
            <Box justifyContent='space-between'>
                <Text bold>{archivo ? basename(archivo) : '(sin archivo)'}</Text>
                <Text>{filas.length} filas - {cabecera.length} columnas</Text>
            </Box>
            <Box marginBottom={1}>{renderBarraSuperior()}</Box>
            {tieneDatos ? (
                <Box flexDirection="column" flexGrow={1}>
                    <Box>
                        <Box width={4}><Text bold color={COLORES.acento}>#</Text></Box>
                        {cabecera.map((nombre, i) => (
                            <Box key={`h-${i}`} width={Math.max(12, nombre.length + 2)} marginRight={1}>
                                <Text bold color={COLORES.acento}>{nombre.toUpperCase()}</Text>
                            </Box>
                        ))}
                    </Box>
                    {filasMostradas.map((fila, offset) => {
                        const indice = scrollFila + offset;
                        const esFilaSel = indice === filaSel;
                        return (
                            <Box key={`r-${indice}`}>
                                <Box width={4}>
                                    <Text color={esFilaSel ? COLORES.acento : COLORES.secundario}>{indice + 1}</Text>
                                </Box>
                                {cabecera.map((_, i) => {
                                    const celda = fila[i] ?? '';
                                    const seleccionada = esFilaSel && i === colSel;
                                    return (
                                        <Box key={`c-${indice}-${i}`}
                                            width={Math.max(12, (cabecera[i] || '').length + 2)} marginRight={1}>
                                            {seleccionada
                                                ? <Text bold color={COLORES.seleccionFg} backgroundColor={COLORES.seleccionBg}>{celda || ' '}</Text>
                                                : <Text color={COLORES.titulo}>{celda}</Text>}
                                        </Box>
                                    );
                                })}
                            </Box>
                        );
                    })}
                </Box>
            ) : (
                <Box flexGrow={1} justifyContent="center" alignItems="center">
                    <Text color={COLORES.secundario}>Abrí un CSV con A o pasalo como argumento</Text>
                </Box>
            )}
            <Box justifyContent='space-between'>
                <Text>Atajos : [A]brir  [G]uardar  [Enter]Editar</Text>
                <Text>Fila {filaSel + 1} - Columna {colSel + 1}</Text>
            </Box>

        </Box>

    );
}
const archivoInicial = process.argv[2] ?? null;
const app = render(<App archivoInicial={archivoInicial} />);
await app.waitUntilExit();
console.clear();