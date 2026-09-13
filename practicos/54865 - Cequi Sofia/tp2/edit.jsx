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

function App() {
    const {exit} = useApp();

    const [archivo, setArchivo] = React.useState(null);
    const [cabecera, setCabecera] = React.useState([]);
    const [datos, setDatos] = React.useState([]);

    async function abrirArchivo(nombre) {
        const contenido = await readFile(nombre, "utf8");

        const lineas = contenido.trim().split("\n");

        const nuevaCabecera = lineas[0].split(",");

        const nuevosDatos = lineas.slice(1).map(linea => linea.split(","));

        setArchivo(nombre);
        setCabecera(nuevaCabecera);
        setDatos(nuevosDatos);

    }

    React.useEffect(() =>{
        const archivoInicial = process.argv[2];

        if (archivoInicial) {
            abrirArchivo(archivoInicial)
    }}, []);

    <Box flexDirection="column">
    <Fila fila={cabecera} seleccionada={-1} />

    {datos.map((fila, indice) => (
        <Fila
            key={indice}
            fila={fila}
            seleccionada={-1}
        />
    ))}
    </Box>
    
    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    })

    return (
    <Box
        width={COLUMNAS}
        height={FILAS}
        flexDirection="column"
        padding={1}
    >
        <Text color={COLORES.titulo} bold>
            Editor CSV
        </Text>

        <Text color={COLORES.secundario}>
            {archivo ?? "No se abrió ningún archivo"}
        </Text>

        <Box flexDirection="column">
            <Fila fila={cabecera} seleccionada={-1} />

            {datos.map((fila, indice) => (
                <Fila
                    key={indice}
                    fila={fila}
                    seleccionada={-1}
                />
            ))}
        </Box>

        <Text color={COLORES.secundario}>
            Esc salir
        </Text>
    </Box>
);
}

function Celda({valor, seleccionada}) {
    return (
        <Box width={15}>
            <Text inverse={seleccionada}>
                {valor}
            </Text>
        </Box>
    );
}

function Fila({fila, seleccionada}) {
    return (
        <Box>
            {fila.map((valor, columna) => (
                <Celda
                    key={columna}
                    valor={valor}
                    seleccionada={seleccionada === columna}
                />
            ))}
        </Box>
    );
}


const app = render(<App />);
await app.waitUntilExit();
console.clear();