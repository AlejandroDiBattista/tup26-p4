#!/usr/bin/env -S node --import tsx

import React, {useState, useMemo} from 'react';
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
    error:     '#e5736b',
    seleccion: '#e5e5e5',
    resaltado: '#000000',
};

const ANCHO_MAX = 30;          // ancho máximo de una columna
const GAP = 2;                 // espacios entre columnas
// Líneas que ocupa todo lo que no son filas de datos:
// borde(2) + título(1) + prompt(2) + cabecera(2) + pie(1)
const ALTURA = Math.max(1, FILAS - 8);

// ---------- CSV ----------

function parsear(texto) {
    const lineas = texto.split(/\r?\n/);
    if (lineas[lineas.length - 1] === '') lineas.pop();   // salto de línea final
    if (lineas.length === 0) throw new Error('El archivo está vacío');

    const filas = lineas.map(l => l.split(','));
    const n = filas[0].length;
    filas.forEach((f, i) => {
        if (f.length !== n) {
            throw new Error(`La línea ${i + 1} tiene ${f.length} campos y se esperaban ${n}`);
        }
    });
    return {cabecera: filas[0], filas: filas.slice(1)};
}

function serializar({cabecera, filas}) {
    return [cabecera, ...filas].map(f => f.join(',')).join('\n') + '\n';
}

async function cargar(ruta) {
    const texto = await readFile(ruta, 'utf8');
    return {ruta, ...parsear(texto)};
}

// ---------- Formato de celdas ----------

const esNumero = v => /^-?\d+(\.\d+)?$/.test(v);

