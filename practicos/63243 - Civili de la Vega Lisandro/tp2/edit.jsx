#!/usr/bin/env -S node --import tsx

import React from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

// convierto archivo a csv
function parseCSV(texto) {
    // saco posibles saltos de linea y lineas vacias al final
    const lineas = texto.replace(/\r/g, '').split('\n').filter(l => l.length > 0);
    //separo la cabecera de los datos
    const cabecera = lineas[0].split(',');
    const filas = [];
    for (let i = 1; i < lineas.length; i++) {
        filas.push(lineas[i].split(','));
    }

    return {cabecera, filas};
}

// armo el texto del csv a partir de la cabecera y las filas
function serializeCSV(cabecera, filas) {
    let texto = cabecera.join(',') + '\n';
    for (const fila of filas) {
        texto += fila.join(',') + '\n';
    }
    return texto;
}

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};


// calculo ancho de cada columna dependiendo de cabecera y celdas. Tambien tiene tope
function calcularAnchos(cabecera, filas) {
    const anchos = cabecera.map(c => c.length);

    for (const fila of filas) {
        for (let c = 0; c < fila.length; c++) {
            if (fila[c].length > anchos[c]) {
                anchos[c] = fila[c].length;
            }
        }
    }

    return anchos.map(a => Math.min(a, 20));
}

// me fijo si todos los valores de una columna se pueden interpretar
// como numero, para poder ordenar numericamente en vez de por texto
function esColumnaNumerica(filas, col) {
    for (const fila of filas) {
        if (fila[col].trim() === '' || isNaN(Number(fila[col]))) {
            return false;
        }
    }
    return true;
}

// ordeno las filas segun la columna col. si ascendente es true ordena de
// menor a mayor (o alfabeticamente si no es numerica), si no al reves
function ordenarFilas(filas, col, ascendente) {
    const copia = filas.slice(); // para no modificar el array original
    const numerica = esColumnaNumerica(filas, col);

    copia.sort((filaA, filaB) => {
        let resultado;
        if (numerica) {
            resultado = Number(filaA[col]) - Number(filaB[col]);
        } else {
            resultado = filaA[col].localeCompare(filaB[col]);
        }
        return ascendente ? resultado : -resultado;
    });

    return copia;
}



// cuantas filas de datos entran en pantalla (le resto un par de lineas
// que use para el borde, titulo, cabecera y el cartelito de abajo)
const FILAS_VISIBLES = Math.max(FILAS - 6, 3);
const COLUMNAS_VISIBLES = 5; // por ahora dejo un numero fijo de columnas a la vez


