#!/usr/bin/env -S node --import tsx

import React from 'react';
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

const GAP = 3;         
// ───────────────────────── Utilidades ─────────────────────────

const clamp = (x, min, max) => Math.max(min, Math.min(max, x));

async function leerCSV(nombre) {
    const [cabecera, ...filas] = (await readFile(nombre, 'utf8'))
        .replace(/^﻿/, '')
        .split(/\r?\n/)
        .filter((linea) => linea.trim())
        .map((linea) => linea.split(','));
    if (!cabecera || filas.some((f) => f.length !== cabecera.length)) {
        throw new Error('el CSV no es válido');
    }
    return {cabecera, filas};
}

const guardarCSV = (nombre, {cabecera, filas}) =>
    writeFile(nombre, [cabecera, ...filas].map((f) => f.join(',')).join('\n') + '\n');

const razon = (e, nombre) => (e.code === 'ENOENT' ? `no existe "${nombre}"` : e.message);

function ajustar(texto, ancho, derecha) {
    const s = texto.length > ancho ? texto.slice(0, ancho - 1) + '…' : texto;
    return derecha ? s.padStart(ancho) : s.padEnd(ancho);
}

// ───────────────────────── Componentes ─────────────────────────

function Pie({atajos}) {
    return (
        <Text color={COLORES.secundario}>
            {atajos.map(([tecla, texto], i) => (
                <Text key={tecla}>
                    {i > 0 && ' · '}
                    <Text bold color={COLORES.acento}>{tecla}</Text> {texto}
                </Text>
            ))}
        </Text>
    );
}

