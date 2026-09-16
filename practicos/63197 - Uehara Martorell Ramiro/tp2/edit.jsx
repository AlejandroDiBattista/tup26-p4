#!/usr/bin/env -S node --import tsx

import React, {useState} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';

const ANCHO = process.stdout.columns || 80;
const ALTO = process.stdout.rows || 24;

const COLORES = {
    fondo:      '#fffefd',
    borde:      '#2600ff',
    titulo:     '#1504d5',
    secundario: '#ada79e',
    acento:     '#edbb64',
    error:      '#fb2100',
};



function leerCsv(texto) {

    const lineas = texto.split('\n').filter(linea => linea.trim() !== '');
    const cabecera = lineas[0].split(',');
    const filas = lineas.slice(1).map(linea => linea.split(','));
    return {cabecera, filas};

}

function armarCsv(cabecera, filas) {

    const lineas = [cabecera.join(','), ...filas.map(fila => fila.join(','))];
    return lineas.join('\n') + '\n';

}

function esNumero(texto) {

    return texto.trim() !== '' && !isNaN(Number(texto));
}


function ordenar(filas, columna, ascendente) {

    const copia = [...filas];
    copia.sort((a, b) => {
        let resultado;
        if (esNumero(a[columna]) && esNumero(b[columna])) {
            resultado = Number(a[columna]) - Number(b[columna]);
        } else {
            resultado = a[columna].localeCompare(b[columna]);
        }
        return ascendente ? resultado : -resultado;
    });

    return copia;

}

function mensajeDeError(error) {

    if (error.code === 'ENOENT') return 'no existe el archivo';
    if (error.code === 'EACCES') return 'no tenes permisos';
    return error.message;

}

