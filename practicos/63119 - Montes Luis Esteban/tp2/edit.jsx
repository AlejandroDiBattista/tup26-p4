#!/usr/bin/env -S node --import tsx
import React, {useEffect, useState} from 'react';
import {Box, Text, render, useApp, useInput, useStdout} from 'ink';
import {TextInput} from '@inkjs/ui';
import {readFile, writeFile} from 'node:fs/promises';
import {basename} from 'node:path';

function separar(texto) {
    const lineas = texto.replace(/^\uFEFF/, '').replace(/[\r\n]+$/, '');
    const [titulo, ...resto] = lineas.split(/\r?\n/);
    if (!titulo) throw new Error('El archivo está vacío.');
    const columnas = titulo.split(',');
    const filas = resto.map((linea, indice) => {
        const fila = linea.split(',');
        if (fila.length !== columnas.length) throw new Error('Revisá la fila ' + (indice + 2));
        return fila;
    });
    return {columnas, filas};
}

function Tabla({tabla, fila, columna, ancho, alto}) {
    const anchoCelda = Math.max(5, Math.min(18, ancho - 9));
    const cantidad = Math.max(1, Math.floor((ancho - 9) / anchoCelda));
    const inicio = Math.max(0, columna - cantidad + 1);
    const desde = Math.max(0, fila - alto + 1);
    function linea(datos, numero) {
        return <Box key={numero}><Text>{String(numero || '#').padStart(4)} </Text>
            {datos.slice(inicio, inicio + cantidad).map((valor, i) =>
                <Text key={i} bold={!numero} inverse={numero === fila + 1 && i + inicio === columna}>
                    {valor.slice(0, anchoCelda - 1).padEnd(anchoCelda)}
                </Text>)}</Box>;
    }
    return <Box flexDirection="column">
        {linea(tabla.columnas, 0)}
        {tabla.filas.slice(desde, desde + alto).map((datos, i) => linea(datos, desde + i + 1))}
    </Box>;
}

function App() {
    const {exit} = useApp();
    const {stdout} = useStdout();
    const [archivo, ponerArchivo] = useState('');
    const [tabla, ponerTabla] = useState({columnas: [], filas: []});
    const [error, ponerError] = useState('');
    const [modo, cambiarModo] = useState('tabla');
    const [fila, elegirFila] = useState(0);
    const [columna, elegirColumna] = useState(0);
    const [ocupado, ocupar] = useState(false);

    async function abrir(nombre) {
        ocupar(true);
        try {
            const datos = separar(await readFile(nombre, 'utf8'));
            ponerTabla(datos);
            ponerArchivo(nombre);
            elegirFila(0);
            elegirColumna(0);
            ponerError('');
            cambiarModo('tabla');
        } catch (e) {
            ponerError(e.message);
        } finally {
            ocupar(false);
        }
    }

    useEffect(() => {
        if (process.argv[2]) abrir(process.argv[2]);
        else cambiarModo('abrir');
    }, []);

    function editar(valor) {
        if (/[,\r\n"]/.test(valor)) { ponerError('Ingresá un valor sin comas, comillas ni saltos de línea.'); return; }
        const filas = tabla.filas.map((datos, i) =>
            i === fila ? datos.map((dato, j) => j === columna ? valor : dato) : datos);
        ponerTabla({...tabla, filas});
        cambiarModo('tabla');
        ponerError('');
    }

    function ordenar(sentido) {
        const numeros = tabla.filas.every(datos => datos[columna].trim() !== '' && Number.isFinite(Number(datos[columna])));
        const filas = [...tabla.filas].sort((a, b) => sentido * (numeros
            ? Number(a[columna]) - Number(b[columna])
            : a[columna].localeCompare(b[columna], 'es', {sensitivity:'base'})));
        ponerTabla({...tabla, filas});
    }

    async function guardar(nombre) {
        ocupar(true);
        try {
            const texto = [tabla.columnas, ...tabla.filas].map(datos => datos.join(',')).join('\n');
            await writeFile(nombre, texto + '\n', 'utf8');
            ponerArchivo(nombre);
            cambiarModo('tabla');
            ponerError('');
        } catch (e) {
            ponerError(e.message);
        } finally {
            ocupar(false);
        }
    }

    useInput((tecla, boton) => {
        if (ocupado) return;
        if (boton.escape) {
            if (modo === 'tabla') exit();
            else { cambiarModo('tabla'); ponerError(''); }
            return;
        }
        if (modo !== 'tabla') return;
        if (tecla.toLowerCase() === 'a') cambiarModo('abrir');
        if (boton.upArrow) elegirFila(Math.max(0, fila - 1));
        if (boton.downArrow && fila + 1 < tabla.filas.length) elegirFila(fila + 1);
        if (boton.leftArrow) elegirColumna(Math.max(0, columna - 1));
        if (boton.rightArrow && columna + 1 < tabla.columnas.length) elegirColumna(columna + 1);
        if (boton.return && tabla.filas.length) cambiarModo('editar');
        if (tecla === '<') ordenar(1);
        if (tecla === '>') ordenar(-1);
        if (tecla.toLowerCase() === 'g' && tabla.columnas.length) cambiarModo('guardar');
    });
    return <Box flexDirection="column" borderStyle="round" paddingX={1}>
        <Text bold>{archivo ? basename(archivo) : 'Editor CSV'} · {tabla.filas.length} filas · {tabla.columnas.length} columnas</Text>
        <Tabla tabla={tabla} fila={fila} columna={columna} ancho={stdout.columns || 80} alto={Math.max(1, (stdout.rows || 24) - 9)}/>
        {tabla.filas[fila] && <Text>Fila {fila + 1} · Columna {columna + 1} · Valor: {tabla.filas[fila][columna]}</Text>}
        {error && <Text color="red">{error}</Text>}
        {modo === 'tabla' ? <Text>Flechas mover · Enter editar · &lt; asc · &gt; desc · A abrir · G guardar · Esc salir</Text> :
            <Box><Text>{modo === 'abrir' ? 'Abrir:' : modo === 'guardar' ? 'Guardar:' : 'Valor:'} </Text><TextInput key={modo} defaultValue={modo === 'editar' ? tabla.filas[fila][columna] : modo === 'guardar' ? archivo : ''} onSubmit={modo === 'editar' ? editar : modo === 'guardar' ? guardar : abrir}/></Box>}
    </Box>;
}
render(<App/>);
