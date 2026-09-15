#!/usr/bin/env -S node --import tsx

import React from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile, writeFile } from 'node:fs/promises';
import { TextInput } from '@inkjs/ui';
import { basename } from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS = process.stdout.rows || 24;

const ANCHO_CELDA = 15;
const FILAS_VISIBLES = FILAS - 8;

const COLORES = {
    fondo: '#161310',
    borde: '#726b61',
    titulo: '#ede7db',
    secundario: '#ada79e',
    acento: '#edbb64',
};

function App() {
    const { exit } = useApp();
    const [datos, setDatos] = React.useState(null);
    const [nombreArchivo, setNombreArchivo] = React.useState('');
    const [fila, setFila] = React.useState(0);
    const [columna, setColumna] = React.useState(0);
    const [inicio, setInicio] = React.useState(0);
    const [modo, setModo] = React.useState('inicio');
    const [valorInput, setValorInput] = React.useState('');
    const [mensaje, setMensaje] = React.useState('');

    async function abrirArchivo(nombre) {
        try {
            const texto = await readFile(nombre, 'utf-8');
            const lineas = texto.trim().split('\n')


            const cabecera = lineas[0].split(',');
            const filas = lineas.slice(1).map(linea => linea.split(','));

            if (filas.some(unaFila => unaFila.length !== cabecera.length)) {
                throw new Error('Error: El archivo CSV tiene filas incompletas');
            }

            setDatos({ cabecera: cabecera, filas });
            setNombreArchivo(nombre);
            setFila(0);
            setColumna(0);
            setInicio(0);
            setMensaje('');
            setModo('tabla');
            return true;
        } catch (error) {
            setMensaje(`No se pudo abrir el archivo: ${error.message}`);
            return false;
        }
    }

    React.useEffect(() => {
        if (process.argv[2]) {
            abrirArchivo(process.argv[2]);
        }
    }, []);

    function ordenar(descendente) {
        const filasOrdenadas = [...datos.filas];

        filasOrdenadas.sort((a, b) => {
            const numeroA = parseFloat(a[columna]);
            const numeroB = parseFloat(b[columna]);
            let resultado;

            if (!isNaN(numeroA) && !isNaN(numeroB)) {
                resultado = numeroA - numeroB;
            } else {
                resultado = a[columna].localeCompare(b[columna]);
            }

            return descendente ? -resultado : resultado;
        });

        setDatos({cabecera: datos.cabecera, filas: filasOrdenadas});
    }

    async function enviarInput(valor) {
        if (modo === 'abrir') {
            await abrirArchivo(valor);
        }

        if (modo === 'guardar') {
            try {
                const texto = [datos.cabecera, ...datos.filas]
                    .map(unaFila => unaFila.join(','))
                    .join('\n');

                await writeFile(valor, texto, 'utf8');
                setNombreArchivo(valor);
                setMensaje('Archivo guardado.');
                setModo('tabla');
            } catch (error) {
                setMensaje(`No se pudo guardar el archivo: ${error.message}`);
            }
        }

        if (modo === 'editar') {
            const filasNuevas = [...datos.filas];
            filasNuevas[fila] = [...filasNuevas[fila]];
            filasNuevas[fila][columna] = valor;
            setDatos({cabecera: datos.cabecera, filas: filasNuevas});
            setModo('tabla');
        }
    }

    useInput((tecla, key) => {
        if (modo === 'abrir' || modo === 'guardar' || modo === 'editar') {
            if (key.escape) {
                setModo(datos ? 'tabla' : 'inicio');
                setMensaje('');
            }
            return;
        }

        if (key.escape) {
            exit();
            return;
        }

        if (tecla.toLowerCase() === 'a') {
            setModo('abrir');
            setValorInput('');
            setMensaje('');
            return;
        }

        if (!datos) return;

        if (tecla.toLowerCase() === 'g') {
            setModo('guardar');
            setValorInput(nombreArchivo);
            setMensaje('');
            return;
        }

        if (key.return && datos.filas.length > 0) {
            setModo('editar');
            setValorInput(datos.filas[fila][columna]);
        }

        if (key.upArrow) {
            const nuevaFila = Math.max(0, fila - 1);
            setFila(nuevaFila);
            if (nuevaFila < inicio) setInicio(nuevaFila);
        }

        if (key.downArrow) {
            const nuevaFila = Math.min(datos.filas.length - 1, fila + 1);
            setFila(nuevaFila);
            if (nuevaFila >= inicio + FILAS_VISIBLES) {
                setInicio(nuevaFila - FILAS_VISIBLES + 1);
            }
        }

        if (key.leftArrow) setColumna(Math.max(0, columna - 1));
        if (key.rightArrow) setColumna(Math.min(datos.cabecera.length - 1, columna + 1));

        if (tecla === '<') ordenar(false);
        if (tecla === '>') ordenar(true);
    });
    function textoCelda(valor) {
        const texto = String(valor);
        return texto.length > ANCHO_CELDA - 1 ? `${texto.slice(0, ANCHO_CELDA - 2)}…` : texto;
    }

    if (!datos) {
        return (
            <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
                <Box width={45} height={10} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo} paddingX={1}>
                    <Box flexGrow={1} justifyContent="center" alignItems="center">
                        <Text bold color={COLORES.titulo}>Editor CSV</Text>
                    </Box>
                    {modo === 'abrir' ? (
                        <Box><Text color={COLORES.acento}>Abrir: </Text><TextInput key="abrir" defaultValue="" onChange={setValorInput} onSubmit={enviarInput} placeholder="archivo.csv" /></Box>
                    ) : (
                        <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> A</Text> abrir · <Text bold color={COLORES.acento}> Esc</Text> salir</Text>
                    )}
                    {mensaje && <Text color="red">{mensaje}</Text>}
                </Box>
            </Box>
        );
    }

    const filasVisibles = datos.filas.slice(inicio, inicio + FILAS_VISIBLES);
    const valorActual = datos.filas.length > 0 ? datos.filas[fila][columna] : '(sin filas)';

    return (
        <Box width={COLUMNAS} height={FILAS} flexDirection="column" paddingX={1}>
            <Box justifyContent="space-between">
                <Text bold color={COLORES.titulo}>{basename(nombreArchivo)}</Text>
                <Text color={COLORES.secundario}>{datos.filas.length} filas · {datos.cabecera.length} columnas</Text>
            </Box>

            {modo === 'tabla' && <Text color={COLORES.secundario}>Valor: {valorActual} · Fila {fila + 1}, columna {columna + 1}</Text>}

            {modo === 'abrir' && <Box><Text color={COLORES.acento}>Abrir: </Text><TextInput key="abrir-tabla" defaultValue="" onChange={setValorInput} onSubmit={enviarInput} /></Box>}
            {modo === 'guardar' && <Box><Text color={COLORES.acento}>Guardar como: </Text><TextInput key="guardar" defaultValue={valorInput} onChange={setValorInput} onSubmit={enviarInput} /></Box>}
            {modo === 'editar' && <Box><Text color={COLORES.acento}>Nuevo valor: </Text><TextInput key={`editar-${fila}-${columna}`} defaultValue={valorInput} onChange={setValorInput} onSubmit={enviarInput} /></Box>}
            {mensaje && <Text color={mensaje === 'Archivo guardado.' ? 'green' : 'red'}>{mensaje}</Text>}

            <Box>
                <Box width={5}><Text bold color={COLORES.titulo}>#</Text></Box>
                {datos.cabecera.map((titulo, indice) => <Box key={indice} width={ANCHO_CELDA}><Text bold color={COLORES.titulo}>{textoCelda(titulo)}</Text></Box>)}
            </Box>

            {filasVisibles.map((filaActual, indice) => {
                const numeroFila = inicio + indice;
                return (
                    <Box key={numeroFila}>
                        <Box width={5}><Text color={numeroFila === fila ? COLORES.acento : COLORES.secundario}>{numeroFila + 1}</Text></Box>
                        {filaActual.map((celda, numeroColumna) => {
                            const seleccionada = numeroFila === fila && numeroColumna === columna;
                            return <Box key={numeroColumna} width={ANCHO_CELDA}><Text backgroundColor={seleccionada ? COLORES.acento : undefined} color={seleccionada ? COLORES.fondo : COLORES.titulo}>{textoCelda(celda)}</Text></Box>;
                        })}
                    </Box>
                );
            })}

            <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> A</Text> abrir · <Text bold color={COLORES.acento}> G</Text> guardar · <Text bold color={COLORES.acento}> Enter</Text> editar · <Text bold color={COLORES.acento}> &lt;</Text> ascendente · <Text bold color={COLORES.acento}> &gt;</Text> descendente · <Text bold color={COLORES.acento}> Esc</Text> salir</Text>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();