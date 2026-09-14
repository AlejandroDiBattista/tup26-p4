#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile, writeFile } from 'node:fs/promises';
import { TextInput } from '@inkjs/ui';
import { basename } from 'node:path';
import { string } from 'zod';

const COLUMNAS = process.stdout.columns || 80;
const FILAS = process.stdout.rows || 24;

const COLORES = {
    fondo: '#161310',
    borde: '#726b61',
    titulo: '#ede7db',
    secundario: '#ada79e',
    acento: '#edbb64',
};

function App({ archivoInicial }) {
    const { exit } = useApp();

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    })

    const [archivo, setArchivo] = useState(null);
    const [cabecera, setCabecera] = useState([]);
    const [filas, setFilas] = useState([]);
    const [filaSel, setFilaSel] = useState(0);
    const [colSel, setColSel] = useState(0);
    const [scrollFila, setScrollFila] = useState(0);
    const [modo, setModo] = useState(archivoInicial ? null : 'abrir');
    const [error, setError] = useState(null);
    const [listo, setListo] = useState(!archivoInicial);

    const tieneDatos = cabecera.lenght > 0;

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
            ...filas.map(fila => fila.join('\n')),
        ];
    }
    //funcion de callback para sort
    function compararCeldas(a, b) {
        const ta = a.trim();
        const tb = b.trim();
        const na = Number(ta);
        const nb = Number(tb);
        const ambosNum = ta !== '' && tb !== '' && !Number.isNaN(na) && !Number.isNaN(nb);
        if (ambosNum) return na - nb;
        return string(a).localCompare(String(b), 'es', { sensitivity: 'base' });
    }

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

    useEffect(() => {
        if (!archivoInicial) return;
        abrirArchivo(archivoInicial).finally(() => setListo(true));
    }, [archivoInicial])
    return (
        <Box>
            <Text>
                Archivo inicial : {archivoInicial ?? 'ningun archivo - tenes que cargarlo primero.'}
            </Text>
        </Box>
        // <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
        //     <Box width={40} height={10} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
        //         <Box flexGrow={1} justifyContent="center" alignItems="center">
        //             <Text bold color={COLORES.titulo}>Editor CSV</Text>
        //         </Box>
        //         <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>
        //     </Box>
        // </Box>
    );
}
const archivoInicial = process.argv[2] ?? null;
const app = render(<App archivoInicial={archivoInicial} />);
await app.waitUntilExit();
console.clear();