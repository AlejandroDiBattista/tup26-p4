#!/usr/bin/env -S node --import tsx

import React, {useEffect, useState} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {basename} from 'node:path';
import {leerCsv} from './csv.js';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
    error:     '#e06c5f',
    resaltado: '#000000',
    seleccion: '#e5e5e5',
};

const DATOS_VACIOS = {cabecera: [], filas: []};
const CODIGO_ERROR_ARCHIVO_INEXISTENTE = 'ENOENT';
const CONFIGURACION_REGIONAL = 'es-AR';
const TITULO_COLUMNA_NUMERO = '#';
const CANTIDAD_FILAS_VISIBLES = Math.max(1, FILAS - 9);

const DESPLAZAMIENTOS_POR_FLECHA = {
    upArrow:    {filas: -1, columnas: 0},
    downArrow:  {filas: 1,  columnas: 0},
    leftArrow:  {filas: 0,  columnas: -1},
    rightArrow: {filas: 0,  columnas: 1},
};

const SENTIDOS_DE_ORDEN_POR_TECLA = {
    '<': 1,
    '>': -1,
};

const ATAJOS_DE_NAVEGACION = [
    {tecla: '<', accion: 'ascendente'},
    {tecla: '>', accion: 'descendente'},
    {tecla: 'Esc', accion: 'salir'},
];

function describirError(error) {
    if (error.code === CODIGO_ERROR_ARCHIVO_INEXISTENTE) {
        return 'el archivo no existe';
    }
    return error.message;
}

function esNumero(valor) {
    return valor.trim() !== '' && Number.isFinite(Number(valor));
}

function esColumnaNumerica(filas, indiceColumna) {
    return filas.length > 0 && filas.every(fila => esNumero(fila[indiceColumna]));
}

function formatearValor(valor, esNumerica) {
    return esNumerica ? Number(valor).toLocaleString(CONFIGURACION_REGIONAL) : valor;
}

function compararValores(valorA, valorB, esNumerica) {
    if (esNumerica) {
        return Number(valorA) - Number(valorB);
    }
    return valorA.localeCompare(valorB, CONFIGURACION_REGIONAL);
}

function ordenarFilas(filas, indiceColumna, sentido) {
    const esNumerica = esColumnaNumerica(filas, indiceColumna);
    return filas.toSorted((filaA, filaB) =>
        sentido * compararValores(filaA[indiceColumna], filaB[indiceColumna], esNumerica)
    );
}

function limitarAlRango(valor, minimo, maximo) {
    return Math.min(Math.max(valor, minimo), maximo);
}

function calcularPrimeraFilaVisible(primeraFilaVisible, filaSeleccionada) {
    if (filaSeleccionada < primeraFilaVisible) {
        return filaSeleccionada;
    }
    if (filaSeleccionada >= primeraFilaVisible + CANTIDAD_FILAS_VISIBLES) {
        return filaSeleccionada - CANTIDAD_FILAS_VISIBLES + 1;
    }
    return primeraFilaVisible;
}

function alinearTexto(texto, ancho, alineadoALaDerecha) {
    return alineadoALaDerecha ? texto.padStart(ancho) : texto.padEnd(ancho);
}

function describirColumnas({cabecera, filas}) {
    return cabecera.map((titulo, indiceColumna) => {
        const esNumerica = esColumnaNumerica(filas, indiceColumna);
        const valoresFormateados = filas.map(fila => formatearValor(fila[indiceColumna], esNumerica));
        const ancho = Math.max(titulo.length, ...valoresFormateados.map(valor => valor.length));
        return {titulo: titulo.toUpperCase(), esNumerica, ancho};
    });
}

