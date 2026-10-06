#!/usr/bin/env -S node --import tsx

import React, {useState, useEffect} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

const ANCHO_TERM = process.stdout.columns || 80
const ALTO_TERM  = process.stdout.rows || 24

const PALETA = {
    fondo: '#12181c',
    linea: '#4d5a63',
    texto: '#e6e2d3',
    gris:  '#8f9a9e',
    marca: '#7fb4ca',
}

function leerCSV(texto) {
    let renglones = texto.split(/\r\n|\n/)
    renglones = renglones.filter((r) => r.length > 0)
    let encabezado = renglones[0].split(',')
    let filas = []
    for (let i = 1; i < renglones.length; i++) {
        filas.push(renglones[i].split(','))
    }
    return {encabezado: encabezado, filas: filas}
}

function armarCSV(datos) {
    let renglones = [datos.encabezado.join(',')]
    for (let i = 0; i < datos.filas.length; i++) {
        renglones.push(datos.filas[i].join(','))
    }
    return renglones.join('\n') + '\n'
}

function calcularAnchos(datos) {
    let anchos = []
    for (let col = 0; col < datos.encabezado.length; col++) {
        let max = datos.encabezado[col].length
        for (let fila = 0; fila < datos.filas.length; fila++) {
            let valor = datos.filas[fila][col] || ''
            if (valor.length > max) max = valor.length
        }
        anchos.push(max)
    }
    return anchos
}

