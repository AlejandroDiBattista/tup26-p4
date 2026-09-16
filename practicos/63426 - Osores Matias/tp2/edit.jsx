#!/usr/bin/env -S node --import tsx

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {basename} from 'node:path';
import {readFile, writeFile} from 'node:fs/promises';
import {Box, Text, render, useApp, useInput, useWindowSize} from 'ink';
import {TextInput} from '@inkjs/ui';
import {parseCsv, serializeCsv, sortRows} from './src/csv.js';

const COLORES = {
    fondo: '#161310',
    borde: '#726b61',
    texto: '#ede7db',
    secundario: '#ada79e',
    acento: '#edbb64',
    error: '#ff7676',
};

const recortar = (valor, ancho) => {
    const texto = String(valor ?? '');
    if (ancho <= 0) return '';
    if (texto.length <= ancho) return texto;
    return ancho === 1 ? '…' : `${texto.slice(0, ancho - 1)}…`;
};

function Ayuda({modo, compacto}) {
    const Atajo = ({tecla, children}) => (
        <Text color={COLORES.secundario}>
            <Text bold color={COLORES.acento}>{tecla}</Text> {children}
        </Text>
    );

    if (modo === 'abrir') return <><Atajo tecla="Enter">abrir</Atajo><Text color={COLORES.secundario}> · </Text><Atajo tecla="Esc">cancelar</Atajo></>;
    if (modo === 'guardar') return <><Atajo tecla="Enter">guardar</Atajo><Text color={COLORES.secundario}> · </Text><Atajo tecla="Esc">cancelar</Atajo></>;
    if (modo === 'editar') return <><Atajo tecla="Enter">aceptar</Atajo><Text color={COLORES.secundario}> · </Text><Atajo tecla="Esc">cancelar</Atajo></>;

    if (compacto) return <>
        <Atajo tecla="A">abrir</Atajo><Text color={COLORES.secundario}> · </Text>
        <Atajo tecla="G">guardar</Atajo><Text color={COLORES.secundario}> · </Text>
        <Atajo tecla="↵">editar</Atajo><Text color={COLORES.secundario}> · </Text>
        <Atajo tecla="< / >">orden</Atajo><Text color={COLORES.secundario}> · </Text>
        <Atajo tecla="Esc">salir</Atajo>
    </>;

    return <>
        <Atajo tecla="A">abrir</Atajo><Text color={COLORES.secundario}> · </Text>
        <Atajo tecla="G">guardar</Atajo><Text color={COLORES.secundario}> · </Text>
        <Atajo tecla="Enter">editar</Atajo><Text color={COLORES.secundario}> · </Text>
        <Atajo tecla="<">ascendente</Atajo><Text color={COLORES.secundario}> · </Text>
        <Atajo tecla=">">descendente</Atajo><Text color={COLORES.secundario}> · </Text>
        <Atajo tecla="Esc">salir</Atajo>
    </>;
}

