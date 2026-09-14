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

const archivoInicial = process.argv[2];
const TAMANIO_PAGINA = 8;

function App() {
    const {exit} = useApp();
    
    const [nombreArchivo, setNombreArchivo] = useState(basename(archivoInicial));
    const [cabecera, setCabecera] = useState([]);
    const [filas, setFilas] = useState([]);
    const [error, setError] = useState('');
    const [modo, setModo] = useState(archivoInicial ? 'VER' : 'ABRIR');
    const [filaSel, setFilaSel] = useState(0);
    const [colSel, setColSel] = useState(0);

    const cargarCSV = async (path) => {
        try {
            const contenido = await readFile(path, 'utf-8');
            const lineas = contenido.trim().split('\n').map(l => l.trim()).filter(Boolean);

            if (lineas.length === 0) {
                setError('El archivo CSV está vacío.');
                return;
            }

            const primeraLinea = lineas[0].split(',').map(c => c.trim());
            const restoLineas = lineas.slice(1).map(l => l.split(',').map(c => c.trim()));

            setCabecera(primeraLinea);
            setFilas(restoLineas);
            setNombreArchivo(basename(path));
            setError('');
            setFilaSel(0);
            setColSel(0);
            setModo('VER');
        } catch (e) {
            setError(`Error al leer el archivo: ${e.message}`);
        }
    };

    const guardarCSV = async (path) => {
        try {
            const lineas = [
                cabecera.join(','),
                ...filas.map(f => f.join(',')),
            ];
            await writeFile(path, lineas.join('\n'), 'utf-8');
            setNombreArchivo(basename(path));
            setError('');
            setModo('VER');
        } catch (e) {
            setError(`Error al guardar el archivo: ${e.message}`);
        }
    };

    const guardarCelda = (nuevoValor) => {
        const nuevasFilas = [...filas];
        nuevasFilas[filaSel][colSel] = nuevoValor;
        setFilas(nuevasFilas);
        setModo('VER');
    };

    const ordenarAscendente = () => {
        if(filas.length === 0) return;
        const copia = [...filas];
        copia.sort ((a,b) => a[colSel].localeCompare(b[colSel], undefined, {numeric: true}));
        setFilas(copia);
    };

    
    const ordenarDescendente = () => {
        if(filas.length === 0) return;
        const copia = [...filas];
        copia.sort ((a,b) => b[colSel].localeCompare(a[colSel], undefined, {numeric: true}));
        setFilas(copia);
    }
    
    useEffect(() => {
        if (archivoInicial) {
            cargarCSV(archivoInicial);
        }
    }, []);

    const paginaActual = Math.floor(filaSel / TAMANIO_PAGINA);
    const indiceInicio = paginaActual * TAMANIO_PAGINA;
    const filasPagina = filas.slice(indiceInicio, indiceInicio + TAMANIO_PAGINA);

    useInput((input, key) => {
        if (key.escape) {
            if (modo !=="VER") {
                setModo("VER");
                setError('');
            } else {
            exit();
            }
            return;
        }

        if (modo === 'VER') {
            if (key.upArrow) setFilaSel(prev => Math.max(0, prev - 1));
            if (key.downArrow) setFilaSel(prev => Math.min(filas.length - 1, prev + 1));
            if (key.leftArrow) setColSel(prev => Math.max(0, prev - 1));
            if (key.rightArrow) setColSel(prev => Math.min(cabecera.length - 1, prev + 1));
            
            if (input === 'a' || input === 'A') setModo('ABRIR');
            if (input === 'g' || input === 'G') setModo('GUARDAR');
            if (key.return && filas.length > 0) setModo('EDITAR');
            if (input === '<') ordenarAscendente();
            if (input === '>') ordenarDescendente();
        }
    });

    const valorCelda = filas[filaSel]?.[colSel] ?? '';

    if (modo === 'ABRIR' || modo === 'GUARDAR') {
        const esAbrir = modo ==='ABRIR';
    
        return (
            <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center" backgroundColor={COLORES.fondo}>
                <Box flexDirection="column" borderStyle="round" borderColor={COLORES.borde} padding={1} width={50}>
                    <Text bold color={COLORES.titulo}>
                        {esAbrir ? 'Abrir archivo CSV' : 'Guardar archivo CSV'}
                    </Text>

                    <Box marginTop={1}>
                        <Text color={COLORES.secundario}>Nombre del Archivo: </Text>
                        <TextInput defaultValue={esAbrir ? '': nombreArchivo}
                        onSubmit={(val) => esAbrir ? cargarCSV(val) : guardarCSV(val)} 
                        />
                    </Box>

                    {error ? <Text color="red" marginTop={1}>{error}</Text> : null}

                    <Text color={COLORES.secundario} marginTop={1}>
                        <Text bold color={COLORES.acento}>[ENTER]</Text> Confirmar | <Text bold color={COLORES.acento}>[ESC]</Text> Cancelar
                    </Text>
                </Box>
            </Box>
        );
    }
    
    return (
        <Box width={COLUMNAS} height={FILAS} flexDirection="column" padding={1} backgroundColor={COLORES.fondo}>
            <Box flexDirection="column" marginBottom={1}>
                <Text bold color={COLORES.titulo}>
                    <Text color={COLORES.acento}>{nombreArchivo || 'Sin Archivo'}</Text>
                </Text>
                <Text color={COLORES.secundario}>
                    Filas: {filas.length} | Columnas: {cabecera.length} 
                </Text>
                <Text color={COLORES.secundario}>
                    Celda seleccionada: [{filaSel +1}, {colSel + 1}] ({cabecera[colSel] || ''}) = <Text bold color={COLORES.acento}>"{valorCelda}"</Text>
                </Text>
            </Box>

            {/* Filas paginas */}
            {filasPagina.map((fila, index) => {
                const absIdx = indiceInicio + relIdx;
                return (
                    <Box key={absIdx}>
                        <Box width={5}>
                            <Text color={COLORES.secundario}>{absIdx + 1}</Text>
                        </Box>
                        {fila.map((celda, colIdx) => {
                            const Seleccionada = absIdx === filaSel && colIdx === colSel;
                            return (
                                <Box key={colIdx} width={15}>
                                    <Text backgroundColor={seleccionada ? COLORES.acento : undefined} color={seleccionada ? COLORES.fondo : COLORES.titulo} bold={seleccionada}>
                                        {celda}
                                    </Text>
                                </Box>
                            );
                        })}
                    </Box>
                );
            })}
        </Box>

        
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();