function App({archivo0, datos0, error0}) {
    const {exit} = useApp();

    const [archivo, setArchivo] = React.useState(datos0 ? archivo0 : null);
    const [datos, setDatos] = React.useState(datos0 ?? {cabecera: [], filas: []});
    const [sel, setSel] = React.useState({fila: 0, col: 0});
    const [modo, setModo] = React.useState(datos0 ? 'ver' : 'abrir'); // ver | abrir | guardar | editar
    const [texto, setTexto] = React.useState(datos0 ? '' : archivo0 ?? '');
    const [mensaje, setMensaje] = React.useState(error0 ? {error: true, texto: error0} : null);

    const {cabecera, filas} = datos;

    const numericas = React.useMemo(
        () => cabecera.map((_, c) => filas.length > 0 && filas.every((f) => f[c] !== '' && !isNaN(f[c]))),
        [datos]
    );
    const mostrar = (v, c) => (numericas[c] ? Number(v).toLocaleString('es-AR') : v);
    const anchos = React.useMemo(
        () => cabecera.map((h, c) => Math.min(30, Math.max(h.length, ...filas.map((f) => mostrar(f[c], c).length)))),
        [datos]
    );

    const valor = filas[sel.fila]?.[sel.col] ?? '';

    // ───────────── Acciones ─────────────

    function ordenar(ascendente) {
        const c = sel.col;
        const cmp = (a, b) => (numericas[c] ? a[c] - b[c] : a[c].localeCompare(b[c], 'es'));
        setDatos({cabecera, filas: [...filas].sort((a, b) => (ascendente ? 1 : -1) * cmp(a, b))});
    }

    async function confirmar(v) {
        const nombre = v.trim();
        try {
            setMensaje(null);
            if (modo === 'editar') {
                if (/[,"]/.test(v)) throw new Error('el valor no puede tener comas ni comillas');
                setDatos({
                    cabecera,
                    filas: filas.map((f, i) => (i === sel.fila ? f.map((x, j) => (j === sel.col ? v : x)) : f)),
                });
            } else if (modo === 'abrir') {
                setDatos(await leerCSV(nombre));
                setArchivo(nombre);
                setSel({fila: 0, col: 0});
            } else {
                await guardarCSV(nombre, datos);
                setArchivo(nombre);
                setMensaje({texto: `✓ Guardado en ${nombre}`});
            }
            setModo('ver');
        } catch (e) {
            setMensaje({error: true, texto: `No se pudo ${modo}: ${razon(e, nombre)}`});
        }
    }

    // ───────────── Teclado ─────────────

    const pedir = (nuevoModo, valorInicial) => {
        setTexto(valorInicial);
        setModo(nuevoModo);
    };

    useInput((tecla, key) => {
        if (key.escape) {
            if (modo === 'ver' || !archivo) return exit();
            setModo('ver');
            return setMensaje(null);
        }
        if (modo !== 'ver') return; 

        setMensaje(null);
        const letra = tecla.toLowerCase();
        if (letra === 'a') return pedir('abrir', '');
        if (!archivo) return;
        if (letra === 'g') return pedir('guardar', archivo);
        if (key.return) return filas.length > 0 && pedir('editar', valor);
        if (tecla === '<' || tecla === '>') return ordenar(tecla === '<');

        const dCol = key.rightArrow - key.leftArrow;
        const dFila = key.downArrow - key.upArrow;
        setSel((s) => ({
            fila: clamp(s.fila + dFila, 0, filas.length - 1),
            col: clamp(s.col + dCol, 0, cabecera.length - 1),
        }));
    });

    // ───────────── Vista ─────────────

    const columnas = process.stdout.columns || 80;
    const visibles = Math.max(3, (process.stdout.rows || 24) - 11);
    const anchoNum = String(filas.length).length + 2;

    const inicio = Math.max(0, Math.min(sel.fila - Math.floor(visibles / 2), filas.length - visibles));
    const costo = (a, b) => anchos.slice(a, b + 1).reduce((suma, w) => suma + w + GAP, 0);
    const disponible = columnas - 4 - anchoNum;
    let desde = 0;
    while (desde < sel.col && costo(desde, sel.col) > disponible) desde++;
    const cols = [];
    for (let c = desde; c < cabecera.length && (c === desde || costo(desde, c) <= disponible); c++) cols.push(c);

    function renglon(fila, etiqueta, textoDe) {
        const cab = fila < 0;
        const filaSel = fila === sel.fila;
        const estiloNum = cab
            ? {bold: true, color: COLORES.secundario}
            : filaSel
                ? {bold: true, color: COLORES.acento, backgroundColor: COLORES.resalte}
                : {color: COLORES.titulo};
        return (
            <Text key={fila}>
                <Text {...estiloNum}>{etiqueta.padStart(anchoNum)}</Text>
                {cols.map((c) => {
                    const colSel = c === sel.col;
                    const estilo = cab
                        ? {bold: true, color: colSel ? COLORES.acento : COLORES.secundario, backgroundColor: colSel ? COLORES.resalte : undefined}
                        : filaSel && colSel
                            ? {bold: true, color: COLORES.celdaTexto, backgroundColor: COLORES.celdaFondo}
                            : {color: COLORES.titulo};
                    return (
                        <Text key={c}>
                            {' '.repeat(GAP)}
                            <Text {...estilo}>{ajustar(textoDe(c), anchos[c], numericas[c])}</Text>
                        </Text>
                    );
                })}
            </Text>
        );
    }

    const atajos =
        modo === 'ver'
            ? [['A', 'abrir'], ['G', 'guardar'], ['Enter', 'editar'], ['<', 'ascendente'], ['>', 'descendente'], ['Esc', 'salir']]
            : [['Enter', 'aceptar'], ['Esc', archivo ? 'cancelar' : 'salir']];

    return (
        <Box
            flexDirection="column"
            width={columnas}
            borderStyle="round"
            borderColor={COLORES.borde}
            backgroundColor={COLORES.fondo}
            paddingX={1}
        >
            <Box justifyContent="space-between">
                <Text bold color={COLORES.titulo}>{archivo ? basename(archivo) : 'Sin archivo'}</Text>
                {archivo && (
                    <Text color={COLORES.secundario}>{filas.length} filas · {cabecera.length} columnas</Text>
                )}
            </Box>
            <Text> </Text>

            {modo === 'ver' ? (
                <Text>
                    <Text color={COLORES.secundario}>Valor › </Text>
                    <Text color={COLORES.titulo}>{valor}</Text>
                </Text>
            ) : (
                <Box>
                    <Text bold color={COLORES.acento}>{{abrir: 'Abrir', guardar: 'Guardar', editar: 'Editar'}[modo]}</Text>
                    <Text color={COLORES.secundario}> › </Text>
                    <TextInput key={modo} defaultValue={texto} onSubmit={confirmar} />
                </Box>
            )}

            <Text color={mensaje?.error ? 'red' : 'green'}>{mensaje?.texto ?? ' '}</Text>

            {archivo ? (
                <>
                    {renglon(-1, '#', (c) => cabecera[c].toUpperCase())}
                    {filas.slice(inicio, inicio + visibles).map((f, i) =>
                        renglon(inicio + i, String(inicio + i + 1), (c) => mostrar(f[c], c))
                    )}
                </>
            ) : (
                <Text color={COLORES.secundario}>Ningún archivo abierto. Escribí el nombre de un CSV.</Text>
            )}
            <Text> </Text>

            <Box justifyContent="space-between">
                <Pie atajos={atajos} />
                {archivo && (
                    <Text color={COLORES.secundario}>Fila {sel.fila + 1} · Columna {sel.col + 1}</Text>
                )}
            </Box>
        </Box>
    );
}


const archivo0 = process.argv[2];
let datos0 = null;
let error0 = null;
if (archivo0) {
    try {
        datos0 = await leerCSV(archivo0);
    } catch (e) {
        error0 = `No se pudo abrir: ${razon(e, archivo0)}`;
    }
}

const app = render(<App archivo0={archivo0} datos0={datos0} error0={error0} />);
await app.waitUntilExit();
console.clear();