function App({archivoInicial}) {
    const {exit} = useApp();
    const {width = 80, height = 24} = useWindowSize();
    const [cabecera, setCabecera] = useState([]);
    const [filas, setFilas] = useState([]);
    const [archivo, setArchivo] = useState('');
    const [modo, setModo] = useState(archivoInicial ? 'cargando' : 'abrir');
    const [entradaInicial, setEntradaInicial] = useState(archivoInicial ?? '');
    const [seleccion, setSeleccion] = useState({fila: 0, columna: 0});
    const seleccionRef = useRef(seleccion);
    const [desplazamientoFila, setDesplazamientoFila] = useState(0);
    const [desplazamientoColumna, setDesplazamientoColumna] = useState(0);
    const [mensaje, setMensaje] = useState('');
    const [esError, setEsError] = useState(false);

    const cargar = async ruta => {
        const nombre = ruta.trim();
        if (!nombre) {
            setMensaje('Escribí el nombre de un archivo CSV.');
            setEsError(true);
            return false;
        }

        try {
            const contenido = await readFile(nombre, 'utf8');
            const csv = parseCsv(contenido);
            setCabecera(csv.cabecera);
            setFilas(csv.filas);
            setArchivo(nombre);
            seleccionRef.current = {fila: 0, columna: 0};
            setSeleccion(seleccionRef.current);
            setDesplazamientoFila(0);
            setDesplazamientoColumna(0);
            setMensaje(`Se abrió ${basename(nombre)}.`);
            setEsError(false);
            setModo('tabla');
            return true;
        } catch (error) {
            setMensaje(`No se pudo abrir el archivo: ${error.message}`);
            setEsError(true);
            setModo('abrir');
            return false;
        }
    };

    const guardar = async ruta => {
        const nombre = ruta.trim();
        if (!nombre) {
            setMensaje('Escribí el nombre del archivo de destino.');
            setEsError(true);
            return;
        }

        try {
            await writeFile(nombre, serializeCsv(cabecera, filas), 'utf8');
            setArchivo(nombre);
            setMensaje(`Se guardó ${basename(nombre)}.`);
            setEsError(false);
            setModo('tabla');
        } catch (error) {
            setMensaje(`No se pudo guardar el archivo: ${error.message}`);
            setEsError(true);
            setModo('guardar');
        }
    };

    useEffect(() => {
        if (archivoInicial) void cargar(archivoInicial);
    }, []);

    const altoInterior = Math.max(8, height - 2);
    const filasVisibles = Math.max(1, altoInterior - 7);
    const anchoInterior = Math.max(20, width - 6);
    const anchoNumero = Math.max(3, String(filas.length).length + 1);
    const anchos = useMemo(() => cabecera.map((titulo, indice) => {
        let mayor = String(titulo).length;
        for (const fila of filas) mayor = Math.max(mayor, String(fila[indice] ?? '').length);
        return Math.min(Math.max(mayor, 5), 24);
    }), [cabecera, filas]);

    const columnasVisibles = useMemo(() => {
        const resultado = [];
        let usado = anchoNumero + 2;
        for (let indice = desplazamientoColumna; indice < cabecera.length; indice += 1) {
            const necesario = anchos[indice] + 2;
            if (resultado.length > 0 && usado + necesario > anchoInterior) break;
            resultado.push(indice);
            usado += necesario;
        }
        return resultado;
    }, [anchos, anchoInterior, anchoNumero, cabecera.length, desplazamientoColumna]);

    useEffect(() => {
        if (filas.length === 0) return;
        if (seleccion.fila < desplazamientoFila) setDesplazamientoFila(seleccion.fila);
        else if (seleccion.fila >= desplazamientoFila + filasVisibles) setDesplazamientoFila(seleccion.fila - filasVisibles + 1);
    }, [seleccion.fila, filasVisibles, filas.length, modo, desplazamientoFila]);

    useEffect(() => {
        if (cabecera.length === 0) return;
        const ultimaVisible = columnasVisibles.at(-1) ?? desplazamientoColumna;
        if (seleccion.columna < desplazamientoColumna) setDesplazamientoColumna(seleccion.columna);
        else if (seleccion.columna > ultimaVisible) setDesplazamientoColumna(seleccion.columna);
    }, [seleccion.columna, modo, cabecera.length, columnasVisibles, desplazamientoColumna]);

    useInput((input, key) => {
        if (modo === 'cargando') {
            if (key.escape) exit();
            return;
        }

        if (modo !== 'tabla') {
            if (key.escape) {
                if (cabecera.length > 0) {
                    setModo('tabla');
                    setMensaje('');
                } else exit();
            }
            return;
        }

        if (key.escape) return exit();
        if (input.toLowerCase() === 'a') {
            setEntradaInicial('');
            setMensaje('');
            return setModo('abrir');
        }
        if (input.toLowerCase() === 'g') {
            setEntradaInicial(archivo);
            setMensaje('');
            return setModo('guardar');
        }
        if (key.return && filas.length > 0) {
            const actual = seleccionRef.current;
            setEntradaInicial(filas[actual.fila][actual.columna]);
            setMensaje('');
            return setModo('editar');
        }
        if ((input === '<' || input === '>') && filas.length > 0) {
            const ascendente = input === '<';
            const columna = seleccionRef.current.columna;
            setFilas(actuales => sortRows(actuales, columna, ascendente));
            seleccionRef.current = {...seleccionRef.current, fila: 0};
            setSeleccion(seleccionRef.current);
            setMensaje(`Orden ${ascendente ? 'ascendente' : 'descendente'} por ${cabecera[columna]}.`);
            setEsError(false);
            return;
        }

        const actual = seleccionRef.current;
        seleccionRef.current = {
            fila: key.upArrow ? Math.max(0, actual.fila - 1) : key.downArrow ? Math.min(filas.length - 1, actual.fila + 1) : actual.fila,
            columna: key.leftArrow ? Math.max(0, actual.columna - 1) : key.rightArrow ? Math.min(cabecera.length - 1, actual.columna + 1) : actual.columna,
        };
        setSeleccion(seleccionRef.current);
    });

    const confirmarEdicion = valor => {
        const actual = seleccionRef.current;
        setFilas(actuales => actuales.map((fila, indice) => indice === actual.fila
            ? fila.map((celda, columna) => columna === actual.columna ? valor : celda)
            : fila));
        setMensaje('Celda modificada. Recordá guardar los cambios.');
        setEsError(false);
        setModo('tabla');
    };

    const valorSeleccionado = filas[seleccion.fila]?.[seleccion.columna] ?? '';
    const inicioFilas = Math.min(desplazamientoFila, Math.max(0, filas.length - filasVisibles));
    const titulo = archivo ? basename(archivo) : 'Editor CSV';
    const etiquetaEntrada = modo === 'abrir' ? 'Abrir' : modo === 'guardar' ? 'Guardar' : 'Editar';

    return (
        <Box width={width} height={height} justifyContent="center" alignItems="center">
            <Box width={Math.max(20, width - 2)} height={Math.max(8, height - 1)} paddingX={1} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
                <Box justifyContent="space-between">
                    <Text bold color={COLORES.texto}>{titulo}</Text>
                    {cabecera.length > 0 && <Text color={COLORES.secundario}>{filas.length} filas · {cabecera.length} columnas</Text>}
                </Box>

                <Box height={2} alignItems="flex-end">
                    {modo === 'cargando' ? <Text color={COLORES.secundario}>Abriendo archivo…</Text> : modo === 'tabla' ? (
                        <Text color={COLORES.secundario}>Valor › <Text bold color={COLORES.texto}>{valorSeleccionado || '∅'}</Text></Text>
                    ) : (
                        <Box>
                            <Text bold color={COLORES.acento}>{etiquetaEntrada} › </Text>
                            <TextInput
                                key={`${modo}-${entradaInicial}`}
                                defaultValue={entradaInicial}
                                placeholder={modo === 'editar' ? 'Nuevo valor' : 'archivo.csv'}
                                onSubmit={valor => modo === 'abrir' ? void cargar(valor) : modo === 'guardar' ? void guardar(valor) : confirmarEdicion(valor)}
                            />
                        </Box>
                    )}
                </Box>

                {mensaje && <Box height={1}><Text color={esError ? COLORES.error : COLORES.secundario}>{recortar(mensaje, anchoInterior)}</Text></Box>}
                {!mensaje && <Box height={1} />}

                {cabecera.length > 0 && <Box flexDirection="column" flexGrow={1} overflow="hidden">
                    <Box>
                        <Text bold color={COLORES.secundario}>{String('#').padStart(anchoNumero)}  </Text>
                        {columnasVisibles.map(indice => <Text key={indice} bold color={indice === seleccion.columna ? COLORES.acento : COLORES.secundario}>{recortar(cabecera[indice].toUpperCase(), anchos[indice]).padEnd(anchos[indice])}  </Text>)}
                    </Box>
                    {filas.slice(inicioFilas, inicioFilas + filasVisibles).map((fila, relativo) => {
                        const indiceFila = inicioFilas + relativo;
                        return <Box key={indiceFila}>
                            <Text bold={indiceFila === seleccion.fila} color={indiceFila === seleccion.fila ? COLORES.acento : COLORES.texto}>{String(indiceFila + 1).padStart(anchoNumero)}  </Text>
                            {columnasVisibles.map((indiceColumna, posicion) => {
                                const elegida = indiceFila === seleccion.fila && indiceColumna === seleccion.columna;
                                return <React.Fragment key={indiceColumna}>
                                    <Text bold={elegida} color={elegida ? COLORES.fondo : COLORES.texto} backgroundColor={elegida ? COLORES.texto : undefined}>{recortar(fila[indiceColumna], anchos[indiceColumna]).padEnd(anchos[indiceColumna])}</Text>
                                    {posicion < columnasVisibles.length - 1 && <Text>  </Text>}
                                </React.Fragment>;
                            })}
                        </Box>;
                    })}
                </Box>}
                {cabecera.length === 0 && <Box flexGrow={1} justifyContent="center" alignItems="center"><Text color={COLORES.secundario}>Abrí un archivo CSV para comenzar</Text></Box>}

                <Box justifyContent="space-between">
                    <Box><Ayuda modo={modo} compacto={width < 115} /></Box>
                    {cabecera.length > 0 && <Text color={COLORES.secundario}>{width < 115 ? `F ${filas.length ? seleccion.fila + 1 : 0} · C ${seleccion.columna + 1}` : `Fila ${filas.length ? seleccion.fila + 1 : 0} · Columna ${seleccion.columna + 1}`}</Text>}
                </Box>
            </Box>
        </Box>
    );
}

const archivoInicial = process.argv[2];
const app = render(<App archivoInicial={archivoInicial} />);
await app.waitUntilExit();
