#!/usr/bin/env -S node --import tsx

import React from 'react';
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

const archivoInicial = process.argv[2];

function App() {
    const {exit} = useApp();
    const [cabecera, setCabecera] = React.useState([]);
    const [filas, setFilas] = React.useState([]);
    const [filaSeleccionada, setFilaSeleccionada] = React.useState(0);
    const [columnaSeleccionada, setColumnaSeleccionada] = React.useState(0);
    const [filaInicio, setFilaInicio] = React.useState(0);
    const [editando, setEditando] = React.useState(false);
    const [textoEditado, setTextoEditado] = React.useState('');
    const [guardando, setGuardando] = React.useState(false);
    const [nombreGuardado, setNombreGuardado] = React.useState('');
    const [abriendo, setAbriendo] = React.useState(false);
    const [nombreArchivo, setNombreArchivo] = React.useState('');
    const [archivoActual, setArchivoActual] =React.useState(archivoInicial || '');
    const [ordenAscendente, setOrdenAscendente] = React.useState(true);
    const [error, setError] = React.useState('');




    React.useEffect(() => {
    if (!archivoInicial) {
        return;
    }

    async function cargarArchivo() {
        const textoCSV = await readFile(archivoInicial, 'utf-8');
        const datos = parsearCSV(textoCSV);

        setCabecera(datos.cabecera);
        setFilas(datos.filas);
    }

    cargarArchivo();

}, []);

React.useEffect(() => {
        if (filaSeleccionada < filaInicio) {
        setFilaInicio(filaSeleccionada);
    }

        if (filaSeleccionada >= filaInicio + 10) {
        setFilaInicio(filaSeleccionada - 9);
    }

}, [filaSeleccionada]);
    
   useInput(async (tecla, key) => {
    if (key.escape) {
        if (abriendo) {
            setAbriendo(false);
            setNombreArchivo('');
            setError('');
            return;
        }

    if (guardando) {
        setGuardando(false);
        setNombreGuardado('');
        setError('');
        return;

    }

    if (editando) {
        setEditando(false);
        setTextoEditado('');
        return;
    }

    exit();


    }

    if (key.return && abriendo) {
        try {
            const textoCSV = await readFile(nombreArchivo, 'utf-8');
            const datos = parsearCSV(textoCSV);

            setCabecera(datos.cabecera);
            setFilas(datos.filas);
            setArchivoActual(nombreArchivo);
            setAbriendo(false);
            setNombreArchivo('');
            setError('');
        } catch (error) {
            setError('No se pudo abrir el archivo');
        }
        return;
    }

    if (key.return && guardando) {
        try {
            const textoCSV = generarCSV(cabecera, filas);
            await writeFile(nombreGuardado, textoCSV, 'utf-8');

            setGuardando(false);
            setNombreGuardado('');
            setError('');
        } catch (error) {
            setError('No se pudo guardar el archivo');
        }
        return;
    }

    if (abriendo || guardando) {
        return;
    }

    if (key.leftArrow) {
        setColumnaSeleccionada(columna => Math.max(0, columna - 1));
    }

    if (key.rightArrow) {
        setColumnaSeleccionada(columna => Math.min(cabecera.length - 1, columna + 1));
    }

    if (key.downArrow) {
        setFilaSeleccionada(fila => Math.min(filas.length - 1, fila + 1));
    }

    if (key.upArrow) {
        setFilaSeleccionada(fila => Math.max(0, fila - 1));
    }

    if (tecla.toLowerCase() === 'g') {
        setGuardando(true);
    }

    if (tecla.toLowerCase() === 'a') {
        setAbriendo(true);
    }

    if (tecla === '<') {
        const nuevasFilas = [...filas];

        nuevasFilas.sort((a, b) => {
            return a[columnaSeleccionada].localeCompare(
                b[columnaSeleccionada]
            );
        });

        setFilas(nuevasFilas);
    }

    if (tecla === '>') {
        const nuevasFilas = [...filas];

        nuevasFilas.sort((a, b) => {
            return b[columnaSeleccionada].localeCompare(
                a[columnaSeleccionada]
            );
        });

        setFilas(nuevasFilas);
    }

    if (key.return) {
        if (!editando) {
            setTextoEditado(filas[filaSeleccionada][columnaSeleccionada]);
            setEditando(true);
        } else {
            const nuevasFilas = [...filas];
            nuevasFilas[filaSeleccionada][columnaSeleccionada] = textoEditado;

            setFilas(nuevasFilas);
            setEditando(false);
        }
    }
});


    return (
        <Box flexDirection="column">

            {abriendo && (
                <Box>
                    <Text>Abrir {'>'}  </Text>
                    <TextInput
                    value={nombreArchivo}
                    onChange={setNombreArchivo}

                    />

                </Box>
            )}


            {guardando && (
                <Box>
                    <Text>Guardar {'>'} </Text>
                    <TextInput 
                    value={nombreGuardado}
                    onChange={setNombreGuardado}  
                    />
                </Box>
            )}


            <Box justifyContent="space-between">
                <Text bold>{basename(archivoActual || '')} </Text>
                <Text>{filas.length} filas · {cabecera.length} columnas</Text>
            </Box>

            <Box>
                <Text>
                Valor: {filas[filaSeleccionada]?.[columnaSeleccionada] || ''}
                </Text>
            </Box>

            
            {error && (
                <Text>{error}</Text>
            )}
           

           <Box>
            <Box width={5} justifyContent="center">
                <Text bold>#</Text>
            </Box>

            {cabecera.map((columna, indiceColumna) => (
                <Box key={indiceColumna} width={18}>
                    <Text bold>{columna} </Text>
                </Box>
            ))}
            </Box>

            {filas.slice(filaInicio, filaInicio + 10).map((fila, indiceFila) => {
    const numeroFila = filaInicio + indiceFila;

    return (
        <Box key={numeroFila}>
            <Box width={5} justifyContent="center">
                <Text> {numeroFila + 1} </Text>
            </Box>

            {fila.map((campo, indiceColumna) => {
                const seleccionada =
                    numeroFila === filaSeleccionada &&
                    indiceColumna === columnaSeleccionada;

                return (
                    <Box key={indiceColumna} width={18}>
                        {seleccionada && editando ? (
                            <TextInput
                                defaultValue={campo}
                                onChange={setTextoEditado}
                            />
                        ) : (
                            <Text inverse={seleccionada}>
                                {campo}
                            </Text>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
})}

{abriendo && (
    <Box justifyContent="center">
        <Text>Enter Abrir · Esc Cancelar</Text>
    </Box>
)}

{guardando && (
    <Box justifyContent="center">
        <Text>Enter Guardar · Esc Cancelar</Text>
    </Box>
)}

{!abriendo && !guardando && (

<Box flexDirection="row">
    <Text>
        A Abrir   G Guardar   Enter Editar   {'<'} Asc   {'>'} Desc   Esc Salir
    </Text>

    <Text>
       {'    '}Fila: {filaSeleccionada + 1} · Columna: {columnaSeleccionada + 1}
    </Text>
</Box>
)}

</Box>
    );
}
         
                            
const app = render(<App />);
await app.waitUntilExit();
console.clear();


/* Desarrollo */

function parsearCSV(textoCSV) {
    if (!textoCSV || textoCSV.trim() === '') {
        return { cabecera: [], filas: [] };
    }

    const lineas = textoCSV
    .trim()
    .split(/\r?\n/)
    .filter(linea => linea.trim().length > 0);

    const cabecera = lineas[0]
    .split(',')
    .map(campo => campo.trim());

    const filas = lineas.slice(1).map(linea => linea.split(',').map(campo => campo.trim()));

    return { cabecera, filas };
}

function generarCSV(cabecera, filas) {
    const lineaCabecera = cabecera.join(',');
    const lineasFilas = filas.map(fila => fila.join(','));

    return [lineaCabecera, ...lineasFilas].join('\n');

}