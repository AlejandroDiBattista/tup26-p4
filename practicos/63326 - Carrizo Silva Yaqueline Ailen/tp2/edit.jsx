#!/usr/bin/env -S node --import tsx

import React, {useState, useEffect} from 'react';
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

// const FILAS_TABLA = 12;

function App() {
    const {exit} = useApp();
    const FILAS_TABLA = Math.max(1, FILAS - 6);

    const [datos, setDatos] = useState([]);
    const [archivo, setArchivo] = useState('');

    const[modoAbrir, setModoAbrir] = useState(false);
    const [modoGuardar, setModoGuardar] = useState(false);
    const [nombreArchivo, setNombreArchivo] = useState('');
    const [mensaje, setMensaje] = useState('');

    const [filaSeleccionada, setFilaSeleccionada] = useState(1);
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);

    const [filaInicio, setFilaInicio] = useState(1);

    const [editando, setEditando] = useState(false);
    const [valorEditado, setValorEditado] = useState('');

    useEffect(() => {
        const nombreArchivo = process.argv[2];

        if (!nombreArchivo) {
            return;
        }

        setArchivo(nombreArchivo);

        readFile(nombreArchivo, 'utf-8')
            .then((texto) => {
                const filas = texto.trimEnd().split(/\r?\n/);
                const datosCSV = filas.map((fila) => fila.split(','));

                setDatos(datosCSV);
            })
            .catch((error) => {
                console.error(error.message);
            });
    }, []);

    useInput((tecla, key) => {

        if((tecla === 'a' || tecla === 'A') && !editando && !modoAbrir && !modoGuardar){
            setModoAbrir(true);
            setNombreArchivo('');
            setMensaje('');
        } 
        if((tecla === 'g' || tecla === 'G') && !editando && !modoAbrir && !modoGuardar){
            setModoGuardar(true);
            setNombreArchivo(archivo || '');
            setMensaje('');
        }
        if (key.escape) {
            if(editando){
                setEditando(false);
                setValorEditado('');
            }else if(modoAbrir){
                setModoAbrir(false);
                setNombreArchivo('');
                setMensaje('');
            } else if(modoGuardar){
                setModoGuardar(false);
                setNombreArchivo('');
                setMensaje('');
            }else{
                exit();
            }
        }
        if(key.return){
            if(modoAbrir) {
                readFile(nombreArchivo, 'utf-8').then((texto) => {
            const filas = texto.trimEnd().split(/\r?\n/);
            const datosCSV = filas.map((fila) => fila.split(','));

            setDatos(datosCSV);
            setArchivo(nombreArchivo);
            setModoAbrir(false);
            setNombreArchivo('');
            setFilaSeleccionada(1);
            setColumnaSeleccionada(0);
            setFilaInicio(1);
            setMensaje('');
        }).catch((error) => {
            setMensaje(`Error al abrir el archivo: ${error.message}`);
        });
        return;
    }

        if(modoGuardar){
            const textoCSV = datos.map((fila) => fila.join(',')).join('\n');
            writeFile(nombreArchivo, textoCSV, 'utf-8')
                .then(() => {
                    setArchivo(nombreArchivo);
                    setModoGuardar(false);
                    setNombreArchivo('');
                    setMensaje('Archivo guardado con éxito.');
                })
                .catch((error) => {
                    setMensaje(`Error al guardar el archivo: ${error.message}`);
                });
            return;
        }
            if(editando){
                const nuevosDatos = datos.map((fila) => [...fila]);
                nuevosDatos[filaSeleccionada][columnaSeleccionada] = valorEditado;
                setDatos(nuevosDatos);
                setEditando(false);
                setValorEditado('');
            }else{
                setValorEditado(datos[filaSeleccionada] [columnaSeleccionada])
                setEditando(true);
            }
    }

        if (key.upArrow && filaSeleccionada > 1) {
        const nuevaFila = filaSeleccionada - 1;
        setFilaSeleccionada(nuevaFila);
        setMensaje('');

        if (nuevaFila < filaInicio) {
        setFilaInicio(filaInicio - 1);
        }
}

        if (key.downArrow && filaSeleccionada < datos.length - 1) {
        const nuevaFila = filaSeleccionada + 1;
        setFilaSeleccionada(nuevaFila);
        setMensaje('');

        if (nuevaFila >= filaInicio + FILAS_TABLA) {
        setFilaInicio(filaInicio + 1);
        }
}


        if(key.leftArrow && columnaSeleccionada > 0) {
            setColumnaSeleccionada(columnaSeleccionada - 1);
            setMensaje('');
        }

        if(key.rightArrow && datos.length > 0 && columnaSeleccionada < datos[0].length - 1) {
            setColumnaSeleccionada(columnaSeleccionada + 1);
            setMensaje('');
        }
    });

    