function App({inicial}) {

    const {exit} = useApp();
    const [archivo, setArchivo] = useState(inicial.archivo);
    const [cabecera, setCabecera] = useState(inicial.cabecera);
    const [filas, setFilas] = useState(inicial.filas);
    const [error, setError] = useState(inicial.error);
    const [fila, setFila] = useState(0);        
    const [columna, setColumna] = useState(0);  
    const [inicio, setInicio] = useState(0);    

    const [modo, setModo] = useState('ver');

    const visibles = ALTO - 9;

    const numericas = cabecera.map((titulo, c) => filas.length > 0 && filas.every(f => esNumero(f[c])));

    function textoDeCelda(valor, c) {
        if (numericas[c] && esNumero(valor)) return Number(valor).toLocaleString('es-AR');
        return valor;
    }


    const anchos = cabecera.map((titulo, c) => {
        let ancho = titulo.length;
        for (const f of filas) {
            ancho = Math.max(ancho, textoDeCelda(f[c], c).length);
        }
        return ancho;

    });

    function alinear(texto, c) {

        if (numericas[c]) return texto.padStart(anchos[c]);
        return texto.padEnd(anchos[c]);

    }

    function mover(nuevaFila, nuevaColumna) {

        setFila(nuevaFila);
        setColumna(nuevaColumna);
        setError(null);

        if (nuevaFila < inicio) setInicio(nuevaFila);
        if (nuevaFila >= inicio + visibles) setInicio(nuevaFila - visibles + 1);

    }

    async function abrir(nombre) {

        setModo('ver');
        if (nombre.trim() === '') return;

        try {
            const texto = await readFile(nombre, 'utf8');
            const datos = leerCsv(texto);
            setCabecera(datos.cabecera);
            setFilas(datos.filas);
            setArchivo(nombre);
            setFila(0);
            setColumna(0);
            setInicio(0);
            setError(null);
        } catch (e) {
            setError('no se pudo abrir "' + nombre + '": ' + mensajeDeError(e));
        }

    }

    async function guardar(nombre) {

        setModo('ver');
        if (nombre.trim() === '') return;

        try {
            await writeFile(nombre, armarCsv(cabecera, filas), 'utf8');
            setArchivo(nombre);
            setError(null);
        } catch (e) {
            setError('no se pudo guardar "' + nombre + '": ' + mensajeDeError(e));
        }

    }

    function editar(nuevoValor) {

        const copia = [...filas];
        copia[fila] = [...copia[fila]];
        copia[fila][columna] = nuevoValor;
        setFilas(copia);
        setModo('ver');

    }

    useInput((tecla, key) => {

        if (key.escape) exit();
        if (key.upArrow) mover(Math.max(0, fila - 1), columna);
        if (key.downArrow) mover(Math.min(filas.length - 1, fila + 1), columna);
        if (key.leftArrow) mover(fila, Math.max(0, columna - 1));
        if (key.rightArrow) mover(fila, Math.min(cabecera.length - 1, columna + 1));
        if (key.return && filas.length > 0) setModo('editar');


        if (tecla === '<') {
            setFilas(ordenar(filas, columna, true));
            mover(0, columna);
        }
        if (tecla === '>') {
            setFilas(ordenar(filas, columna, false));
            mover(0, columna);
        }

        if (tecla === 'a' || tecla === 'A') setModo('abrir');
        if (tecla === 'g' || tecla === 'G') setModo('guardar');

    }, {isActive: modo === 'ver'});


    useInput((tecla, key) => {

        if (key.escape) setModo('ver');

    }, {isActive: modo !== 'ver'});
    const valor = filas.length > 0 ? filas[fila][columna] : '';
    const visto = filas.slice(inicio, inicio + visibles);



    return (
        <Box width={ANCHO} height={ALTO} flexDirection="column" paddingX={1}
             borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>

            <Box>
                <Box flexGrow={1}>
                    <Text bold color={COLORES.titulo}>{archivo || 'sin archivo'}</Text>
                </Box>
                <Text color={COLORES.secundario}>{filas.length} filas · {cabecera.length} columnas</Text>
            </Box>

            <Text> </Text>

            <Box>
                {error && <Text color={COLORES.error}>Error › {error}</Text>}

                {!error && modo === 'ver' && (
                    <Text color={COLORES.secundario}>Valor › <Text color={COLORES.titulo}>{valor}</Text></Text>
                )}

                {!error && modo === 'editar' && (
                    <>
                        <Text bold color={COLORES.acento}>Editar › </Text>
                        <TextInput defaultValue={valor} onSubmit={editar} />
                    </>
                )}

                {!error && modo === 'abrir' && (
                    <>
                        <Text bold color={COLORES.acento}>Abrir › </Text>
                        <TextInput placeholder="nombre del archivo" onSubmit={abrir} />
                    </>
                )}

                {!error && modo === 'guardar' && (
                    <>
                        <Text bold color={COLORES.acento}>Guardar › </Text>
                        <TextInput defaultValue={archivo} onSubmit={guardar} />
                    </>
                )}
            </Box>

            <Text> </Text>

            <Box>
                <Text bold color={COLORES.secundario}>{'   #'}</Text>
                {cabecera.map((titulo, c) => (
                    <Text key={c} bold
                          color={c === columna ? COLORES.acento : COLORES.secundario}>
                        {'  ' + alinear(titulo.toUpperCase(), c)}
                    </Text>
                ))}
            </Box>

            {visto.map((f, i) => {
                const numeroDeFila = inicio + i;
                return (
                    <Box key={numeroDeFila}>
                        <Text color={numeroDeFila === fila ? COLORES.acento : COLORES.secundario}>
                            {String(numeroDeFila + 1).padStart(4)}
                        </Text>
                        {f.map((celda, c) => (
                            <Text key={c}
                                  color={numeroDeFila === fila && c === columna ? COLORES.fondo : COLORES.titulo}
                                  backgroundColor={numeroDeFila === fila && c === columna ? COLORES.titulo : undefined}>
                                {'  ' + alinear(textoDeCelda(celda, c), c)}
                            </Text>
                        ))}
                    </Box>
                );
            })}

            <Box flexGrow={1} />
            <Box>
                <Box flexGrow={1}>
                    {modo === 'ver' ? (
                        <Text wrap="truncate-end" color={COLORES.secundario}>
                            <Text bold color={COLORES.acento}>A</Text> abrir ·{' '}
                            <Text bold color={COLORES.acento}>G</Text> guardar ·{' '}
                            <Text bold color={COLORES.acento}>Enter</Text> editar ·{' '}
                            <Text bold color={COLORES.acento}>{'<'}</Text> izquierda ·{' '}
                            <Text bold color={COLORES.acento}>{'>'}</Text> derecha ·{' '}
                            <Text bold color={COLORES.acento}>Esc</Text> salir
                        </Text>
                    ) : (
                        <Text wrap="truncate-end" color={COLORES.secundario}>
                            <Text bold color={COLORES.acento}>Enter</Text> confirmar ·{' '}
                            <Text bold color={COLORES.acento}>Esc</Text> cancelar
                        </Text>
                    )}
                </Box>
                <Text wrap="truncate-end" color={COLORES.secundario}>
                    Fila {fila + 1} · Columna {columna + 1}
                </Text>
            </Box>
        </Box>
    );
}

const nombre = process.argv[2];
const inicial = {archivo: '', cabecera: [], filas: [], error: null};

if (nombre) {
    try {
        const texto = await readFile(nombre, 'utf8');
        const datos = leerCsv(texto);
        inicial.archivo = nombre;
        inicial.cabecera = datos.cabecera;
        inicial.filas = datos.filas;
    } catch (e) {
        inicial.error = 'no se pudo abrir "' + nombre + '": ' + mensajeDeError(e);
    }
}

const app = render(<App inicial={inicial} />);
await app.waitUntilExit();

console.clear();
