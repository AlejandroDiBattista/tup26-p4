#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import fs from 'node:fs';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};

function App({ archivoInicial }) {
    const { exit } = useApp();
    const [archivoActual, setArchivoActual] = useState(archivoInicial || '');
    const [cabeceras, setCabeceras] = useState([]);
    const [filas, setFilas] = useState([]);
    const [error, setError] = useState('');

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
    });

    useEffect(() => {
        if (archivoActual) {
            try {
                if (fs.existsSync(archivoActual)) {
                    const contenido = fs.readFileSync(archivoActual, 'utf-8');
                    const lineas = contenido.trim().split(/\r?\n/u);
                    if (lineas.length > 0) {
                        setCabeceras(lineas[0].split(','));
                        setFilas(lineas.slice(1).map(linea => linea.split(',')));
                    }
                } else {
                    setError(`El archivo '${archivoActual}' no existe.`);
                }
            } catch (err) {
                setError(`Error al leer el archivo: ${err.message}`);
            }
        }
    }, [archivoActual]);

    return (
        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
            <Box width={COLUMNAS - 4} height={FILAS - 4} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo} paddingX={1}>
                
                <Box justifyContent="space-between" marginBottom={1}>
                    <Text bold color={COLORES.titulo}>Editor CSV</Text>
                    <Text color={COLORES.secundario}>
                        {archivoActual ? `Archivo: ${archivoActual}` : 'Ningún archivo'} | Filas: {filas.length} | Columnas: {cabeceras.length}
                    </Text>
                </Box>

                {error && <Text color="red">{error}</Text>}

                <Box flexDirection="column" flexGrow={1}>
                    {cabeceras.length > 0 && (
                        <Box flexDirection="column">
                            <Box flexDirection="row" borderBottom borderColor={COLORES.borde}>
                                <Box width={4}><Text bold color={COLORES.acento}> N° </Text></Box>
                                {cabeceras.map((cabecera, i) => (
                                    <Box key={`h-${i}`} width={15}><Text bold color={COLORES.acento}>{cabecera}</Text></Box>
                                ))}
                            </Box>

                            {filas.map((fila, indexFila) => (
                                <Box key={`r-${indexFila}`} flexDirection="row">
                                    <Box width={4}><Text color={COLORES.secundario}> {indexFila + 1} </Text></Box>
                                    {fila.map((celda, indexCelda) => (
                                        <Box key={`c-${indexFila}-${indexCelda}`} width={15}>
                                            <Text color={COLORES.titulo}>{celda}</Text>
                                        </Box>
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>

                <Box marginTop={1} justifyContent="flex-end">
                    <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>
                </Box>
            </Box>
        </Box>
    );
}

const argumentoArchivo = process.argv[2];
const app = render(<App archivoInicial={argumentoArchivo} />);
await app.waitUntilExit();
console.clear();