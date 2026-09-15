#!/usr/bin/env -S node --import tsx

import React, { useEffect, useState } from 'react';
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


function parsearCSV (archivo){
    const lineas= archivo.trim().split("\n")
    const cabecera= lineas[0].split(",")
    const filas= lineas.slice(1).map(linea=> linea.split(","))
    return {cabecera, filas};
}
async function leerArchivo(nombreArchivo) {
    const contenido= await readFile(nombreArchivo, "utf-8")
    return parsearCSV(contenido)
}

function calcularAnchos(cabecera, filas) {
    const anchos= []
    for (let i=0; i < cabecera.length; i++){
        let maximo = cabecera[i].length;
        for (let j =0; j < filas.length; j++){
            if (filas[j][i].length > maximo){
                maximo= filas[j][i].length
            }
        }
        anchos.push(maximo + 2);
    }
    return anchos
}

const FilaTabla = ({valores, anchos, esCabecera}) => (
    <Box>
        {
            valores.map((valor, i) => (
                <Box key={i} width={anchos[i]}> 
                    <Text bold={esCabecera} color={esCabecera ? COLORES.acento : COLORES.secundario}>
                        {valor}
                    </Text>
                </Box>
            ))
        }
    </Box>
)
const nombreArchivo= process.argv[2]
function App() {
    const {exit} = useApp();
    
    const [datos, setDatos]= useState(null)
    useEffect(() => {
        leerArchivo(nombreArchivo).then(resultado => {
            setDatos(resultado);
        })
    }, [])
    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    })

    if (!datos){
        return (
            <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
                <Text color={COLORES.secundario}>Cargando</Text>
            </Box>
        )
    }

    const anchos= calcularAnchos(datos.cabecera, datos.filas);

    return (
        <Box width={COLUMNAS} height={FILAS} flexDirection="column" padding={1}>
            <Box justifyContent="space-between">
                <Text bold color={COLORES.titulo}>{nombreArchivo}</Text>
                <Text color={COLORES.secundario}>{datos.filas.length} filas · {datos.cabecera.length} columnas</Text>
            </Box>
            <Box marginTop={1} flexDirection="column">
                <FilaTabla valores={datos.cabecera} anchos={anchos} esCabecera={true} />
                {datos.filas.map((fila, i) => (
                    <FilaTabla key={i} valores={fila} anchos={anchos} esCabecera={false} />
                ))}
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();