return (
    <Box width={COLUMNAS} height={FILAS} flexDirection="column" paddingX={1} backgroundColor={COLORES.fondo}>
        <Box justifyContent="space-between" marginBottom={1}>
            <Text bold color={COLORES.titulo}>
                {archivo ? `CSV > ${archivo}` : 'EDITOR CSV'}
            </Text>

            <Text color={COLORES.secundario}>
                {datos.length > 0 ? datos.length - 1 : 0} filas | {datos.length > 0 ? datos[0].length : 0} columnas
            </Text>

            {!modoAbrir && !modoGuardar && (
                <Text bold color={COLORES.acento}>
                    Fila: {filaSeleccionada} | Col: {columnaSeleccionada + 1}
                </Text>
            )}
        </Box>

        {modoAbrir && (
            <Box flexDirection="column" marginTop={1}>
                <Text color={COLORES.titulo}>Abrir archivo: </Text>
                <TextInput value={nombreArchivo} onChange={(texto) =>{
                    if(texto !== nombreArchivo){
                        setNombreArchivo(texto);
                        setMensaje('');
                    }
                }}/>   
            </Box>
        )}

        {modoGuardar && (
            <Box flexDirection="column" marginTop={1}>
                <Text color={COLORES.titulo}>Guardar como: </Text>
                <TextInput value={nombreArchivo} onChange={(texto) =>{
                    if(texto !== nombreArchivo){
                        setNombreArchivo(texto);
                        setMensaje('');
                    }
                }}/>
            </Box>
        )}

        {mensaje && ( 
            <Text color={COLORES.acento}>
                {mensaje}
            </Text>
        )}

        {!modoAbrir && !modoGuardar && datos.length > 0 && (
            <Box flexDirection="column" flexGrow={1}> 
                <Box>
                    <Text color={COLORES.secundario}>{'   '}</Text>
                    {datos[0].map((celda, indiceColumna) => (
                        <Text key={indiceColumna} bold color={COLORES.titulo} wrap="truncate">
                            {celda.padEnd(15, ' ')}
                        </Text>
                    ))}
                </Box>
                {datos.slice(filaInicio, filaInicio + FILAS_TABLA).map((fila, indiceFila) => {
                    const indiceReal = filaInicio + indiceFila;
                    return (
                        <Box key={indiceReal}>
                            <Text color={COLORES.secundario}>
                                {String(indiceReal).padEnd(3, ' ')}
                            </Text>

                            {fila.map((celda, indiceColumna) => {
                                const seleccionada = indiceReal === filaSeleccionada && indiceColumna === columnaSeleccionada;
                                return seleccionada && editando ? (
                                    <TextInput key={indiceColumna} value={valorEditado} onChange={setValorEditado}/>
                                ) : (
                                    <Text key={indiceColumna} color={seleccionada ? COLORES.fondo : COLORES.secundario} backgroundColor={seleccionada ? COLORES.acento : undefined} wrap="truncate">
                                        {celda.padEnd(15, ' ')}
                                    </Text>
                                );
                            })}
                        </Box>
                    );
                })}
            </Box>
        )}
        {!modoAbrir && !modoGuardar && (
            <Box marginTop={1}>
                <Text color={COLORES.secundario}>
                    <Text bold color={COLORES.titulo}>Flechas</Text> mover · <Text bold color={COLORES.titulo}>Enter</Text> editar · <Text bold color={COLORES.titulo}>A</Text> abrir · <Text bold color={COLORES.titulo}>G</Text> guardar · <Text bold color={COLORES.titulo}>Esc</Text> salir
                </Text>
            </Box>
        )}
    </Box>
);

}

const app = render(<App />);
await app.waitUntilExit();
console.clear();
