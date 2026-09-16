#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile, writeFile } from 'node:fs/promises';
import { TextInput } from '@inkjs/ui';
import { basename } from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS = process.stdout.rows || 24;

const COLORES = {
    fondo: '#161310',
    borde: '#726b61',
    titulo: '#ede7db',
    secundario: '#ada79e',
    acento: '#edbb64',
};

function parseCSV(texto) {
    const lineas = texto.split(/\r?\n/).filter(linea => linea.trim() !== "")
    return lineas.map(linea => linea.split(","))
}

function App() {
    const { exit } = useApp();
    const [filas, setFilas] = useState(null)
    const [archivo, setArchivo] = useState(null)

    useEffect(() => {
        const nombreArchivo = process.argv[2]
        if (nombreArchivo) {
            readFile(nombreArchivo, "utf8").then(texto => {
                setFilas(parseCSV(texto))
                setArchivo(nombreArchivo)
            })
        }
    }, [])

    const [seleccion, setSeleccion] = useState({ fila: 1, columna: 0 })

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        } else if (key.downArrow) {
            setSeleccion(prev => ({ ...prev, fila: Math.min(prev.fila + 1, filas.length - 1) }))
        } else if (key.upArrow) {
            setSeleccion(prev => ({ ...prev, fila: Math.max(prev.fila - 1, 1) }))
        } else if (key.rightArrow) {
            setSeleccion(prev => ({ ...prev, columna: Math.min(prev.columna + 1, filas[0].length - 1) }))
        } else if (key.leftArrow) {
            setSeleccion(prev => ({ ...prev, columna: Math.max(prev.columna - 1, 0) }))
        }
    })

    if (filas === null) {
        return <Text color={COLORES.secundario}>Cargando...</Text>
    }

    const anchos = calcularAnchos(filas)

    return (
        <Box flexDirection="column">
            <Text bold color={COLORES.titulo}>
                <Text color={COLORES.secundario}>
                    Valor › <Text color={COLORES.titulo}>{filas[seleccion.fila][seleccion.columna]}</Text>
                </Text>
                {basename(archivo)}   {filas.length - 1} filas · {filas[0].length} columnas
            </Text>
            {filas.map((fila, i) => {
                const numero = i === 0 ? "" : String(i)
                const numeroConEspacio = numero.padStart(3) + "  "

                return (
                    <Box key={i}>
                        <Text>{numeroConEspacio}</Text>
                        {fila.map((valor, col) => {
                            const esSeleccionada = i === seleccion.fila && col === seleccion.columna
                            const texto = rellenar(valor, anchos[col]) + "  "

                            if (esSeleccionada) {
                                return <Text key={col} backgroundColor={COLORES.acento} color={COLORES.fondo}>{texto}</Text>
                            }
                            return <Text key={col}>{texto}</Text>
                        })}
                    </Box>
                )
            })}

            <Text color={COLORES.secundario}>
                A abrir · G guardar · Enter editar · {"<"} ascendente · {">"} descendente · Esc salir{"   "}
                Fila {seleccion.fila} · Columna {seleccion.columna + 1}
            </Text>

        </Box>

    )
}

function calcularAnchos(filas) {
    const cantidadColumnas = filas[0].length
    const anchos = []

    for (let col = 0; col < cantidadColumnas; col++) {
        let maximo = 0
        for (const fila of filas) {
            if (fila[col].length > maximo) {
                maximo = fila[col].length
            }
        }
        anchos.push(maximo)
    }

    return anchos
}

function rellenar(texto, ancho) {
    return texto.padEnd(ancho)
}


const app = render(<App />);
await app.waitUntilExit();
console.clear();