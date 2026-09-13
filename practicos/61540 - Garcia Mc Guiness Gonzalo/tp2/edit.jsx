#!/usr/bin/env -S node --import tsx

import React, {useEffect, useState} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';


const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};

function App() {
    const {exit} = useApp()
    const archivoInicial = process.argv[2]
    const [pidiendoArchivo, setPidiendoArchivo] = useState(!archivoInicial)
    const [nombreArchivo, setNombreArchivo] = useState('')
    const [contenido, setContenido] = useState('')
    const [cabecera, setCabecera] = useState([])
    const [filas, setFilas] = useState([])
    
    const [columnas, setColumnas] = useState(process.stdout.columns || 80)

    const [filaActual, setFilaActual] = useState(0)
    const [columnaActual, setColumnaActual] = useState(0)
    const [modoEdicion, setModoEdicion] = useState(false)
    const [valorTemporal, setValorTemporal] = useState('')


    const ancho = 4
    const separacion = 2
    const anchoColumna = cabecera.length ? Math.floor(
        (columnas - ancho - separacion * cabecera.length) / cabecera.length
    ): columnas


    async function abrirArchivo(nombre) {
        try {
            const datos = await readFile(nombre, 'utf-8')
            const lineas = datos.split(/\r?\n/).filter(l => l !== '')
            const cabecera = lineas[0].split(',')
            const filas = lineas.slice(1).map(l => l.split(','))
            setCabecera(cabecera)
            setFilas(filas)
            setNombreArchivo(nombre)
            setPidiendoArchivo(false)
        } catch {
            setContenido('Error: no se pudo abrir el archivo')
        }
    }

    useEffect(() => {
        if (archivoInicial) {
            abrirArchivo(archivoInicial)
        }
    }, [])

    useEffect(() => {
        const actualizarTamaño = () => {
            setColumnas(process.stdout.columns || 80)
        }
        
        process.stdout.on('resize', actualizarTamaño)
        return () => {
            process.stdout.off('resize', actualizarTamaño)
        }
    }, [])

    useInput((tecla, key) => {

        if (pidiendoArchivo) return

        if (modoEdicion) {
            if (key.escape) {
                setModoEdicion(false)
                setValorTemporal('')
                return
            }
            if (key.return) {
                const copiaFilas = filas.map(f => [...f])
                copiaFilas[filaActual][columnaActual] = valorTemporal
                setFilas(copiaFilas)
                setModoEdicion(false)
                setValorTemporal('')
                return
            }

            if (key.backspace || key.delete) {
                setValorTemporal(v => v.slice(0, -1))
                return
            }
            
            if (tecla && tecla.length === 1) {
                setValorTemporal( v => v + tecla)
            }
            return
        }

        if (key.escape) {
            exit();
            return
        }

        if (key.upArrow) {
            setFilaActual(f => Math.max(0, f -1))
            return
        }
        if (key.downArrow) {
            setFilaActual(f => Math.min(filas.length -1, f +1))
            return
        }
        if (key.leftArrow) {
            setColumnaActual(c => Math.max(0, c -1))
            return
        }
        if (key.rightArrow) {
            setColumnaActual(c => Math.min(cabecera.length -1, c +1))
            return
        }

        if (key.return) {
            setModoEdicion(true)
            setValorTemporal(String(filas[filaActual]?.[columnaActual] ?? ''))
        }


    })

    if (pidiendoArchivo) {
        return (
            <Box>
                <Text>Ingrese el nombre del archivo a abrir: </Text>
                <TextInput 
                    defaultValue={nombreArchivo}
                    onChange={setNombreArchivo}
                    onSubmit={abrirArchivo} 
                />
            </Box>
        )
    }

    return (
        <Box flexDirection="column" width={columnas} borderStyle="round" borderColor={COLORES.borde}>
            <Box flexDirection="row" justifyContent="space-between" paddingBottom={2}>
                <Text color={COLORES.titulo}>Archivo: {nombreArchivo}</Text>  
                <Text color={COLORES.secundario}>
                    Columnas: {cabecera.length} | Filas: {filas.length}
                </Text>
            </Box>
            <Box flexDirection="row" gap={separacion}  >
                <Box width={ancho}>
                    <Text bold>N°</Text>
                </Box>

                {cabecera.map((nombre, indiceColumna) => (
                    <Box key={indiceColumna} width={anchoColumna}>
                        <Text bold>{nombre.toUpperCase()}</Text>
                    </Box>
                ))}
            </Box>

            <Box flexDirection="column">
                {filas.map((fila, indiceFila) => (
                    <Box key={indiceFila} flexDirection="row" gap={separacion}>
                        <Box width={ancho}>
                            <Text color={COLORES.secundario}>{indiceFila + 1}</Text>
                        </Box>

                        {fila.map((valor, indiceColumna) => {
                            const seleccionada = indiceFila === filaActual && indiceColumna === columnaActual
                            const textoVisible = seleccionada && modoEdicion ? valorTemporal : valor
                            return (
                                <Box
                                    key={indiceColumna}
                                    width={anchoColumna}
                                    backgroundColor={seleccionada ? COLORES.acento : undefined}>
                                    <Text
                                        color={seleccionada ? COLORES.fondo : COLORES.titulo}
                                        backgroundColor={seleccionada ? COLORES.acento : undefined}
                                        wrap="truncate-end"> {textoVisible}
                                    </Text>
                                </Box>
                            )
                        })}
                    </Box>
                ))}
            </Box>

        </Box>   
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();