function App({archivoInicial}) {
    const {exit} = useApp()

    let [nombreArchivo, setNombreArchivo] = useState(archivoInicial || null)
    let [datos, setDatos] = useState(null)
    let [filaActual, setFilaActual] = useState(0)
    let [columnaActual, setColumnaActual] = useState(0)
    let [pantalla, setPantalla] = useState(archivoInicial ? 'cargando' : 'abrir')
    let [mensajeError, setMensajeError] = useState(null)

    useEffect(() => {
        if (archivoInicial) {
            abrirArchivo(archivoInicial)
        }
    }, [])

    async function abrirArchivo(nombre) {
        try {
            let texto = await readFile(nombre, 'utf8')
            setDatos(leerCSV(texto))
            setNombreArchivo(nombre)
            setFilaActual(0)
            setColumnaActual(0)
            setPantalla('normal')
            setMensajeError(null)
        } catch (e) {
            setMensajeError('No pude abrir "' + nombre + '"')
            setPantalla('abrir')
        }
    }

    async function guardarArchivo(nombre) {
        try {
            await writeFile(nombre, armarCSV(datos), 'utf8')
            setNombreArchivo(nombre)
            setPantalla('normal')
            setMensajeError(null)
        } catch (e) {
            setMensajeError('No pude guardar "' + nombre + '"')
            setPantalla('guardar')
        }
    }

    function cambiarValor(valorNuevo) {
        let filas = []
        for (let i = 0; i < datos.filas.length; i++) {
            filas.push(datos.filas[i].slice())
        }
        filas[filaActual][columnaActual] = valorNuevo
        setDatos({encabezado: datos.encabezado, filas: filas})
        setPantalla('normal')
    }

    function ordenarPor(sentido) {
        let filas = datos.filas.slice()
        filas.sort((fila1, fila2) => {
            let v1 = fila1[columnaActual]
            let v2 = fila2[columnaActual]
            let n1 = Number(v1)
            let n2 = Number(v2)
            let resultado
            if (v1 != '' && v2 != '' && !isNaN(n1) && !isNaN(n2)) {
                resultado = n1 - n2
            } else {
                resultado = v1.localeCompare(v2)
            }
            return sentido == 'asc' ? resultado : resultado * -1
        })
        setDatos({encabezado: datos.encabezado, filas: filas})
        setFilaActual(0)
    }

    useInput((tecla, key) => {
        if (pantalla != 'normal') {
            if (key.escape) {
                if (datos) {
                    setPantalla('normal')
                    setMensajeError(null)
                } else {
                    exit()
                }
            }
            return
        }

        if (key.escape) {
            exit()
            return
        }
        if (!datos) return

        if (tecla == 'a' || tecla == 'A') {
            setPantalla('abrir')
        } else if (tecla == 'g' || tecla == 'G') {
            setPantalla('guardar')
        } else if (key.return) {
            setPantalla('editar')
        } else if (tecla == '<') {
            ordenarPor('asc')
        } else if (tecla == '>') {
            ordenarPor('desc')
        } else if (key.upArrow) {
            setFilaActual((f) => f > 0 ? f - 1 : 0)
        } else if (key.downArrow) {
            setFilaActual((f) => f < datos.filas.length - 1 ? f + 1 : f)
        } else if (key.leftArrow) {
            setColumnaActual((c) => c > 0 ? c - 1 : 0)
        } else if (key.rightArrow) {
            setColumnaActual((c) => c < datos.encabezado.length - 1 ? c + 1 : c)
        }
    })

    let cantidadFilas = ALTO_TERM - 9
    if (cantidadFilas < 3) cantidadFilas = 3
    let desde = 0
    if (datos && filaActual >= cantidadFilas) {
        desde = filaActual - cantidadFilas + 1
    }

    let anchos = datos ? calcularAnchos(datos) : []
    let esNumerica = []
    if (datos) {
        for (let col = 0; col < datos.encabezado.length; col++) {
            let numerica = true
            let fila = 0
            while (fila < datos.filas.length) {
                let valor = datos.filas[fila][col]
                if (valor == '' || isNaN(Number(valor))) {
                    numerica = false
                    break
                }
                fila = fila + 1
            }
            esNumerica.push(numerica)
        }
    }
    let filasVisibles = datos ? datos.filas.slice(desde, desde + cantidadFilas) : []
    let anchoIndice = datos ? String(datos.filas.length).length : 1

    return (
        <Box width={ANCHO_TERM} flexDirection="column" padding={1}>
            <Box justifyContent="space-between">
                <Text bold color={PALETA.texto}>{nombreArchivo ? basename(nombreArchivo) : 'Editor CSV'}</Text>
                {datos && (
                    <Text color={PALETA.gris}>{datos.filas.length} filas · {datos.encabezado.length} columnas</Text>
                )}
            </Box>

            <Box marginTop={1}>
                {pantalla == 'cargando' && (
                    <Text color={PALETA.gris}>Abriendo {archivoInicial}...</Text>
                )}
                {pantalla == 'abrir' && (
                    <Box>
                        <Text color={PALETA.marca} bold>Abrir {'>'} </Text>
                        <TextInput placeholder="nombre del archivo" onSubmit={abrirArchivo} />
                    </Box>
                )}
                {pantalla == 'guardar' && (
                    <Box>
                        <Text color={PALETA.marca} bold>Guardar {'>'} </Text>
                        <TextInput defaultValue={nombreArchivo || ''} onSubmit={guardarArchivo} />
                    </Box>
                )}
                {pantalla == 'editar' && (
                    <Box>
                        <Text color={PALETA.marca} bold>Editar {'>'} </Text>
                        <TextInput defaultValue={datos.filas[filaActual][columnaActual]} onSubmit={cambiarValor} />
                    </Box>
                )}
                {pantalla == 'normal' && datos && (
                    <Text color={PALETA.gris}>Valor {'>'} <Text bold color={PALETA.texto}>{datos.filas[filaActual][columnaActual]}</Text></Text>
                )}
            </Box>

            {mensajeError && (
                <Box marginTop={1}>
                    <Text color="red">{mensajeError}</Text>
                </Box>
            )}

            {datos && (
                <Box marginTop={1} flexDirection="column">
                    <Box>
                        <Text color={PALETA.gris}>{' '.repeat(anchoIndice + 1)}</Text>
                        {datos.encabezado.map((titulo, col) => {
                            let texto = esNumerica[col] ? titulo.toUpperCase().padStart(anchos[col]) : titulo.toUpperCase().padEnd(anchos[col])
                            return (
                                <Text
                                    key={col}
                                    bold
                                    color={col == columnaActual ? PALETA.fondo : PALETA.marca}
                                    backgroundColor={col == columnaActual ? PALETA.marca : undefined}
                                >
                                    {' ' + texto + ' '}
                                </Text>
                            )
                        })}
                    </Box>
                    {filasVisibles.map((fila, i) => {
                        let numeroFila = desde + i
                        let filaMarcada = numeroFila == filaActual
                        return (
                            <Box key={numeroFila}>
                                <Text
                                    color={filaMarcada ? PALETA.fondo : PALETA.gris}
                                    backgroundColor={filaMarcada ? PALETA.marca : undefined}
                                >
                                    {String(numeroFila + 1).padStart(anchoIndice) + ' '}
                                </Text>
                                {fila.map((valor, col) => {
                                    let celdaMarcada = filaMarcada && col == columnaActual
                                    let texto = esNumerica[col] ? valor.padStart(anchos[col]) : valor.padEnd(anchos[col])
                                    return (
                                        <Text
                                            key={col}
                                            color={celdaMarcada ? PALETA.fondo : PALETA.texto}
                                            backgroundColor={celdaMarcada ? '#f0f0f0' : undefined}
                                        >
                                            {' ' + texto + ' '}
                                        </Text>
                                    )
                                })}
                            </Box>
                        )
                    })}
                </Box>
            )}

            <Box marginTop={1} justifyContent="space-between">
                {pantalla == 'normal' ? (
                    <Text color={PALETA.gris}>
                        <Text bold color={PALETA.marca}>A</Text> abrir  <Text bold color={PALETA.marca}>G</Text> guardar  <Text bold color={PALETA.marca}>Enter</Text> editar  <Text bold color={PALETA.marca}>{'<'}</Text> asc  <Text bold color={PALETA.marca}>{'>'}</Text> desc  <Text bold color={PALETA.marca}>Esc</Text> salir
                    </Text>
                ) : (
                    <Text color={PALETA.gris}>
                        <Text bold color={PALETA.marca}>Enter</Text> confirmar  <Text bold color={PALETA.marca}>Esc</Text> cancelar
                    </Text>
                )}
                {datos && pantalla == 'normal' && (
                    <Text color={PALETA.gris}>Fila {filaActual + 1} · Columna {columnaActual + 1}</Text>
                )}
            </Box>
        </Box>
    )
}

const archivoInicial = process.argv[2]
const app = render(<App archivoInicial={archivoInicial} />)
await app.waitUntilExit()
console.clear()