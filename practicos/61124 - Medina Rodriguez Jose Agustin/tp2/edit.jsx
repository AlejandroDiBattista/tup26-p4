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

function convertirCsv(contenido) {
    if (contenido.trim() === '') {
        throw new Error('El archivo CSV está vacío');
    }

    const lineas = contenido.trimEnd().split(/\r?\n/);
    const cabecera = lineas[0].split(',');

    if (cabecera.some(celda => celda.trim() === '')) {
        throw new Error('La cabecera contiene columnas sin nombre');
    }

    const filas = lineas.slice(1).map((linea, indice) => {
        if (linea.trim() === '') {
            throw new Error(`La fila ${indice + 1} está vacía`);
        }

        const fila = linea.split(',');

        if (fila.length !== cabecera.length) {
            throw new Error(
                `La fila ${indice + 1} tiene ${fila.length} columnas; se esperaban ${cabecera.length}`
            );
        }

        return fila;
    });

    return {cabecera, filas};
}

function FilaTabla({
    celdas,
    numero,
    esCabecera = false,
    esFilaSeleccionada = false,
    columnaSeleccionada = 0,
}) {
    return (
        <Box>
            <Box width={6} justifyContent="flex-end" paddingRight={2}>
                <Text
                    bold={esCabecera || esFilaSeleccionada}
                    color={
                        esFilaSeleccionada
                            ? COLORES.acento
                            : COLORES.secundario
                    }
                >
                    {esCabecera ? '#' : numero}
                </Text>
            </Box>

            {celdas.map((celda, indice) => {
                const celdaSeleccionada =
                    !esCabecera &&
                    esFilaSeleccionada &&
                    indice === columnaSeleccionada;

                const cabeceraSeleccionada =
                    esCabecera &&
                    indice === columnaSeleccionada;

                return (
                    <Box
                        key={indice}
                        flexBasis={0}
                        flexGrow={1}
                        paddingRight={1}
                        backgroundColor={
                            celdaSeleccionada
                                ? COLORES.titulo
                                : undefined
                        }
                    >
                        <Text
                            bold={esCabecera || celdaSeleccionada}
                            color={
                                celdaSeleccionada
                                    ? COLORES.fondo
                                    : cabeceraSeleccionada
                                        ? COLORES.acento
                                        : esCabecera
                                            ? COLORES.secundario
                                            : COLORES.titulo
                            }
                            wrap="truncate-end"
                        >
                            {esCabecera
                                ? celda.toUpperCase()
                                : celda}
                        </Text>
                    </Box>
                );
            })}
        </Box>
    );
} 

function compararValores(valorA, valorB) {
    const numeroA = Number(valorA);
    const numeroB = Number(valorB);

    const ambosSonNumeros =
        valorA.trim() !== '' &&
        valorB.trim() !== '' &&
        Number.isFinite(numeroA) &&
        Number.isFinite(numeroB);

    if (ambosSonNumeros) {
        return numeroA - numeroB;
    }

    return valorA.localeCompare(valorB, 'es', {
        sensitivity: 'base',
    });
}

function App({nombreArchivo, cabecera, filasIniciales}) {
    const {exit} = useApp();
    const [filas, setFilas] = useState(filasIniciales);
    const [filaSeleccionada, setFilaSeleccionada] = useState(0);
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);
    const cantidadFilasVisibles = Math.max(1, FILAS - 8);
    const inicioVisible = Math.max( 0,filaSeleccionada - cantidadFilasVisibles + 1);
    const filasVisibles = filas.slice(inicioVisible,inicioVisible + cantidadFilasVisibles);
    const valorSeleccionado = filas[filaSeleccionada]?.[columnaSeleccionada] ?? '';
    const ordenarFilas = direccion => {
    setFilas(filasActuales => {
        const copia = [...filasActuales];

        copia.sort((filaA, filaB) => {
            const resultado = compararValores(
                filaA[columnaSeleccionada],
                filaB[columnaSeleccionada]
            );

            return direccion === 'ascendente'
                ? resultado
                : -resultado;
        });

        return copia;
    });

    setFilaSeleccionada(0);
};
   useInput((tecla, key) => {
    if (key.escape) {
        exit();
        return;
    }

    if (tecla === '<') {
    ordenarFilas('ascendente');
    return;
}

if (tecla === '>') {
    ordenarFilas('descendente');
    return;
}

    if (key.upArrow) {
        setFilaSeleccionada(actual =>
            Math.max(0, actual - 1)
        );
    }

    if (key.downArrow) {
        setFilaSeleccionada(actual =>
            Math.min(
                Math.max(0, filas.length - 1),
                actual + 1
            )
        );
    }

    if (key.leftArrow) {
        setColumnaSeleccionada(actual =>
            Math.max(0, actual - 1)
        );
    }

    if (key.rightArrow) {
        setColumnaSeleccionada(actual =>
            Math.min(cabecera.length - 1, actual + 1)
        );
    }
    })

   return (
    <Box
        width={COLUMNAS}
        height={FILAS}
        flexDirection="column"
        borderStyle="round"
        borderColor={COLORES.borde}
        backgroundColor={COLORES.fondo}
        paddingX={1}
    >
        <Box justifyContent="space-between">
            <Text bold color={COLORES.titulo}>
                {nombreArchivo}
            </Text>

            <Text color={COLORES.secundario}>
                {filas.length} filas · {cabecera.length} columnas
            </Text>
        </Box>

        <Box marginTop={1}>
            <Text color={COLORES.secundario}>Valor › </Text>
            <Text color={COLORES.titulo}>{valorSeleccionado}</Text>
        </Box>

        <Box marginTop={1} flexDirection="column">
            <FilaTabla
                celdas={cabecera}
                esCabecera={true}
                columnaSeleccionada={columnaSeleccionada}
            />

           {filasVisibles.map((fila, indice) => {
               const indiceReal = inicioVisible + indice;

           return (
               <FilaTabla
                   key={indiceReal}
                   celdas={fila}
                   numero={indiceReal + 1}
                   esFilaSeleccionada={
                       indiceReal === filaSeleccionada
                   }
                   columnaSeleccionada={columnaSeleccionada}
               />
            );
})}
        </Box>

        <Box flexGrow={1} />
       <Box justifyContent="space-between">
    <Box>
        <Text color={COLORES.secundario}>
            <Text bold color={COLORES.acento}>Esc</Text> salir
        </Text>

        <Text color={COLORES.secundario}>
            {' · '}
            <Text bold color={COLORES.acento}>{'<'}</Text> ascendente
            {' · '}
            <Text bold color={COLORES.acento}>{'>'}</Text> descendente
        </Text>
    </Box>

    <Text color={COLORES.secundario}>
        Fila {filaSeleccionada + 1} · Columna {columnaSeleccionada + 1}
    </Text>
</Box>
</Box>
);
}

const rutaArchivo = process.argv[2];

if (!rutaArchivo) {
    console.error('Error: tenés que indicar un archivo CSV');
    console.error('Uso: edit <archivo.csv>');
    process.exit(1);
}

let cabecera;
let filas;

try {
    const contenido = await readFile(rutaArchivo, 'utf8');
    ({cabecera, filas} = convertirCsv(contenido));
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
}
const app = render(
    <App
        nombreArchivo={basename(rutaArchivo)}
        cabecera={cabecera}
        filasIniciales={filas}
    />
);

await app.waitUntilExit();

console.clear();
