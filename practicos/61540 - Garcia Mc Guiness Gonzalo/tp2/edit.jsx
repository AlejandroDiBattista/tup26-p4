#!/usr/bin/env -S node --import tsx

import React, {useEffect, useState} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';



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

    const [accionActual, setAccionActual] = useState(null)

    const ancho = 4
    const separacion = 2

    const filasVisiblesMax = Math.max(4, Math.min(10, Math.floor((process.stdout.rows || 24) / 2)))
    const columnasVisiblesMax = Math.max(2, Math.min(cabecera.length || 1, 6))

    const filaInicio = Math.max(
        0,
        Math.min(
            filaActual - Math.floor(filasVisiblesMax / 2),
            Math.max(0, filas.length - filasVisiblesMax)
        )
    )

    const columnaInicio = Math.max(
        0,
        Math.min(
            columnaActual - Math.floor(columnasVisiblesMax / 2),
            Math.max(0, cabecera.length - columnasVisiblesMax)
        )
    )

    const columnasVisibles = cabecera.slice(columnaInicio, columnaInicio + columnasVisiblesMax)
    const anchoColumna = columnasVisibles.length
        ? Math.max(
            10,
            Math.floor(
                (columnas - ancho - separacion * (columnasVisibles.length + 1) - 4) /
                columnasVisibles.length
            )
        )
        : 10

    const filaActualReal = filas[filaActual]
    const valorCeldaActual = filaActualReal?.[columnaActual] ?? ''
    const nombreColumnaActual = cabecera[columnaActual] ?? ''

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
            setContenido('')
            setFilaActual(0)
            setColumnaActual(0)
        } catch {
            setContenido('Error: no se pudo abrir el archivo')
        }
    }

    async function guardarArchivo(nombre) {
        try {
            const texto = [
                cabecera.join(','), ...filas.map(f => f.join(','))
            ].join('\n')

            await writeFile(nombre, texto, 'utf-8')
            setContenido('Archivo guardado correctamente')
            setNombreArchivo(nombre)
            setPidiendoArchivo(false)
        } catch {
            setContenido('Error: no se pudo guardar el archivo')
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

        if (tecla === 'a' || tecla === 'A') {
            setAccionActual('abrir')
            setPidiendoArchivo(true)
            setNombreArchivo('')
            return
        }

        if (tecla === 'g' || tecla === 'G') {
            setAccionActual('guardar')
            setPidiendoArchivo(true)
            setNombreArchivo(nombreArchivo || '')
            return
        }

        if (tecla === '<') {
            const indice = columnaActual
            const ordenadas = [...filas].sort((a, b) => {
                const valorA = String(a[indice] ?? '').toLowerCase()
                const valorB = String(b[indice] ?? '').toLowerCase()
                return valorA.localeCompare(valorB)
            })

            setFilas(ordenadas)
            return
        }
        if (tecla === '>') {
            const indice = columnaActual
            const ordenadas = [...filas].sort((a, b) => {
                const valorA = String(a[indice] ?? '').toLowerCase()
                const valorB = String(b[indice] ?? '').toLowerCase()
                return valorB.localeCompare(valorA)
            })
            setFilas(ordenadas)
        }


    })

    if (pidiendoArchivo) {
        return (
            <Box>
                <Text>
                    {accionActual === 'abrir' 
                    ? "Ingrese el nombre del archivo a abrir: " 
                    : "Ingrese el nombre del archivo donde guardar: "}    
                </Text>

                <TextInput 
                    defaultValue={nombreArchivo}
                    onChange={setNombreArchivo}
                    onSubmit={(valor) => {
                        if (accionActual === 'abrir') {
                            abrirArchivo(valor)
                        } else if (accionActual === 'guardar') {
                            guardarArchivo(valor)
                        }
                    }} 
                />
            </Box>
        )
    }

    return (
        <Box flexDirection="column" width={columnas} borderStyle="round" borderColor={COLORES.borde}>
            <Box flexDirection="row" justifyContent="space-between" paddingBottom={1}>
                <Text color={COLORES.titulo}>Archivo: {nombreArchivo}</Text>  
                <Text color={COLORES.secundario}>
                    Columnas: {cabecera.length} | Filas: {filas.length}
                </Text>
            </Box>

            <Box
                flexDirection="row"
                justifyContent="space-between"
                borderStyle="single"
                borderColor={COLORES.borde}
            >
                <Text color={COLORES.acento}>
                    Celda: Fila: {filaActual + 1} / Columna: {columnaActual + 1}
                </Text>
                <Text color={COLORES.acento}>
                    {nombreColumnaActual || 'columna'} = {String(valorCeldaActual || '').slice(0, 40)}
                </Text>
            </Box>

            <Box flexDirection="row" gap={separacion}  >
                <Box width={ancho}>
                    <Text bold>N°</Text>
                </Box>

                {columnasVisibles.map((nombre, indiceVisible) => {
                    const indiceColumna = columnaInicio + indiceVisible
                    const seleccionada = indiceColumna === columnaActual

                    return (
                        <Box key={indiceColumna} width={anchoColumna} backgroundColor={seleccionada ? COLORES.acento : undefined}>
                            <Text bold color={seleccionada ? COLORES.fondo : COLORES.titulo} backgroundColor={seleccionada ? COLORES.acento : undefined} wrap="truncate-end">
                                {String(nombre || '').toUpperCase()}
                            </Text>
                        </Box>
                    )
                })}
            </Box>

            <Box flexDirection="column">
                {filas.slice(filaInicio, filaInicio + filasVisiblesMax).map((fila, indiceFilaVisible) => {
                    const indiceFilaReal = filaInicio + indiceFilaVisible
                    const filaSeleccionada = indiceFilaReal === filaActual

                    return (
                        <Box key={indiceFilaReal} flexDirection="row" gap={separacion}>
                            <Box width={ancho}>
                                <Text color={filaSeleccionada ? COLORES.acento : COLORES.secundario}>{indiceFilaReal + 1}</Text>
                            </Box>

                            {columnasVisibles.map((_, indiceVisible) => {
                                const indiceColumnaReal = columnaInicio + indiceVisible
                                const valor = fila[indiceColumnaReal] ?? ''
                                const seleccionada = filaSeleccionada && indiceColumnaReal === columnaActual
                                const textoVisible = seleccionada && modoEdicion ? valorTemporal : valor

                                return (
                                    <Box
                                        key={indiceColumnaReal}
                                        width={anchoColumna}
                                        backgroundColor={seleccionada ? COLORES.acento : undefined}
                                    >
                                        <Text
                                            color={seleccionada ? COLORES.fondo : COLORES.titulo}
                                            backgroundColor={seleccionada ? COLORES.acento : undefined}
                                            wrap="truncate-end"
                                        >
                                            {textoVisible}
                                        </Text>
                                    </Box>
                                )
                            })}
                        </Box>
                    )
                })}
            </Box>
            
            {contenido ? (
                <Box paddingTop={1}>
                    <Text color={COLORES.acento}>{contenido}</Text>
                </Box>
            ) : null}

            <Box flexDirection="row" justifyContent="space-between" paddingTop={1}>
                <Text color={COLORES.secundario}>A abrir</Text>
                <Text color={COLORES.secundario}>G guardar</Text>
                <Text color={COLORES.secundario}>Enter editar</Text>
                <Text color={COLORES.secundario}>Esc salir</Text>
                <Text color={COLORES.secundario}>‹ › ordenar</Text>
            </Box>

        </Box>         
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();