function Tabla({datos, filaSeleccionada, columnaSeleccionada, primeraFilaVisible}) {
    const columnas = describirColumnas(datos);
    const anchoColumnaNumero = Math.max(TITULO_COLUMNA_NUMERO.length, String(datos.filas.length).length);
    const filasVisibles = datos.filas.slice(primeraFilaVisible, primeraFilaVisible + CANTIDAD_FILAS_VISIBLES);

    return (
        <Box flexDirection="column" marginTop={1} overflow="hidden">
            <Box columnGap={2}>
                <Text bold color={COLORES.secundario}>{TITULO_COLUMNA_NUMERO.padStart(anchoColumnaNumero)}</Text>
                {columnas.map((columna, indiceColumna) => {
                    const estaSeleccionada = indiceColumna === columnaSeleccionada;
                    return (
                        <Text
                            key={columna.titulo}
                            bold
                            color={estaSeleccionada ? COLORES.acento : COLORES.secundario}
                            backgroundColor={estaSeleccionada ? COLORES.resaltado : COLORES.fondo}
                        >
                            {alinearTexto(columna.titulo, columna.ancho, columna.esNumerica)}
                        </Text>
                    );
                })}
            </Box>
            {filasVisibles.map((fila, indiceVisible) => {
                const indiceFila = primeraFilaVisible + indiceVisible;
                const esFilaSeleccionada = indiceFila === filaSeleccionada;
                return (
                    <Box key={indiceFila} columnGap={2}>
                        <Text
                            bold={esFilaSeleccionada}
                            color={esFilaSeleccionada ? COLORES.acento : COLORES.secundario}
                            backgroundColor={esFilaSeleccionada ? COLORES.resaltado : COLORES.fondo}
                        >
                            {String(indiceFila + 1).padStart(anchoColumnaNumero)}
                        </Text>
                        {columnas.map((columna, indiceColumna) => {
                            const esCeldaSeleccionada = esFilaSeleccionada && indiceColumna === columnaSeleccionada;
                            return (
                                <Text
                                    key={columna.titulo}
                                    bold={esCeldaSeleccionada}
                                    color={esCeldaSeleccionada ? COLORES.fondo : COLORES.titulo}
                                    backgroundColor={esCeldaSeleccionada ? COLORES.seleccion : COLORES.fondo}
                                >
                                    {alinearTexto(formatearValor(fila[indiceColumna], columna.esNumerica), columna.ancho, columna.esNumerica)}
                                </Text>
                            );
                        })}
                    </Box>
                );
            })}
        </Box>
    );
}

function Encabezado({rutaArchivo, cantidadFilas, cantidadColumnas}) {
    return (
        <Box justifyContent="space-between">
            <Text bold color={COLORES.titulo}>{rutaArchivo ? basename(rutaArchivo) : 'Sin archivo'}</Text>
            <Text color={COLORES.secundario}>{cantidadFilas} filas · {cantidadColumnas} columnas</Text>
        </Box>
    );
}

function LineaDeMensaje({mensajeError, hayDatos, valorSeleccionado}) {
    if (mensajeError) {
        return <Text color={COLORES.error}>Error › {mensajeError}</Text>;
    }
    if (!hayDatos) {
        return <Text> </Text>;
    }
    return <Text color={COLORES.secundario}>Valor › <Text color={COLORES.titulo}>{valorSeleccionado}</Text></Text>;
}

function Atajo({tecla, accion}) {
    return (
        <Text color={COLORES.secundario}><Text bold color={COLORES.acento}>{tecla}</Text> {accion}</Text>
    );
}

function ListaDeAtajos({atajos}) {
    return (
        <Text>
            {atajos.map((atajo, indiceAtajo) => (
                <Text key={atajo.tecla}>
                    {indiceAtajo > 0 && <Text color={COLORES.secundario}> · </Text>}
                    <Atajo tecla={atajo.tecla} accion={atajo.accion} />
                </Text>
            ))}
        </Text>
    );
}

function Posicion({hayDatos, filaSeleccionada, columnaSeleccionada}) {
    if (!hayDatos) {
        return null;
    }
    return <Text color={COLORES.secundario}>Fila {filaSeleccionada + 1} · Columna {columnaSeleccionada + 1}</Text>;
}

