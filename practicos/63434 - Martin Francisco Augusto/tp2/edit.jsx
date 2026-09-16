#!/usr/bin/env -S node --import tsx

import React, {useEffect, useState} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;
const FILAS_VISIBLES = 13;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
    celda:     '#d6d1c8',
};

function App() {
    const {exit} = useApp();
    const [cabecera, setCabecera] = useState([]);
    const [filas, setFilas] = useState([]);
    const [ruta, setRuta] = useState('');
    const [error, setError] = useState('');
    const [filaSeleccionada, setFilaSeleccionada] = useState(0);
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);
    const [filaInicio, setFilaInicio] = useState(0);
    const [abriendo, setAbriendo] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [editando, setEditando] = useState(false);
    const [textoEditado, setTextoEditado] = useState('');

    useEffect(() => {
        const archivoInicial = process.argv[2];
        if (!archivoInicial) {
            return;
        }
        abrirArchivo(archivoInicial);
    }, []);

    useEffect(() => {
        if (filaSeleccionada < filaInicio) {
            setFilaInicio(filaSeleccionada);
        }
        if (filaSeleccionada >= filaInicio + FILAS_VISIBLES) {
            setFilaInicio(filaSeleccionada - FILAS_VISIBLES + 1);
        }
    }, [filaSeleccionada, filaInicio]);

    async function abrirArchivo(nombre) {
        try {
            const texto = await readFile(nombre, 'utf8');
            const datos = parsearCsv(texto);
            setCabecera(datos.cabecera);
            setFilas(datos.filas);
            setRuta(nombre);
            setError('');
            setFilaSeleccionada(0);
            setColumnaSeleccionada(0);
            setFilaInicio(0);
            setAbriendo(false);
            setEditando(false);
        } catch {
            setError('No se pudo abrir el archivo');
        }
    }

    async function guardarArchivo(nombre) {
        try {
            await writeFile(nombre, armarCsv(cabecera, filas), 'utf8');
            setRuta(nombre);
            setError('');
            setGuardando(false);
        } catch {
            setError('No se pudo guardar el archivo');
        }
    }

    function confirmarAbrir(valor) {
        const destino = String(valor || '').trim();
        if (!destino) {
            setError('Falta el nombre del archivo');
            return;
        }
        abrirArchivo(destino);
    }

    function confirmarGuardar(valor) {
        const destino = String(valor || '').trim();
        if (!destino) {
            setError('Falta el nombre del archivo');
            return;
        }
        guardarArchivo(destino);
    }

    function confirmarEdicion(valor) {
        const nuevas = [];
        for (let i = 0; i < filas.length; i++) {
            if (i !== filaSeleccionada) {
                nuevas.push(filas[i]);
                continue;
            }
            const copia = filas[i].slice();
            copia[columnaSeleccionada] = valor;
            nuevas.push(copia);
        }
        setFilas(nuevas);
        setEditando(false);
        setTextoEditado('');
    }

    function ordenarPorColumna(descendente) {
        const copia = filas.map(fila => fila.slice());
        copia.sort((izq, der) => {
            const cmp = compararValores(izq[columnaSeleccionada], der[columnaSeleccionada]);
            return descendente ? -cmp : cmp;
        });
        setFilas(copia);
    }

    useInput((tecla, key) => {
        if (abriendo || guardando) {
            if (key.escape) {
                setAbriendo(false);
                setGuardando(false);
                setError('');
            }
            return;
        }

        if (editando) {
            if (key.escape) {
                setEditando(false);
                setTextoEditado('');
            }
            return;
        }

        if (key.escape) {
            exit();
            return;
        }

        if (key.upArrow) {
            setFilaSeleccionada(fila => Math.max(0, fila - 1));
            return;
        }
        if (key.downArrow) {
            setFilaSeleccionada(fila => Math.min(Math.max(filas.length - 1, 0), fila + 1));
            return;
        }
        if (key.leftArrow) {
            setColumnaSeleccionada(columna => Math.max(0, columna - 1));
            return;
        }
        if (key.rightArrow) {
            setColumnaSeleccionada(columna => Math.min(Math.max(cabecera.length - 1, 0), columna + 1));
            return;
        }

        if (key.return) {
            if (filas.length === 0) {
                return;
            }
            setTextoEditado(filas[filaSeleccionada][columnaSeleccionada] ?? '');
            setEditando(true);
            setError('');
            return;
        }

        if (tecla === '<') {
            ordenarPorColumna(false);
            return;
        }
        if (tecla === '>') {
            ordenarPorColumna(true);
            return;
        }

        if (tecla === 'a' || tecla === 'A') {
            setAbriendo(true);
            setGuardando(false);
            setError('');
            return;
        }
        if (tecla === 'g' || tecla === 'G') {
            setGuardando(true);
            setAbriendo(false);
            setError('');
        }
    });

    const visibles = filas.slice(filaInicio, filaInicio + FILAS_VISIBLES);
    const valorActual = editando
        ? textoEditado
        : (filas[filaSeleccionada]?.[columnaSeleccionada] ?? '');

    let atajos = (
        <Text color={COLORES.secundario}>
            <Text bold color={COLORES.acento}>A</Text> abrir ·{' '}
            <Text bold color={COLORES.acento}>G</Text> guardar ·{' '}
            <Text bold color={COLORES.acento}>Enter</Text> editar ·{' '}
            <Text bold color={COLORES.acento}>{'<'}</Text> ascendente ·{' '}
            <Text bold color={COLORES.acento}>{'>'}</Text> descendente ·{' '}
            <Text bold color={COLORES.acento}>Esc</Text> salir
        </Text>
    );
    if (abriendo) {
        atajos = (
            <Text color={COLORES.secundario}>
                <Text bold color={COLORES.acento}>Enter</Text> abrir ·{' '}
                <Text bold color={COLORES.acento}>Esc</Text> cancelar
            </Text>
        );
    } else if (guardando) {
        atajos = (
            <Text color={COLORES.secundario}>
                <Text bold color={COLORES.acento}>Enter</Text> guardar ·{' '}
                <Text bold color={COLORES.acento}>Esc</Text> cancelar
            </Text>
        );
    } else if (editando) {
        atajos = (
            <Text color={COLORES.secundario}>
                <Text bold color={COLORES.acento}>Enter</Text> confirmar ·{' '}
                <Text bold color={COLORES.acento}>Esc</Text> cancelar
            </Text>
        );
    }

    return (
        <Box
            flexDirection="column"
            width={COLUMNAS}
            height={FILAS}
            borderStyle="round"
            borderColor={COLORES.borde}
            backgroundColor={COLORES.fondo}
            paddingX={1}
        >
            <Box justifyContent="space-between">
                <Text bold color={COLORES.titulo}>
                    {ruta ? basename(ruta) : 'sin archivo'}
                </Text>
                <Text color={COLORES.secundario}>
                    {filas.length} filas · {cabecera.length} columnas
                </Text>
            </Box>

            {abriendo ? (
                <Box>
                    <Text color={COLORES.acento}>Abrir {'>'} </Text>
                    <TextInput key="abrir" defaultValue="" onSubmit={confirmarAbrir} />
                </Box>
            ) : guardando ? (
                <Box>
                    <Text color={COLORES.acento}>Guardar {'>'} </Text>
                    <TextInput
                        key="guardar"
                        defaultValue={ruta ? basename(ruta) : ''}
                        onSubmit={confirmarGuardar}
                    />
                </Box>
            ) : (
                <Box>
                    <Text color={COLORES.secundario}>Valor {'>'} </Text>
                    <Text color={COLORES.titulo}>{valorActual}</Text>
                </Box>
            )}

            {error ? (
                <Text color={COLORES.acento}>{error}</Text>
            ) : null}

            <Box marginTop={1}>
                <Box width={5}>
                    <Text bold color={COLORES.secundario}>#</Text>
                </Box>
                {cabecera.map((nombre, indice) => {
                    const esColumna = indice === columnaSeleccionada;
                    return (
                        <Box key={indice} width={anchoDeColumna(nombre)}>
                            <Text
                                bold
                                color={esColumna ? COLORES.acento : COLORES.secundario}
                                backgroundColor={esColumna ? '#000000' : undefined}
                            >
                                {nombre.toUpperCase()}
                            </Text>
                        </Box>
                    );
                })}
            </Box>

            {visibles.map((fila, indiceVisible) => {
                const numeroFila = filaInicio + indiceVisible;
                const esFila = numeroFila === filaSeleccionada;

                return (
                    <Box key={numeroFila}>
                        <Box width={5}>
                            <Text
                                color={esFila ? COLORES.acento : COLORES.secundario}
                                backgroundColor={esFila ? '#000000' : undefined}
                            >
                                {numeroFila + 1}
                            </Text>
                        </Box>
                        {fila.map((celda, indiceColumna) => {
                            const seleccionada =
                                esFila && indiceColumna === columnaSeleccionada;

                            return (
                                <Box key={indiceColumna} width={anchoDeColumna(cabecera[indiceColumna])}>
                                    {seleccionada && editando ? (
                                        <TextInput
                                            key={`celda-${numeroFila}-${indiceColumna}`}
                                            defaultValue={celda}
                                            onChange={setTextoEditado}
                                            onSubmit={confirmarEdicion}
                                        />
                                    ) : (
                                        <Text
                                            color={seleccionada ? COLORES.fondo : COLORES.titulo}
                                            backgroundColor={seleccionada ? COLORES.celda : undefined}
                                            wrap="truncate"
                                        >
                                            {celda}
                                        </Text>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                );
            })}

            <Box marginTop={1} justifyContent="space-between">
                {atajos}
                <Text color={COLORES.secundario}>
                    Fila {filaSeleccionada + 1} · Columna {columnaSeleccionada + 1}
                </Text>
            </Box>
        </Box>
    );
}

function anchoDeColumna(nombre) {
    const clave = String(nombre || '').toLowerCase();
    if (clave === 'edad') {
        return 8;
    }
    if (clave === 'salario') {
        return 12;
    }
    if (clave === 'departamento') {
        return 20;
    }
    return 14;
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();

function parsearCsv(texto) {
    if (!texto || texto.trim() === '') {
        return {cabecera: [], filas: []};
    }

    const lineas = [];
    const crudo = texto.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n');
    for (const linea of crudo) {
        if (linea.trim() !== '') {
            lineas.push(linea);
        }
    }

    if (lineas.length === 0) {
        return {cabecera: [], filas: []};
    }

    const cabecera = lineas[0].split(',').map(campo => campo.trim());
    const filas = [];
    for (let i = 1; i < lineas.length; i++) {
        filas.push(lineas[i].split(',').map(campo => campo.trim()));
    }

    return {cabecera, filas};
}

function armarCsv(cabecera, filas) {
    const lineas = [cabecera.join(',')];
    for (const fila of filas) {
        lineas.push(fila.join(','));
    }
    return lineas.join('\n') + '\n';
}

function compararValores(a, b) {
    const numA = Number(a);
    const numB = Number(b);
    if (Number.isFinite(numA) && Number.isFinite(numB)) {
        return numA - numB;
    }
    return String(a).localeCompare(String(b));
}