// funcion para dibujar la tabal con cabecera arriba y filas ennumeradas abajo
function Tabla({nombreArchivo, cabecera, filas, filaSel, colSel}) {
    const anchos = calcularAnchos(cabecera, filas);
    const anchoNumero = String(filas.length).length + 1;

    // calculo el rango de filas que se ve, para que la celda
    // seleccionada siempre quede dentro de la ventana visible
    let inicioFila = filaSel - Math.floor(FILAS_VISIBLES / 2);
    if (inicioFila < 0) inicioFila = 0;
    if (inicioFila + FILAS_VISIBLES > filas.length) {
        inicioFila = Math.max(filas.length - FILAS_VISIBLES, 0);
    }
    const finFila = Math.min(inicioFila + FILAS_VISIBLES, filas.length);

    // lo mismo pero para las columnas
    let inicioCol = colSel - Math.floor(COLUMNAS_VISIBLES / 2);
    if (inicioCol < 0) inicioCol = 0;
    if (inicioCol + COLUMNAS_VISIBLES > cabecera.length) {
        inicioCol = Math.max(cabecera.length - COLUMNAS_VISIBLES, 0);
    }
    const finCol = Math.min(inicioCol + COLUMNAS_VISIBLES, cabecera.length);

    const valorSeleccionado = filas[filaSel][colSel];


    return (
        <Box flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
            <Text color={COLORES.titulo} bold> {nombreArchivo} ({filas.length} filas, {cabecera.length} columnas)</Text>

            <Box>
                <Text> </Text>
                <Box width={anchoNumero}><Text> </Text></Box>
                {cabecera.slice(inicioCol, finCol).map((col, i) => {
                    const c = inicioCol + i;
                    return (
                        <Box key={c} width={anchos[c] + 2}>
                            <Text bold color={COLORES.acento}>{col}</Text>
                        </Box>
                    );
                })}
            </Box>

            {filas.slice(inicioFila, finFila).map((fila, i) => {
                const f = inicioFila + i;
                return (
                    <Box key={f}>
                        <Text> </Text>
                        <Box width={anchoNumero}><Text color={COLORES.secundario}>{f + 1}</Text></Box>
                        {fila.slice(inicioCol, finCol).map((valor, j) => {
                            const c = inicioCol + j;
                            const esSeleccionada = f === filaSel && c === colSel;
                            return (
                                <Box key={c} width={anchos[c] + 2}>
                                    <Text color={COLORES.titulo} inverse={esSeleccionada}>{valor}</Text>
                                </Box>
                            );
                        })}
                    </Box>
                );
            })}

            <Text color={COLORES.secundario}>
                Celda ({filaSel + 1}, {cabecera[colSel]}): <Text bold color={COLORES.acento}>{valorSeleccionado}</Text>
            </Text>
        </Box>
    );
}