function App({rutaInicial}) {
    const {exit} = useApp();
    const [rutaArchivo, setRutaArchivo] = useState('');
    const [datos, setDatos] = useState(DATOS_VACIOS);
    const [mensajeError, setMensajeError] = useState('');
    const [filaSeleccionada, setFilaSeleccionada] = useState(0);
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);
    const [primeraFilaVisible, setPrimeraFilaVisible] = useState(0);

    const hayDatos = datos.filas.length > 0;
    const valorSeleccionado = hayDatos ? datos.filas[filaSeleccionada][columnaSeleccionada] : '';

    async function abrirArchivo(ruta) {
        try {
            setDatos(await leerCsv(ruta));
            setRutaArchivo(ruta);
            setMensajeError('');
            setFilaSeleccionada(0);
            setColumnaSeleccionada(0);
            setPrimeraFilaVisible(0);
        } catch (error) {
            setMensajeError(`No se pudo abrir "${ruta}": ${describirError(error)}`);
        }
    }

    function moverSeleccion(desplazamientoFilas, desplazamientoColumnas) {
        const nuevaFila = limitarAlRango(filaSeleccionada + desplazamientoFilas, 0, datos.filas.length - 1);
        const nuevaColumna = limitarAlRango(columnaSeleccionada + desplazamientoColumnas, 0, datos.cabecera.length - 1);
        setFilaSeleccionada(nuevaFila);
        setColumnaSeleccionada(nuevaColumna);
        setPrimeraFilaVisible(calcularPrimeraFilaVisible(primeraFilaVisible, nuevaFila));
    }

    function ordenarPorColumnaSeleccionada(sentido) {
        setDatos({...datos, filas: ordenarFilas(datos.filas, columnaSeleccionada, sentido)});
    }

    useEffect(() => {
        if (rutaInicial) {
            abrirArchivo(rutaInicial);
        }
    }, [rutaInicial]);

    useInput((tecla, key) => {
        if (key.escape) {
            exit();
            return;
        }
        if (!hayDatos) {
            return;
        }
        const flechaPresionada = Object.keys(DESPLAZAMIENTOS_POR_FLECHA).find(flecha => key[flecha]);
        if (flechaPresionada) {
            const desplazamiento = DESPLAZAMIENTOS_POR_FLECHA[flechaPresionada];
            moverSeleccion(desplazamiento.filas, desplazamiento.columnas);
            return;
        }
        if (tecla in SENTIDOS_DE_ORDEN_POR_TECLA) {
            ordenarPorColumnaSeleccionada(SENTIDOS_DE_ORDEN_POR_TECLA[tecla]);
        }
    });

    return (
        <Box width={COLUMNAS} height={FILAS} flexDirection="column" paddingX={1} borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
            <Encabezado rutaArchivo={rutaArchivo} cantidadFilas={datos.filas.length} cantidadColumnas={datos.cabecera.length} />
            <Box marginTop={1}>
                <LineaDeMensaje mensajeError={mensajeError} hayDatos={hayDatos} valorSeleccionado={valorSeleccionado} />
            </Box>
            <Tabla
                datos={datos}
                filaSeleccionada={filaSeleccionada}
                columnaSeleccionada={columnaSeleccionada}
                primeraFilaVisible={primeraFilaVisible}
            />
            <Box flexGrow={1} />
            <Box justifyContent="space-between">
                <ListaDeAtajos atajos={ATAJOS_DE_NAVEGACION} />
                <Posicion hayDatos={hayDatos} filaSeleccionada={filaSeleccionada} columnaSeleccionada={columnaSeleccionada} />
            </Box>
        </Box>
    );
}

const app = render(<App rutaInicial={process.argv[2]} />);
await app.waitUntilExit();
console.clear();
