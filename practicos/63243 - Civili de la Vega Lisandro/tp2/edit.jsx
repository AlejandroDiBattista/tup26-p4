#!/usr/bin/env -S node --import tsx

import React from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

// convierto archivo a csv
function parseCSV(texto) {
    // saco posibles saltos de linea y lineas vacias al final
    const lineas = texto.replace(/\r/g, '').split('\n').filter(l => l.length > 0);
    //separo la cabecera de los datos
    const cabecera = lineas[0].split(',');
    const filas = [];
    for (let i = 1; i < lineas.length; i++) {
        filas.push(lineas[i].split(','));
    }

    return {cabecera, filas};
}

// armo el texto del csv a partir de la cabecera y las filas
function serializeCSV(cabecera, filas) {
    let texto = cabecera.join(',') + '\n';
    for (const fila of filas) {
        texto += fila.join(',') + '\n';
    }
    return texto;
}

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};


// calculo ancho de cada columna dependiendo de cabecera y celdas. Tambien tiene tope
function calcularAnchos(cabecera, filas) {
    const anchos = cabecera.map(c => c.length);

    for (const fila of filas) {
        for (let c = 0; c < fila.length; c++) {
            if (fila[c].length > anchos[c]) {
                anchos[c] = fila[c].length;
            }
        }
    }

    return anchos.map(a => Math.min(a, 20));
}

// cuantas filas de datos entran en pantalla (le resto un par de lineas
// que use para el borde, titulo, cabecera y el cartelito de abajo)
const FILAS_VISIBLES = Math.max(FILAS - 6, 3);
const COLUMNAS_VISIBLES = 5; // por ahora dejo un numero fijo de columnas a la vez


// funcion para dibujar la tabal con cabecera arriba y filas ennumeradas abajo
function Tabla({nombreArchivo, cabecera, filas, filaSel, colSel}) {
    const anchos = calcularAnchos(cabecera, filas);
    const anchoNumero = String(filas.length).length + 1;

    // calculo el rango de filas que se ve, para que la celda
    // seleccionada siempre quede dentro de la ventana visible
    let inicioFila = filaSel - Math.floor(FILAS_VISIBLES / 2);
    if (inicioFila < 0) inicioFila = 0;
    if (inicioFila + FILAS_VISIBLES > filas.length) {
        inicioFila = Math.max(filas.length - FILAS_VISIBLES, 0);
    }
    const finFila = Math.min(inicioFila + FILAS_VISIBLES, filas.length);

    // lo mismo pero para las columnas
    let inicioCol = colSel - Math.floor(COLUMNAS_VISIBLES / 2);
    if (inicioCol < 0) inicioCol = 0;
    if (inicioCol + COLUMNAS_VISIBLES > cabecera.length) {
        inicioCol = Math.max(cabecera.length - COLUMNAS_VISIBLES, 0);
    }
    const finCol = Math.min(inicioCol + COLUMNAS_VISIBLES, cabecera.length);

    const valorSeleccionado = filas[filaSel][colSel];


    return (
        <Box flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
            <Text color={COLORES.titulo} bold> {nombreArchivo} ({filas.length} filas, {cabecera.length} columnas)</Text>

            <Box>
                <Text> </Text>
                <Box width={anchoNumero}><Text> </Text></Box>
                {cabecera.slice(inicioCol, finCol).map((col, i) => {
                    const c = inicioCol + i;
                    return (
                        <Box key={c} width={anchos[c] + 2}>
                            <Text bold color={COLORES.acento}>{col}</Text>
                        </Box>
                    );
                })}
            </Box>

            {filas.slice(inicioFila, finFila).map((fila, i) => {
                const f = inicioFila + i;
                return (
                    <Box key={f}>
                        <Text> </Text>
                        <Box width={anchoNumero}><Text color={COLORES.secundario}>{f + 1}</Text></Box>
                        {fila.slice(inicioCol, finCol).map((valor, j) => {
                            const c = inicioCol + j;
                            const esSeleccionada = f === filaSel && c === colSel;
                            return (
                                <Box key={c} width={anchos[c] + 2}>
                                    <Text color={COLORES.titulo} inverse={esSeleccionada}>{valor}</Text>
                                </Box>
                            );
                        })}
                    </Box>
                );
            })}

            <Text color={COLORES.secundario}>
                Celda ({filaSel + 1}, {cabecera[colSel]}): <Text bold color={COLORES.acento}>{valorSeleccionado}</Text>
            </Text>
        </Box>
    );
}

function App({nombreArchivo, cabecera, filas}) {
    const {exit} = useApp();
    const [filaSel, setFilaSel] = React.useState(0);
    const [colSel, setColSel] = React.useState(0);

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        } else if (key.upArrow) {
            setFilaSel(f => Math.max(f - 1, 0));
        } else if (key.downArrow) {
            setFilaSel(f => Math.min(f + 1, filas.length - 1));
        } else if (key.leftArrow) {
            setColSel(c => Math.max(c - 1, 0));
        } else if (key.rightArrow) {
            setColSel(c => Math.min(c + 1, cabecera.length - 1));
        }
    })

    return (
        <Box width={COLUMNAS} flexDirection="column">
            <Tabla nombreArchivo={nombreArchivo} cabecera={cabecera} filas={filas} filaSel={filaSel} colSel={colSel} />
        </Box>
    );
}

// cargo archivo que viene por argumento en la terminal
const nombreArchivo = process.argv[2] || 'empleados.csv';
const textoArchivo = await readFile(nombreArchivo, 'utf-8');
const {cabecera, filas} = parseCSV(textoArchivo);

const app = render(<App nombreArchivo={basename(nombreArchivo)} cabecera={cabecera} filas={filas} />);
await app.waitUntilExit();
console.clear();