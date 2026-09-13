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

function parsearCSV(texto) {
    const lineas = texto.replace(/\r\n/g, '\n').split('\n').filter(l => l.length > 0);
    if (lineas.length === 0) return {encabezados: [], filas: []};
    const encabezados = lineas[0].split(',');
    const filas = lineas.slice(1).map(l => l.split(','));
    return {encabezados, filas};
}
function serializarCSV(encabezados, filas) {
    const lineas = [encabezados.join(','), ...filas.map(f => f.join(','))];
    return lineas.join('\n') + '\n';
}
function anchoColumnas(encabezados, filas) {
    return encabezados.map((enc, i) => {
        let max = enc.length;
        for (const fila of filas) {
            const val = fila[i] ?? '';
            if (val.length > max) max = val.length;
        }
        return Math.min(Math.max(max, 6), 18);
    });
}
function ajustar(texto, ancho) {
    const t = String(texto ?? '');
    if (t.length > ancho) return t.slice(0, ancho - 1) + '…';
    return t.padEnd(ancho, ' ');
}
//primer commit

function App() {
    const [modo, setModo] = useState('inicio');
const [archivo, setArchivo] = useState('');
const [encabezados, setEncabezados] = useState([]);
const [filas, setFilas] = useState([]);
const [mensaje, setMensaje] = useState('');

async function abrirArchivo(ruta) {
    try {
        const texto = await readFile(ruta, 'utf-8');
        const datos = parsearCSV(texto);
        setEncabezados(datos.encabezados);
        setFilas(datos.filas);
        setArchivo(ruta);
        setMensaje('');
        setModo('tabla');
    } catch (e) {
        setMensaje('No se pudo abrir: ' + e.message);
        setModo('inicio');
    }
}
//se declaran constantes 
    const {exit} = useApp();
    const [filaSel, setFilaSel] = useState(0);
    const [colSel, setColSel] = useState(0);
    const [scrollFila, setScrollFila] = useState(0);
    const [scrollCol, setScrollCol] = useState(0);
    const [valorEdicion, setValorEdicion] = useState('');
    const [ordenColumna, setOrdenColumna] = useState(null);
    const [ordenAsc, setOrdenAsc] = useState(true);
    const [modificado, setModificado] = useState(false);
    const filasVisibles = Math.max(FILAS - 8, 3);
    const anchos = encabezados.length ? anchoColumnas(encabezados, filas) : [];
    async function abrirArchivo(ruta) {
        try {
            const texto = await readFile(ruta, 'utf-8');
            const datos = parsearCSV(texto);
            setEncabezados(datos.encabezados);
            setFilas(datos.filas);
            setArchivo(ruta);
            setMensaje('');
            setModificado(false);
            setFilaSel(0);
            setColSel(0);
            setScrollFila(0);
            setScrollCol(0);
            setModo('tabla');
        } catch (e) {
            setMensaje('No se pudo abrir: ' + e.message);
            setModo('inicio');
        }
    }
    function columnasVisibles() {
        let total = 0, cant = 0;
        for (let i = scrollCol; i < anchos.length; i++) {
            total += anchos[i] + 1;
            if (total > COLUMNAS - 6 && cant > 0) break;
            cant++;
        }
        return Math.max(cant, 1);
    }
    function ajustarScroll(f, c) {
        let sf = scrollFila, sc = scrollCol;
        if (f < sf) sf = f;
        if (f >= sf + filasVisibles) sf = f - filasVisibles + 1;
        if (c < sc) sc = c;
        while (c >= sc + columnasVisibles() && sc < c) sc++;
        setScrollFila(sf);
        setScrollCol(sc);
    }
    function confirmarEdicion(valor) {
        const copia = filas.map(f => [...f]);
        copia[filaSel][colSel] = valor;
        setFilas(copia);
        setModificado(true);
        setModo('tabla');
    }
    function ordenarPorColumna(i) {
        const asc = i === ordenColumna ? !ordenAsc : true;
        const copia = [...filas].sort((a, b) => asc ? comparar(a[i], b[i]) : comparar(b[i], a[i]));
        setFilas(copia);
        setOrdenColumna(i);
        setOrdenAsc(asc);
        setFilaSel(0);
        setScrollFila(0);
        setModificado(true);
    }
    async function guardarArchivo() {
        try {
            await writeFile(archivo, serializarCSV(encabezados, filas), 'utf-8');
            setModificado(false);
            setMensaje('Guardado correctamente');
        } catch (e) {
            setMensaje('Error al guardar: ' + e.message);
        }
    }    
    useInput((tecla, key) => {
    if (modo === 'inicio') {
        if (tecla === 'o' || tecla === 'O') setModo('abrir');
        if (key.escape) exit();
        return;
    }
    if (modo === 'abrir') {
        if (key.escape) setModo('inicio');
        return;
    }
    if (key.escape) exit(); // fallback para 'tabla' (se ampliará en commit 8)
});}





const app = render(<App />);
await app.waitUntilExit();
console.clear();

