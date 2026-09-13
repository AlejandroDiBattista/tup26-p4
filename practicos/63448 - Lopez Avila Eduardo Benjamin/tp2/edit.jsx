#!/usr/bin/env -S node --import tsx

import React, { useMemo } from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile} from 'node:fs/promises';
import {basename} from 'node:path';

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};

async function parseFile(filePath) {
    try {
        const data = await readFile(filePath, 'utf8');
        const tabla = { header: [], filas: [] };
        tabla.filas = data.split(/\r?\n|\r/).map((fila) => fila.split(","));
        tabla.header = tabla.filas.shift();
        tabla.filas = tabla.filas.filter(fila => fila.length === tabla.header.length);
        tabla.filas = tabla.filas.map(fila => fila.map(campo => campo.trim()));
        return tabla;
    } catch (error) {
        console.error(`Error al leer el archivo ${filePath}:`, error);
        process.exit(1);
    }
}

function Header({ header, anchos }) {
    return (
        <Box flexDirection="row" marginBottom={1}>
            <Box width={4} alignItems="flex-end" paddingRight={1}>
                <Text color={COLORES.secundario} bold>N°</Text>
            </Box>
            {header.map((campo, index) => (
                <Box key={index} width={anchos[index] + 2}>
                    <Text color={COLORES.titulo} bold>{campo.toUpperCase()}</Text>
                </Box>
            ))}
        </Box>
    );
}

function Row({ fila, indice, anchos }) {
    return (
        <Box flexDirection="row">
            <Box width={4} alignItems="flex-end" paddingRight={1}>
                <Text color={COLORES.titulo}>{indice}</Text>
            </Box>
            {fila.map((campo, index) => (
                <Box key={index} width={anchos[index] + 2}>
                    <Text color={COLORES.titulo}>{campo}</Text>
                </Box>
            ))}
        </Box>
    );
}

function App({ ruta, data }) {
    const {exit} = useApp();
    
    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    });

    const anchos = useMemo(() => {
        return data.header.map((col, i) => {
            const maxFila = Math.max(...data.filas.map(f => (f[i] || '').length));
            return Math.max(col.length, maxFila);
        });
    }, [data]);
    
    return (
        <Box flexDirection="column" borderStyle="round" borderColor={COLORES.borde} paddingX={1} paddingY={0}>
            <Header header={data.header} anchos={anchos} />
            {data.filas.map((fila, index) => (
                <Row key={index} fila={fila} indice={index + 1} anchos={anchos} />
            ))}
        </Box>
    );
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Uso: npx tsx edit.jsx <archivo.csv>");
        process.exit(1);
    }
    const filePath = args[0];
    const tabla = await parseFile(filePath);
    await render(<App ruta={filePath} data={tabla} />);
}

main();


//Notas IA:
//1: Tenia muchos problemas para calcular un ancho de columna flexible con respecto al contenido. Comparó la longitud de cada campo en cada fila y la longitud del encabezado para determinar el ancho máximo de cada columna. Y usar useMemo para evitar recalcularlo en cada renderizado.