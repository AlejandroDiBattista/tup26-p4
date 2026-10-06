#!/usr/bin/env -S node --import tsx

import React, {useState} from 'react';
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
    function comparar(a, b) {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
       
        const esNumA = !isNaN(numA) && a.trim() !== '';
        const esNumB = !isNaN(numB) && b.trim() !== '';
       
        if (esNumA && esNumB) {
            return numA - numB;
  }

  return a.localeCompare(b, 'es', { sensitivity: 'base' });
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

        if (modo === 'editar') {
            if (key.escape) setModo('tabla');
            return;
        }

        if (modo === 'salir') {
            if (tecla === 'y' || tecla === 'Y') exit();
            if (tecla === 'n' || tecla === 'N' || key.escape) setModo('tabla');
            return;
        }

        if (modo === 'tabla') {
            if (key.escape) {
                if (modificado) setModo('salir');
                else exit();
                return;
            }
            if (key.upArrow) {
                const f = Math.max(filaSel - 1, 0);
                setFilaSel(f);
                ajustarScroll(f, colSel);
            }
            if (key.downArrow) {
                const f = Math.min(filaSel + 1, Math.max(filas.length - 1, 0));
                setFilaSel(f);
                ajustarScroll(f, colSel);
            }
            if (key.leftArrow) {
                const c = Math.max(colSel - 1, 0);
                setColSel(c);
                ajustarScroll(filaSel, c);
            }
            if (key.rightArrow) {
                const c = Math.min(colSel + 1, Math.max(encabezados.length - 1, 0));
                setColSel(c);
                ajustarScroll(filaSel, c);
            }
            if (key.return && filas.length > 0) {
                setValorEdicion(filas[filaSel]?.[colSel] ?? '');
                setModo('editar');
            }
            if ((tecla === 't' || tecla === 'T') && encabezados.length > 0) {
                ordenarPorColumna(colSel);
            }
            if ((tecla === 'g' || tecla === 'G') && archivo) {
                guardarArchivo();
            }
        }
    });
    const colsVisiblesCant = encabezados.length ? columnasVisibles() : 0;
    const encabezadosVisibles = encabezados.slice(scrollCol, scrollCol + colsVisiblesCant);
    const anchosVisibles = anchos.slice(scrollCol, scrollCol + colsVisiblesCant);
    const filasVisiblesData = filas.slice(scrollFila, scrollFila + filasVisibles);

    return (    
        <Box
            width={COLUMNAS}
            height={FILAS}
            justifyContent="center"
            alignItems="center">
                {modo === 'inicio' && (
                <Box
                    width={COLUMNAS}
                    height={FILAS}
                    flexDirection="column"
                    borderStyle="round"
                    borderColor={COLORES.borde}
                    backgroundColor={COLORES.fondo}>
                    <Box
                        flexGrow={1}
                        justifyContent="center"
                        alignItems="center">
                        <Text bold color={COLORES.titulo}>Editor CSV</Text>
                    </Box>
                    <Text color={COLORES.secundario}>
                        <Text bold color={COLORES.acento}> O</Text> abrir  
                        <Text bold color={COLORES.acento}> Esc</Text> salir
                    </Text>
                    {mensaje ? <Text color={COLORES.acento}>{mensaje}</Text> : null}
                </Box>
            )}
            {modo === 'abrir' && (
                <Box
                    width={50}
                    height={6}
                    flexDirection="column"
                    borderStyle="round"
                    borderColor={COLORES.acento}
                    backgroundColor={COLORES.fondo}
                    paddingX={1}>
                    <Text color={COLORES.titulo}>Abrir archivo CSV:</Text>
                    <TextInput placeholder="empleados.csv" onSubmit={(v) => abrirArchivo(v.trim())} />
                    <Text color={COLORES.secundario}>Esc para cancelar</Text>
                </Box>
            )}
            {(modo === 'tabla' || modo === 'editar' || modo === 'salir') && (
                <Box
                    width={COLUMNAS}
                    height={FILAS}
                    flexDirection="column"
                    borderStyle="round"
                    borderColor={COLORES.borde}
                    backgroundColor={COLORES.fondo}
                    paddingX={1}>
                    <Text bold color={COLORES.titulo}>
                        {basename(archivo)} — {filas.length} filas x {encabezados.length} columnas
                        {modificado ? ' *' : ''}
                    </Text>
                    <Box flexDirection="row">
                        {encabezadosVisibles.map((enc, i) => {
                            const idxReal = scrollCol + i;
                            const esOrdenada = idxReal === ordenColumna;
                            return (
                                <Text key={idxReal} bold color={esOrdenada ? COLORES.acento : COLORES.titulo}>
                                    {ajustar(enc + (esOrdenada ? (ordenAsc ? ' ↑' : ' ↓') : ''), anchosVisibles[i])}{' '}
                                </Text>
                            );
                        })}
                    </Box>
                    <Box flexDirection="column" flexGrow={1}>
                        {filasVisiblesData.map((fila, fi) => {
                            const idxFilaReal = scrollFila + fi;
                            return (
                                <Box key={idxFilaReal} flexDirection="row">
                                    {fila.slice(scrollCol, scrollCol + colsVisiblesCant).map((val, ci) => {
                                        const idxColReal = scrollCol + ci;
                                        const esSel = idxFilaReal === filaSel && idxColReal === colSel;
                                        return (
                                            <Text
                                                key={idxColReal}
                                                backgroundColor={esSel ? COLORES.acento : undefined}
                                                color={esSel ? COLORES.fondo : COLORES.secundario}>
                                                {ajustar(val, anchosVisibles[ci])}{' '}
                                            </Text>
                                        );
                                    })}
                                </Box>
                            );
                        })}
                    </Box>
                    <Box flexDirection="column">
                        {filas.length > 0 && (
                            <Text color={COLORES.secundario}>
                                Celda [{filaSel + 1},{colSel + 1}]: {String(filas[filaSel]?.[colSel] ?? '')}
                            </Text>
                        )}

                        {modo === 'editar' && (
                            <Box>
                                <Text color={COLORES.acento}>Editar [{filaSel + 1},{colSel + 1}]: </Text>
                                <TextInput defaultValue={valorEdicion} onSubmit={confirmarEdicion} />
                            </Box>
                        )}
                        {modo === 'salir' && (
                            <Text color={COLORES.acento}>¿Salir sin guardar los cambios? (Y/N)</Text>
                        )}
                        {mensaje ? <Text color={COLORES.acento}>{mensaje}</Text> : null}
                        {modo === 'tabla' && (
                            <Text color={COLORES.secundario}>
                                <Text bold color={COLORES.acento}> ↑↓←→</Text> mover
                                <Text bold color={COLORES.acento}> Enter</Text> editar
                                <Text bold color={COLORES.acento}> T</Text> ordenar
                                <Text bold color={COLORES.acento}> G</Text> guardar
                                <Text bold color={COLORES.acento}> Esc</Text> salir
                            </Text>
                        )}
                    </Box>
                </Box>
            )}
        </Box>
    );
}
const app = render(<App />);
await app.waitUntilExit();
console.clear();