// Separador de miles con punto en enteros (81500 -> 81.500)
function formatear(v, numerica) {
    if (numerica && /^-?[1-9]\d*$/.test(v)) {
        return v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return v;
}

function ajustar(texto, ancho, derecha) {
    const t = texto.length > ancho ? texto.slice(0, ancho - 1) + '…' : texto;
    return derecha ? t.padStart(ancho) : t.padEnd(ancho);
}

// ---------- Componentes ----------

function Atajos({items}) {
    return (
        <Text color={COLORES.secundario}>
            {items.map(([tecla, desc], i) => (
                <Text key={tecla}>
                    {i > 0 ? ' · ' : ''}
                    <Text bold color={COLORES.acento}>{tecla}</Text> {desc}
                </Text>
            ))}
        </Text>
    );
}

function App({inicial, errorInicial}) {
    const {exit} = useApp();

    const [datos, setDatos]     = useState(inicial);
    const [fila, setFila]       = useState(0);
    const [col, setCol]         = useState(0);
    const [scroll, setScroll]   = useState(0);       // primera fila visible
    const [modo, setModo]       = useState(inicial ? 'ver' : 'abrir');  // ver | abrir | guardar | editar
    const [mensaje, setMensaje] = useState(errorInicial);

    const cabecera = datos?.cabecera ?? [];
    const filas    = datos?.filas ?? [];

    const numericas = useMemo(
        () => cabecera.map((_, c) => filas.length > 0 && filas.every(f => esNumero(f[c]))),
        [datos]
    );

    const anchos = useMemo(
        () => cabecera.map((h, c) => Math.min(
            ANCHO_MAX,
            Math.max(h.length, ...filas.map(f => formatear(f[c], numericas[c]).length))
        )),
        [datos, numericas]
    );

    // ----- acciones -----

    const irA = (nuevaFila, nuevaCol) => {
        const f = Math.max(0, Math.min(filas.length - 1, nuevaFila));
        const c = Math.max(0, Math.min(cabecera.length - 1, nuevaCol));
        setFila(f);
        setCol(c);
        setScroll(s => f < s ? f : f > s + ALTURA - 1 ? f - ALTURA + 1 : s);
    };

    const ordenar = (dir) => {
        const num = numericas[col];
        const nuevas = [...filas].sort((a, b) => {
            const cmp = num
                ? Number(a[col]) - Number(b[col])
                : a[col].localeCompare(b[col], 'es', {sensitivity: 'base'});
            return dir * cmp;
        });
        setDatos({...datos, filas: nuevas});
    };

    const abrir = async (ruta) => {
        ruta = ruta.trim();
        if (!ruta) {
            setMensaje('Ingresá el nombre del archivo');
            return;
        }
        try {
            const nuevo = await cargar(ruta);
            setDatos(nuevo);
            setFila(0); setCol(0); setScroll(0);
            setMensaje(null);
            setModo('ver');
        } catch (e) {
            setMensaje(`No se pudo abrir: ${e.code === 'ENOENT' ? 'el archivo no existe' : e.message}`);
        }
    };

    const guardar = async (ruta) => {
        ruta = ruta.trim();
        if (!ruta) {
            setMensaje('Ingresá el nombre del archivo');
            return;
        }
        try {
            await writeFile(ruta, serializar(datos), 'utf8');
            setDatos({...datos, ruta});
            setMensaje(`Guardado en ${ruta}`);
            setModo('ver');
        } catch (e) {
            setMensaje(`No se pudo guardar: ${e.message}`);
        }
    };

    const editar = (valor) => {
        const nuevas = filas.map((f, i) => i === fila ? f.map((v, c) => c === col ? valor : v) : f);
        setDatos({...datos, filas: nuevas});
        setModo('ver');
    };

    // ----- teclado -----

    useInput((tecla, key) => {
        if (key.escape) {
            if (modo === 'ver' || !datos) exit();
            else { setMensaje(null); setModo('ver'); }
            return;
        }
        if (modo !== 'ver') return;   // en los demás modos escribe el TextInput

        setMensaje(null);
        if (key.upArrow)         irA(fila - 1, col);
        else if (key.downArrow)  irA(fila + 1, col);
        else if (key.leftArrow)  irA(fila, col - 1);
        else if (key.rightArrow) irA(fila, col + 1);
        else if (key.pageUp)     irA(fila - ALTURA, col);
        else if (key.pageDown)   irA(fila + ALTURA, col);
        else if (tecla === 'a' || tecla === 'A') setModo('abrir');
        else if ((tecla === 'g' || tecla === 'G') && datos) setModo('guardar');
        else if (key.return && filas.length > 0) setModo('editar');
        else if (tecla === '<' && filas.length > 0) ordenar(1);
        else if (tecla === '>' && filas.length > 0) ordenar(-1);
    });

    // ----- columnas visibles (desplazamiento horizontal) -----

    const numW  = Math.max(String(filas.length).length, 1) + 2;
    const disp  = COLUMNAS - 4 - numW;     // borde(2) + padding(2)
    const ancho = c => anchos[c] + GAP;

    let ini = 0;
    while (ini < col) {
        let suma = 0;
        for (let c = ini; c <= col; c++) suma += ancho(c);
        if (suma <= disp) break;
        ini++;
    }
    const visibles = [];
    let usado = 0;
    for (let c = ini; c < cabecera.length; c++) {
        if (visibles.length > 0 && usado + ancho(c) > disp) break;
        visibles.push(c);
        usado += ancho(c);
    }

    // ----- render -----

    const valor = filas[fila]?.[col] ?? '';
    const pedirNombre = modo === 'abrir' || modo === 'guardar';

    const etiquetas = {abrir: 'Abrir', guardar: 'Guardar', editar: 'Editar'};
    const accion = {abrir: 'abrir', guardar: 'guardar', editar: 'aceptar'};

    const filasVisibles = filas.slice(scroll, scroll + ALTURA);

    return (
        <Box width={COLUMNAS} height={FILAS} borderStyle="round" borderColor={COLORES.borde}
             backgroundColor={COLORES.fondo} paddingX={1} flexDirection="column">

            {/* Título */}
            <Box justifyContent="space-between">
                <Text bold color={COLORES.titulo}>{datos ? basename(datos.ruta) : '(sin archivo)'}</Text>
                {datos && (
                    <Text color={COLORES.secundario}>
                        {filas.length} filas · {cabecera.length} columnas
                    </Text>
                )}
            </Box>

            {/* Línea de valor / entrada de texto */}
            <Box marginTop={1}>
                {modo === 'ver' ? (
                    <Text color={COLORES.secundario}>
                        {datos ? 'Valor › ' : ''}<Text color={COLORES.titulo}>{valor}</Text>
                    </Text>
                ) : (
                    <>
                        <Text bold color={COLORES.acento}>{etiquetas[modo]} › </Text>
                        <TextInput
                            key={modo}
                            defaultValue={modo === 'guardar' ? datos.ruta : modo === 'editar' ? valor : ''}
                            onSubmit={modo === 'abrir' ? abrir : modo === 'guardar' ? guardar : editar}
                        />
                    </>
                )}
            </Box>

            {/* Tabla */}
            <Box marginTop={1} flexDirection="column" height={ALTURA + 1}>
                {datos && (
                    <Text>
                        <Text color={COLORES.secundario} bold>{'#'.padStart(numW)}</Text>
                        {visibles.map(c => (
                            <Text key={c} bold
                                  color={c === col ? COLORES.acento : COLORES.secundario}
                                  backgroundColor={c === col ? COLORES.resaltado : undefined}>
                                {' '.repeat(GAP)}{ajustar(cabecera[c].toUpperCase(), anchos[c], numericas[c])}
                            </Text>
                        ))}
                    </Text>
                )}
                {filasVisibles.map((f, k) => {
                    const i = scroll + k;
                    const activa = i === fila;
                    return (
                        <Text key={i}>
                            <Text bold={activa}
                                  color={activa ? COLORES.acento : COLORES.titulo}
                                  backgroundColor={activa ? COLORES.resaltado : undefined}>
                                {String(i + 1).padStart(numW)}
                            </Text>
                            {visibles.map(c => {
                                const sel = activa && c === col;
                                return (
                                    <Text key={c}
                                          color={sel ? COLORES.fondo : COLORES.titulo}
                                          backgroundColor={sel ? COLORES.seleccion : undefined}>
                                        {' '.repeat(GAP)}{ajustar(formatear(f[c], numericas[c]), anchos[c], numericas[c])}
                                    </Text>
                                );
                            })}
                        </Text>
                    );
                })}
            </Box>

            {/* Pie */}
            <Box justifyContent="space-between">
                {modo === 'ver' ? (
                    <Atajos items={[
                        ['A', 'abrir'], ['G', 'guardar'], ['Enter', 'editar'],
                        ['<', 'ascendente'], ['>', 'descendente'], ['Esc', 'salir'],
                    ]} />
                ) : (
                    <Atajos items={[['Enter', accion[modo]], ['Esc', 'cancelar']]} />
                )}
                {mensaje ? (
                    <Text color={mensaje.startsWith('No se pudo') || mensaje.startsWith('Ingres') || mensaje.startsWith('El archivo')
                        ? COLORES.error : COLORES.acento}>{mensaje}</Text>
                ) : datos && filas.length > 0 ? (
                    <Text color={COLORES.secundario}>Fila {fila + 1} · Columna {col + 1}</Text>
                ) : null}
            </Box>
        </Box>
    );
}

// ---------- Inicio ----------

const argumento = process.argv[2];
let inicial = null;
let errorInicial = null;

if (argumento) {
    try {
        inicial = await cargar(argumento);
    } catch (e) {
        errorInicial = `No se pudo abrir: ${e.code === 'ENOENT' ? 'el archivo no existe' : e.message}`;
    }
}

const app = render(<App inicial={inicial} errorInicial={errorInicial} />);
await app.waitUntilExit();
console.clear();
