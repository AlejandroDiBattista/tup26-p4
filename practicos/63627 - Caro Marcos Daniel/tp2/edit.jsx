#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile, writeFile } from 'node:fs/promises';
import { TextInput } from '@inkjs/ui';
import { basename } from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;
const MAX_FILAS_VISIBLES = 12; // Cuántas filas muestro a la vez para no romper la pantalla

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};

function App() {
    const { exit } = useApp();

    // Mis estados para guardar los datos del archivo
    const [archivo, setArchivo] = useState(process.argv[2] || '');
    const [cabeceras, setCabeceras] = useState([]);
    const [filas, setFilas] = useState([]);

    // Guardo donde estoy parado con el cursor
    const [filaAct, setFilaAct] = useState(0);
    const [colAct, setColAct] = useState(0);

    // Para saber qué pantalla mostrar ('normal', 'editar', 'abrir', 'guardar', 'error')
    const [modo, setModo] = useState('normal');
    const [textoTemp, setTextoTemp] = useState(''); // Lo uso para los inputs
    const [mensajeInfo, setMensajeInfo] = useState(''); // Para mostrar errores

    // Arranco leyendo el archivo si me lo pasaron por la terminal
    useEffect(() => {
        if (archivo !== '') {
            leerArchivo(archivo);
        }
    }, []);

    // Función para abrir y separar los datos
    const leerArchivo = async (ruta) => {
        try {
            const contenido = await readFile(ruta, 'utf-8');
            // Separo las líneas y saco las que estén vacías
            const lineas = contenido.split('\n').filter(linea => linea.trim() !== '');
            
            if (lineas.length > 0) {
                // La primer línea tiene los títulos de las columnas
                setCabeceras(lineas[0].split(','));
                
                const filasNuevas = [];
                // Hago un for normal para guardar las filas de datos
                for (let i = 1; i < lineas.length; i++) {
                    filasNuevas.push(lineas[i].split(','));
                }
                
                setFilas(filasNuevas);
                setArchivo(ruta);
                setFilaAct(0);
                setColAct(0);
                setModo('normal');
            }
        } catch (error) {
            setMensajeInfo('No pude abrir el archivo. Revisá que el nombre esté bien.');
            setModo('error');
        }
    };

    // Función para guardar los cambios
    const guardarArchivo = async (ruta) => {
        try {
            const lineas = [];
            // Uno las cabeceras con comas y las meto primero
            lineas.push(cabeceras.join(','));
            
            // Hago lo mismo con cada fila de datos
            for (let i = 0; i < filas.length; i++) {
                lineas.push(filas[i].join(','));
            }
            
            // Junto todo con un salto de línea
            const textoFinal = lineas.join('\n');
            await writeFile(ruta, textoFinal, 'utf-8');
            
            setArchivo(ruta);
            setModo('normal');
        } catch (error) {
            setMensajeInfo('Error al intentar guardar el archivo.');
            setModo('error');
        }
    };

    // Lógica basica para ordenar las filas
    const ordenarFilas = (direccion) => {
        if (filas.length === 0) return;

        // Hago una copia para no modificar el estado de una
        const copia = [...filas];

        copia.sort((a, b) => {
            const valorA = a[colAct];
            const valorB = b[colAct];

            // Trato de ver si son números para ordenarlos bien (como la edad o el sueldo)
            const numA = Number(valorA);
            const numB = Number(valorB);

            if (!isNaN(numA) && !isNaN(numB)) {
                if (direccion === 'ascendente') return numA - numB;
                else return numB - numA;
            } else {
                // Si es texto normal, comparo las palabras
                if (valorA > valorB) return direccion === 'ascendente' ? 1 : -1;
                if (valorA < valorB) return direccion === 'ascendente' ? -1 : 1;
                return 0;
            }
        });

        setFilas(copia);
    };

    // Capturo las teclas del teclado
    useInput((tecla, key) => {
        // Si aprieto escape, salgo de donde esté
        if (key.escape) {
            if (modo === 'normal') {
                exit();
            } else {
                setModo('normal');
                setMensajeInfo('');
            }
            return;
        }

        // Toda esta navegación funciona solo si estoy en modo normal
        if (modo === 'normal') {
            // Me muevo con las flechas cuidando de no salirme de los bordes
            if (key.upArrow && filaAct > 0) setFilaAct(filaAct - 1);
            if (key.downArrow && filaAct < filas.length - 1) setFilaAct(filaAct + 1);
            if (key.leftArrow && colAct > 0) setColAct(colAct - 1);
            if (key.rightArrow && colAct < cabeceras.length - 1) setColAct(colAct + 1);

            // Acciones de teclas
            if (tecla === 'a' || tecla === 'A') {
                setTextoTemp('');
                setModo('abrir');
            }
            if (tecla === 'g' || tecla === 'G') {
                setTextoTemp(archivo);
                setModo('guardar');
            }
            if (key.return && filas.length > 0) {
                setTextoTemp(filas[filaAct][colAct]);
                setModo('editar');
            }
            if (tecla === '<' && filas.length > 0) ordenarFilas('ascendente');
            if (tecla === '>' && filas.length > 0) ordenarFilas('descendente');
        }
    });

    // Cuando aprieto enter en un input, defino qué hacer
    const alEnviarInput = (valor) => {
        if (modo === 'abrir') {
            leerArchivo(valor);
        } else if (modo === 'guardar') {
            guardarArchivo(valor);
        } else if (modo === 'editar') {
            // Actualizo la celda específica
            const filasNuevas = [...filas];
            filasNuevas[filaAct][colAct] = valor;
            setFilas(filasNuevas);
            setModo('normal');
        }
    };

    // Lógica para que la vista baje o suba según donde esté parado
    let primerFilaVisible = 0;
    if (filaAct >= MAX_FILAS_VISIBLES) {
        primerFilaVisible = filaAct - MAX_FILAS_VISIBLES + 1;
    }
    const filasParaMostrar = filas.slice(primerFilaVisible, primerFilaVisible + MAX_FILAS_VISIBLES);

    return (
        <Box width={COLUMNAS} height={FILAS} backgroundColor={COLORES.fondo} flexDirection="column" paddingX={1}>
            
            {/* --- CABECERA --- */}
            <Box justifyContent="space-between" paddingY={1}>
                <Text bold color={COLORES.titulo}>{basename(archivo) || 'Nuevo Archivo'}</Text>
                <Text color={COLORES.secundario}>{filas.length} filas · {cabeceras.length} columnas</Text>
            </Box>

            {/* --- BARRA DE ACCIONES (Inputs) --- */}
            <Box height={1} marginBottom={1}>
                {modo === 'abrir' && (
                    <Box><Text bold color={COLORES.acento}>Abrir {'>'} </Text><TextInput value={textoTemp} onChange={setTextoTemp} onSubmit={alEnviarInput} /></Box>
                )}
                {modo === 'guardar' && (
                    <Box><Text bold color={COLORES.acento}>Guardar {'>'} </Text><TextInput value={textoTemp} onChange={setTextoTemp} onSubmit={alEnviarInput} /></Box>
                )}
                {modo === 'editar' && (
                    <Box><Text color={COLORES.secundario}>Valor {'>'} </Text><TextInput value={textoTemp} onChange={setTextoTemp} onSubmit={alEnviarInput} /></Box>
                )}
                {modo === 'error' && (
                    <Text color="red">{mensajeInfo}</Text>
                )}
            </Box>

            {/* --- TABLA PRINCIPAL --- */}
            <Box flexDirection="column" flexGrow={1}>
                {/* Títulos de las columnas */}
                <Box>
                    <Box width={6}><Text bold color={COLORES.secundario}>#</Text></Box>
                    {cabeceras.map((titulo, i) => {
                        const esColumnaActiva = (i === colAct);
                        return (
                            <Box key={`head-${i}`} width={18}>
                                <Text bold backgroundColor={esColumnaActiva ? COLORES.acento : undefined} color={esColumnaActiva ? 'black' : COLORES.acento}>
                                    {titulo.toUpperCase()}
                                </Text>
                            </Box>
                        );
                    })}
                </Box>

                {/* Filas de datos */}
                {filasParaMostrar.map((fila, indexRelativo) => {
                    const indexReal = primerFilaVisible + indexRelativo;
                    return (
                        <Box key={`row-${indexReal}`}>
                            <Box width={6}>
                                <Text color={COLORES.secundario}>{indexReal + 1}</Text>
                            </Box>
                            {fila.map((celda, iColumna) => {
                                const estaSeleccionada = (indexReal === filaAct && iColumna === colAct);
                                return (
                                    <Box key={`cell-${indexReal}-${iColumna}`} width={18}>
                                        <Text wrap="truncate" backgroundColor={estaSeleccionada ? '#e0e0e0' : undefined} color={estaSeleccionada ? 'black' : COLORES.titulo}>
                                            {celda}
                                        </Text>
                                    </Box>
                                );
                            })}
                        </Box>
                    );
                })}
            </Box>

            {/* --- FOOTER --- */}
            <Box justifyContent="space-between" marginTop={1}>
                {modo === 'normal' || modo === 'error' ? (
                    <Text color={COLORES.secundario}>
                        <Text bold color={COLORES.acento}>A</Text> abrir · <Text bold color={COLORES.acento}>G</Text> guardar · <Text bold color={COLORES.acento}>Enter</Text> editar · <Text bold color={COLORES.acento}>{'<'}</Text> ascendente · <Text bold color={COLORES.acento}>{'>'}</Text> descendente · <Text bold color={COLORES.acento}>Esc</Text> salir
                    </Text>
                ) : (
                    <Text color={COLORES.secundario}>
                        <Text bold color={COLORES.acento}>Enter</Text> {modo === 'editar' ? 'guardar' : modo} · <Text bold color={COLORES.acento}>Esc</Text> cancelar
                    </Text>
                )}
                <Text color={COLORES.secundario}>Fila {filaAct + 1} · Columna {colAct + 1}</Text>
            </Box>

        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();