// la app tiene 4 "modos" o pantallas distintas:
// ver: la tabla normal, navegando con flechas (el modo por defecto)
// abrir: pidiendo el nombre de un archivo para abrir
// guardar: pidiendo el nombre de un archivo para guardar
// editar: pidiendo el nuevo valor de la celda seleccionada
function App({nombreArchivoInicial, cabeceraInicial, filasIniciales, errorInicial}) {
    const {exit} = useApp();
    const [nombreArchivo, setNombreArchivo] = React.useState(nombreArchivoInicial);
    const [cabecera, setCabecera] = React.useState(cabeceraInicial);
    const [filas, setFilas] = React.useState(filasIniciales);
    const [filaSel, setFilaSel] = React.useState(0);
    const [colSel, setColSel] = React.useState(0);

    // si todavia no se pudo cargar ningun archivo (no vino por argumento, o
    // vino uno que fallo), arrancamos directamente pidiendo que abran uno
    const [modo, setModo] = React.useState(cabeceraInicial ? 'ver' : 'abrir');
    const [mensaje, setMensaje] = React.useState(errorInicial || '');

    useInput((tecla, key) => {
        if (modo === 'ver') {
            if (key.escape) {
                exit();
            } else if (key.upArrow) {
                setFilaSel(f => Math.max(f - 1, 0));
            } else if (key.downArrow) {
                setFilaSel(f => Math.min(f + 1, filas.length - 1));
            } else if (key.leftArrow) {
                setColSel(c => Math.max(c - 1, 0));
            } else if (key.rightArrow) {
                setColSel(c => Math.min(c + 1, cabecera.length - 1));
            } else if (tecla === '<') {
                // ordenar ascendente por la columna donde esta parado el cursor
                setFilas(filasActuales => ordenarFilas(filasActuales, colSel, true));
            } else if (tecla === '>') {
                // y descendente
                setFilas(filasActuales => ordenarFilas(filasActuales, colSel, false));
            } else if (tecla === 'a' || tecla === 'A') {
                setMensaje('');
                setModo('abrir');
            } else if (tecla === 'g' || tecla === 'G') {
                setMensaje('');
                setModo('guardar');
            } else if (key.return) {
                setMensaje('');
                setModo('editar');
            }
        } else {
            // en abrir/guardar/editar, el TextInput de cada pantalla se encarga
            // de las letras, aca solo nos importa el escape para cancelar
            if (key.escape) {
                if (modo === 'abrir' && !cabecera) {
                    // si todavia no hay ningun archivo cargado no hay a donde
                    // "volver", asi que escape directamente cierra la app
                    exit();
                } else {
                    setMensaje('');
                    setModo('ver');
                }
            }
        }
    })

    // se llama cuando confirmo el nombre del archivo a abrir
    async function manejarAbrir(nombre) {
        try {
            const texto = await readFile(nombre, 'utf-8');
            const datos = parseCSV(texto);
            setCabecera(datos.cabecera);
            setFilas(datos.filas);
            setNombreArchivo(basename(nombre));
            setFilaSel(0);
            setColSel(0);
            setMensaje('');
            setModo('ver');
        } catch (error) {
            setMensaje('no se pudo abrir "' + nombre + '": ' + error.message);
        }
    }

    // se llama cuando confirmo el nombre del archivo a guardar
    async function manejarGuardar(nombre) {
        try {
            const texto = serializeCSV(cabecera, filas);
            await writeFile(nombre, texto, 'utf-8');
            setNombreArchivo(basename(nombre));
            setMensaje('');
            setModo('ver');
        } catch (error) {
            setMensaje('no se pudo guardar "' + nombre + '": ' + error.message);
        }
    }

    // se usa cuando se confirma el nuevo valor de la celda seleccionada
    function manejarEditar(valorNuevo) {
        // hago una copia de las filas (y de la fila que cambia) para no
        // cambiar el estado directamente, sino react no hace el cambio
        const copiaFilas = filas.map(fila => fila.slice());
        copiaFilas[filaSel][colSel] = valorNuevo;
        setFilas(copiaFilas);
        setModo('ver');
    }

    return (
        <Box width={COLUMNAS} flexDirection="column">
            {cabecera && (
                <Tabla nombreArchivo={nombreArchivo} cabecera={cabecera} filas={filas} filaSel={filaSel} colSel={colSel} />
            )}

            {modo === 'abrir' && (
                <Box>
                    <Text color={COLORES.acento}>Abrir archivo: </Text>
                    <TextInput placeholder="nombre.csv" onSubmit={manejarAbrir} />
                </Box>
            )}

            {modo === 'guardar' && (
                <Box>
                    <Text color={COLORES.acento}>Guardar como: </Text>
                    <TextInput defaultValue={nombreArchivo} onSubmit={manejarGuardar} />
                </Box>
            )}

            {modo === 'editar' && (
                <Box>
                    <Text color={COLORES.acento}>Nuevo valor: </Text>
                    <TextInput defaultValue={filas[filaSel][colSel]} onSubmit={manejarEditar} />
                </Box>
            )}

            {mensaje !== '' && <Text color={COLORES.error}>{mensaje}</Text>}

            {modo === 'ver' && (
                <Text color={COLORES.secundario}>
                    [A] abrir   [G] guardar   [Enter] editar   [{'<'} {'>'}] ordenar   [Esc] salir
                </Text>
            )}
        </Box>
    );
}

// si se pasa un archivo por argumento tratamos de abrirlo, para
// no tener que pedirlo de nuevo por pantalla. Si no hay argumento (o falla
// la apertura) arrancamos igual y la propia app pide el archivo en modo 'abrir'
const argArchivo = process.argv[2];
let nombreArchivoInicial = '';o
let cabeceraInicial = null;
let filasIniciales = null;
let errorInicial = '';

if (argArchivo) {
    try {
        const textoArchivo = await readFile(argArchivo, 'utf-8');
        const datos = parseCSV(textoArchivo);
        cabeceraInicial = datos.cabecera;
        filasIniciales = datos.filas;
        nombreArchivoInicial = basename(argArchivo);
    } catch (error) {
        errorInicial = 'no se pudo abrir "' + argArchivo + '": ' + error.message;
    }
}

const app = render(
    <App
        nombreArchivoInicial={nombreArchivoInicial}
        cabeceraInicial={cabeceraInicial}
        filasIniciales={filasIniciales}
        errorInicial={errorInicial}
    />
);

await app.waitUntilExit();
console.clear();