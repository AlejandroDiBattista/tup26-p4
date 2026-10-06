#!/usr/bin/env -S node --import tsx

import React from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;
const ANCHOS = [14, 14, 8, 14, 20];
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

    if (editando && key.return) {
        const nuevasFilas = [...filas];
        nuevasFilas[filaSeleccionada][columnaSeleccionada] = textoEditado;


        setFilas(nuevasFilas);
        setEditando(false);
        return;
    }

    if (editando) {
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
        setNombreGuardado(archivoActual);

    }

    if (tecla.toLowerCase() === 'a') {
        setAbriendo(true);
    }

    if (tecla === '<') {
        const nuevasFilas = [...filas];

        nuevasFilas.sort((a, b) => {
            const valorA = a[columnaSeleccionada];
            const valorB = b[columnaSeleccionada];

            if (!isNaN(valorA) && !isNaN(valorB)) {
                return Number(valorA) - Number(valorB);
            }

            return valorA.localeCompare(valorB);
        });

        setFilas(nuevasFilas);
    }

        if (tecla === '>') {
            const nuevasFilas = [...filas];

            nuevasFilas.sort((a, b) => {
                const valorA = a[columnaSeleccionada];
                const valorB = b[columnaSeleccionada];

                if (!isNaN(valorA) && !isNaN(valorB)) {
                    return Number(valorB) - Number(valorA);
                    
                }

                return valorB.localeCompare(valorA);
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
        <Box 
        flexDirection="column"
        borderStyle="round"
        borderColor="gray"
        paddingX={1}
        backgroundColor={COLORES.fondo}
    >

            {abriendo && (
                <Box>
                    <Text color="yellow">Abrir {'>'} </Text>
                    <TextInput
                    value={nombreArchivo}
                    onChange={setNombreArchivo}

                    />

                </Box>
            )}

            <Box justifyContent="space-between">
                <Text bold color="white">{basename(archivoActual || '')} </Text>
                <Text>{filas.length} filas · {cabecera.length} columnas</Text>
            </Box>

            {guardando && (
                <Box>
                    <Text color="yellow">Guardar {'>'} </Text>
                    <TextInput 
                    defaultValue={nombreGuardado}
                    onChange={setNombreGuardado}  
                    />
                </Box>
            )}


            {!abriendo && !guardando && (
             <Box>
            <Text>
            <Text color="gray">Valor:</Text>{' '}
            <Text color="white">
                {filas[filaSeleccionada]?.[columnaSeleccionada] || ''}
            </Text>
            </Text>
            </Box>
)}

            
            {error && (
                <Text>{error}</Text>
            )}
           

           <Box>
            <Box width={5} justifyContent="center">
                <Text bold>#</Text>
            </Box>

            {cabecera.map((columna, indiceColumna) => {
                const esColumnaSeleccionada =
                indiceColumna === columnaSeleccionada;

                return (
                    <Box key={indiceColumna} width={ANCHOS[indiceColumna]}>
                        <Text
                        bold
                        color={esColumnaSeleccionada ? 'yellow' : undefined}
                        backgroundColor={esColumnaSeleccionada ? 'black' : undefined}
                >
                        {columna.toUpperCase()}
                       </Text>
                        </Box>
                );
            })}
                            
            </Box>

            {filas.slice(filaInicio, filaInicio + 10).map((fila, indiceFila) => {
    const numeroFila = filaInicio + indiceFila;

    return (
        <Box key={numeroFila}>
            <Box width={5} justifyContent="center">
                <Text
                     color={numeroFila === filaSeleccionada ? 'yellow' : undefined}
                    backgroundColor={numeroFila === filaSeleccionada ? 'black' : undefined}
                > 
                    {numeroFila + 1}
            </Text>


            </Box>

            {fila.map((campo, indiceColumna) => {
                const seleccionada =
                    numeroFila === filaSeleccionada &&
                    indiceColumna === columnaSeleccionada;

                return (
                    <Box key={indiceColumna} width={ANCHOS[indiceColumna]}>
                        {seleccionada && editando ? (
                            <TextInput
                                defaultValue={campo}
                                onChange={setTextoEditado}
                            />
                        ) : (
                           <Text
                           color={seleccionada ? 'black' : undefined}
                           backgroundColor={seleccionada ? 'white' : undefined}
                           wrap="truncate"
                           >
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
   <Box flexDirection="row"  justifyContent="space-between">
   <Text>
    <Text color="yellow">Enter</Text> abrir · <Text color="yellow">Esc</Text> cancelar
</Text>

    <Text>
         Fila: {filaSeleccionada + 1} · Columna: {columnaSeleccionada + 1}
    </Text>

    </Box>
)}

{guardando && (
    <Box flexDirection="row" justifyContent="space-between">
        <Text>
            <Text color="yellow">Enter</Text> guardar · <Text color="yellow">Esc</Text> cancelar
        </Text>

        <Text>
            Fila: {filaSeleccionada + 1} · Columna: {columnaSeleccionada + 1}
        </Text>
    </Box>
)}




{!abriendo && !guardando && (

   <Box flexDirection="row" justifyContent="space-between">

   
<Text>
    <Text color="yellow">A</Text> abrir · <Text color="yellow">G</Text> guardar · <Text color="yellow">Enter</Text> editar · <Text color="yellow">{'<'}</Text> ascendente · <Text color="yellow">{'>'}</Text> descendente · <Text color="yellow">Esc</Text> salir
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