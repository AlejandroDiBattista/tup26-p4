#!/usr/bin/env -S node --import tsx

import React, {useState, useEffect} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;
const FILAS_VISIBLES = Math.max(FILAS - 8, 5);

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};

// Solo dibuja la grilla. No sabe nada de "guardar" ni de teclas.
function Tabla({cabecera, datos, filaSel, colSel, offset}) {
    return (
        <Box flexDirection="column">
            <Box>
                <Text color={COLORES.secundario}>{'#  '}</Text>
                {cabecera.map((titulo, i) => (
                    <Text
                        key={i}
                        bold
                        backgroundColor={i === colSel ? COLORES.fondo : undefined}
                        color={i === colSel ? COLORES.acento : COLORES.titulo}
                    >
                        {titulo}{'  '}
                    </Text>
                ))}
            </Box>
            {datos.map((fila, f) => (
                <Box key={f}>
                    <Text color={COLORES.secundario}>{offset + f + 1}{'  '}</Text>
                    {fila.map((valor, c) => {
                        const activa = f === filaSel && c === colSel;
                        return (
                            <Text
                                key={c}
                                color={activa ? COLORES.fondo : COLORES.titulo}
                                backgroundColor={activa ? COLORES.acento : undefined}
                            >
                                {valor}{'  '}
                            </Text>
                        );
                    })}
                </Box>
            ))}
        </Box>
    );
}

// Tiene todo el estado y arma la pantalla completa.
function App() {
    async function leercsv(link) {
        const contenido = await readFile(link, 'utf-8')
        return contenido
        .trim()
        .split('\n')
        .map((fila)=>fila.split(','))
    }
    async function guardarcsv(nombre) {
        try {
            const contenido = [cabecera, ...datos].map(fila => fila.join(',')).join('\n') + '\n';
            await writeFile(nombre, contenido, 'utf-8');
            setError('')
            setModo('ver');
        } catch {
            setError(`No se pudo guardar "${nombre}"`)
            setModo('ver')
        }
    }
    async function editarcelda(valor) {
        setDatos(d =>{
            const copia = d.map(fila => [...fila])
            copia[filasel][colsel]= valor
            return copia
        })
        setModo('ver')
    }
    async function abrircsv(nombre) {
        try {
            const filas = await leercsv(nombre)
            setCabecera(filas[0])
            setDatos(filas.slice(1))
            setFilasel(0)
            setColsel(0)
            setOffset(0)
            setError('')
            setModo('ver')
        } catch {
            setError(`No se pudo abrir "${nombre}"`)
            setModo('ver')
        }
    }
    function ordenar(direccion) {
        setDatos(d =>{
            const copia = [...d]
            copia.sort((a,b)=>{
                const cmp = a[colsel].localeCompare(b[colsel], undefined, {numeric: true});
            return direccion === 'asc' ? cmp : -cmp;
            })
            return copia;
        })
    }
    const [modo, setModo] = useState('ver')
    const [cabecera, setCabecera] = useState(null);
    const [datos, setDatos] = useState(null);
    const [colsel, setColsel] = useState(0);
    const [filasel, setFilasel] = useState(0);
    const [offset, setOffset] = useState(0);
    const [error, setError] = useState('');
    useEffect(()=>{
        const archivoArg = process.argv[2];
        if (archivoArg) {
            abrircsv(archivoArg);
        } else {
            setModo('abrir');
        }
    },[])

    const {exit} = useApp();
    useInput((tecla, key) => {
        if (modo !== 'ver') {
            if (key.escape) setModo('ver'); // cancela y vuelve a ver la tabla
            return;
        }
        if (key.escape) { exit(); return; }
        if (!datos) return;
        if (tecla.toLowerCase()==='a') { setModo('abrir'); return; }
        if (tecla.toLowerCase()==='g') { setModo('guardar'); return; }
        if (tecla === '<') { ordenar('asc'); return; }
        if (tecla === '>') { ordenar('desc'); return; }
        if (key.return) { setModo('editar'); return; }
        if(key.downArrow){
            setFilasel(f => {
                const nueva = Math.min(f+1, datos.length-1);
                setOffset(o => nueva >= o + FILAS_VISIBLES ? nueva - FILAS_VISIBLES + 1 : o);
                return nueva;
            });
        }
        if(key.upArrow){
            setFilasel(f => {
                const nueva = Math.max(f-1, 0);
                setOffset(o => nueva < o ? nueva : o);
                return nueva;
            });
        }
        if(key.rightArrow)setColsel(c => Math.min(c+1, cabecera.length-1));
        if(key.leftArrow)setColsel(c => Math.max(c-1,0));
    })

    return (
        <Box width={COLUMNAS} height={FILAS} flexDirection="column" padding={1} borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
            {!datos ? (
                <Text color={COLORES.secundario}>Cargando...</Text>
            ) : (
                <>
                    <Box justifyContent="space-between">
                        <Text bold color={COLORES.titulo}>empleados.csv</Text>
                        <Text color={COLORES.secundario}>{datos.length} filas · {cabecera.length} columnas</Text>
                    </Box>
                    <Box marginBottom={1}>
                        <Text color={COLORES.secundario}>
                            Valor &gt; <Text color={COLORES.acento}>{datos[filasel][colsel]}</Text>
                        </Text>
                    </Box>

                    <Tabla
                        cabecera={cabecera}
                        datos={datos.slice(offset, offset + FILAS_VISIBLES)}
                        filaSel={filasel - offset}
                        colSel={colsel}
                        offset={offset}
                    />

                    <Box justifyContent="space-between" marginTop={1}>
                        <Text color={COLORES.secundario}>
                            <Text bold color={COLORES.acento}>A</Text> abrir · <Text bold color={COLORES.acento}>G</Text> guardar · <Text bold color={COLORES.acento}>Enter</Text> editar · <Text bold color={COLORES.acento}>{'<'}</Text> ascendente · <Text bold color={COLORES.acento}>{'>'}</Text> descendente · <Text bold color={COLORES.acento}>Esc</Text> salir
                        </Text>
                        <Text color={COLORES.secundario}>Fila {filasel + 1} · Columna {colsel + 1}</Text>
                    </Box>

                    {modo === 'guardar' && (
                        <Box>
                            <Text color={COLORES.acento}>Guardar como: </Text>
                            <TextInput onSubmit={guardarcsv} />
                        </Box>
                    )}
                    {modo === 'editar' && (
                        <Box>
                            <Text color={COLORES.acento}>Editar celda: </Text>
                            <TextInput defaultValue={datos[filasel][colsel]} onSubmit={editarcelda} />
                        </Box>
                    )}
                    {modo === 'abrir' && (
                        <Box>
                            <Text color={COLORES.acento}>Abrir archivo: </Text>
                            <TextInput onSubmit={abrircsv} />
                        </Box>
                    )}
                    {error && (
                        <Text color="#e06c75">{error}</Text>
                    )}
                </>
            )}
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();