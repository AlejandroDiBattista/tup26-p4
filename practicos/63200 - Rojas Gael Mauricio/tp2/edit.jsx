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
 
// Nombre del archivo pasado por la terminal: edit empleados.csv
const argumento = process.argv[2];
 
// ---------- Medidas de la tabla ----------
const ANCHO_CELDA = 14; // ancho de cada columna
const ANCHO_NUM   = 5;  // ancho de la columna con el número de fila
// Cuántas columnas y filas entran en pantalla (el resto se ve desplazando)
const COLUMNAS_VISIBLES = Math.max(1, Math.floor((COLUMNAS - 2 - ANCHO_NUM) / ANCHO_CELDA));
const FILAS_VISIBLES    = Math.max(1, FILAS - 8);
 
// ---------- Funciones auxiliares ----------
 
// Deja el texto con un ancho fijo: lo corta si es largo y lo rellena si es corto
function ajustar(texto) {
    const maximo = ANCHO_CELDA - 2;
    const recortado = texto.length > maximo ? texto.slice(0, maximo - 1) + '…' : texto;
    return ' ' + recortado.padEnd(maximo) + ' ';
}
 
// Compara dos valores: como números si ambos lo son, si no como texto
function comparar(a, b) {
    const numA = Number(a);
    const numB = Number(b);
    if (a !== '' && b !== '' && !isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
    }
    return a.localeCompare(b);
}
 
// Muestra una tecla resaltada con su descripción: "Esc salir"
function Atajo({tecla, texto}) {
    return <Text color={COLORES.secundario}><Text bold color={COLORES.acento}>{tecla}</Text> {texto}   </Text>;
}
 
// Ventana centrada para pedir el nombre de un archivo (abrir / guardar)
function Dialogo({titulo, valorInicial, mensaje, textoEsc, onEnviar}) {
    return (
        <Box width={COLUMNAS} height={FILAS - 1} justifyContent="center" alignItems="center">
            <Box width={50} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo} paddingX={1}>
                <Text bold color={COLORES.titulo}>{titulo}</Text>
                <Text color={COLORES.secundario}>Nombre del archivo:</Text>
                <TextInput defaultValue={valorInicial} onSubmit={onEnviar} />
                <Text color={mensaje?.error ? 'red' : COLORES.secundario}>{mensaje ? mensaje.texto : ' '}</Text>
                <Box>
                    <Atajo tecla="Enter" texto="confirmar" />
                    <Atajo tecla="Esc" texto={textoEsc} />
                </Box>
            </Box>
        </Box>
    );
}
 
// ---------- Aplicación ----------
 
function App() {
    const {exit} = useApp();
 
    // modo: 'cargando' | 'abrir' | 'tabla' | 'editar' | 'guardar'
    const [modo, setModo] = useState(argumento ? 'cargando' : 'abrir');
    const [archivo, setArchivo] = useState(null);   // nombre del archivo abierto
    const [cabecera, setCabecera] = useState([]);   // ['Nombre', 'Edad', ...]
    const [filas, setFilas] = useState([]);         // [['Ana', '30'], ['Luis', '25'], ...]
    const [fila, setFila] = useState(0);            // fila seleccionada
    const [columna, setColumna] = useState(0);      // columna seleccionada
    const [inicioFila, setInicioFila] = useState(0); // primera fila visible
    const [inicioCol, setInicioCol] = useState(0);   // primera columna visible
    const [mensaje, setMensaje] = useState(null);   // {texto, error}
 
    // Si se pasó un archivo por argumento, se abre al iniciar
    useEffect(() => {
        if (argumento) {
            abrirArchivo(argumento);
        }
    }, []);
 
    async function abrirArchivo(nombre) {
        if (nombre.trim() === '') {
            setMensaje({texto: 'Escribí un nombre de archivo', error: true});
            return;
        }
        try {
            const texto = await readFile(nombre.trim(), 'utf8');
            const lineas = texto
                .split('\n')
                .map(linea => linea.replace('\r', ''))
                .filter(linea => linea !== '');
            if (lineas.length === 0) {
                throw new Error('el archivo está vacío');
            }
            const todas = lineas.map(linea => linea.split(','));
 
            setCabecera(todas[0]);
            setFilas(todas.slice(1));
            setArchivo(nombre.trim());
            setFila(0);
            setColumna(0);
            setInicioFila(0);
            setInicioCol(0);
            setMensaje(null);
            setModo('tabla');
        } catch (error) {
            const motivo = error.code === 'ENOENT' ? 'el archivo no existe' : error.message;
            setMensaje({texto: `No se pudo abrir: ${motivo}`, error: true});
            setModo('abrir');
        }
    }
 
    async function guardarArchivo(nombre) {
        if (nombre.trim() === '') {
            setMensaje({texto: 'Escribí un nombre de archivo', error: true});
            return;
        }
        try {
            const lineas = [cabecera, ...filas].map(f => f.join(','));
            await writeFile(nombre.trim(), lineas.join('\n') + '\n');
            setArchivo(nombre.trim());
            setMensaje({texto: `Guardado en ${nombre.trim()}`, error: false});
            setModo('tabla');
        } catch (error) {
            setMensaje({texto: `No se pudo guardar: ${error.message}`, error: true});
        }
    }
 
    // Cambia la celda seleccionada y desplaza la vista si hace falta
    function mover(nuevaFila, nuevaColumna) {
        nuevaFila = Math.max(0, Math.min(nuevaFila, filas.length - 1));
        nuevaColumna = Math.max(0, Math.min(nuevaColumna, cabecera.length - 1));
        setFila(nuevaFila);
        setColumna(nuevaColumna);
 
        if (nuevaFila < inicioFila) {
            setInicioFila(nuevaFila);
        }
        if (nuevaFila >= inicioFila + FILAS_VISIBLES) {
            setInicioFila(nuevaFila - FILAS_VISIBLES + 1);
        }
        if (nuevaColumna < inicioCol) {
            setInicioCol(nuevaColumna);
        }
        if (nuevaColumna >= inicioCol + COLUMNAS_VISIBLES) {
            setInicioCol(nuevaColumna - COLUMNAS_VISIBLES + 1);
        }
    }
 
    // sentido: 1 = ascendente, -1 = descendente
    function ordenar(sentido) {
        const copia = [...filas];
        copia.sort((a, b) => sentido * comparar(a[columna], b[columna]));
        setFilas(copia);
        const direccion = sentido === 1 ? 'ascendente' : 'descendente';
        setMensaje({texto: `Ordenado por "${cabecera[columna]}" (${direccion})`, error: false});
    }
 
    function cambiarCelda(valor) {
        const copia = filas.map(f => [...f]);
        copia[fila][columna] = valor;
        setFilas(copia);
        setModo('tabla');
    }
 
    useInput((tecla, key) => {
        // Esc: cancela la acción actual o sale
        if (key.escape) {
            if (modo === 'tabla' || (modo === 'abrir' && !archivo)) {
                exit();
            } else if (modo !== 'cargando') {
                setMensaje(null);
                setModo('tabla');
            }
            return;
        }
 
        // Las demás teclas solo funcionan mirando la tabla
        // (en los otros modos escribe el TextInput)
        if (modo !== 'tabla') {
            return;
        }
 
        setMensaje(null);
 
        if (key.upArrow) {
            mover(fila - 1, columna);
        } else if (key.downArrow) {
            mover(fila + 1, columna);
        } else if (key.leftArrow) {
            mover(fila, columna - 1);
        } else if (key.rightArrow) {
            mover(fila, columna + 1);
        } else if (key.return) {
            if (filas.length > 0) {
                setModo('editar');
            }
        } else if (tecla === '<') {
            ordenar(1);
        } else if (tecla === '>') {
            ordenar(-1);
        } else if (tecla === 'a' || tecla === 'A') {
            setModo('abrir');
        } else if (tecla === 'g' || tecla === 'G') {
            setModo('guardar');
        }
    });
 
    // ----- Pantallas -----
 
    if (modo === 'cargando') {
        return <Text color={COLORES.secundario}>Abriendo {argumento}...</Text>;
    }
 
    if (modo === 'abrir') {
        return (
            <Dialogo
                titulo="Abrir archivo"
                valorInicial=""
                mensaje={mensaje}
                textoEsc={archivo ? 'cancelar' : 'salir'}
                onEnviar={abrirArchivo}
            />
        );
    }
 
    if (modo === 'guardar') {
        return (
            <Dialogo
                titulo="Guardar archivo"
                valorInicial={archivo}
                mensaje={mensaje}
                textoEsc="cancelar"
                onEnviar={guardarArchivo}
            />
        );
    }
 
    // Pantalla de la tabla (modos 'tabla' y 'editar')
    const columnasVisibles = cabecera.slice(inicioCol, inicioCol + COLUMNAS_VISIBLES);
    const filasVisibles = filas.slice(inicioFila, inicioFila + FILAS_VISIBLES);
    const valorActual = filas[fila]?.[columna] ?? '';
 
    return (
        <Box width={COLUMNAS} height={FILAS - 1} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
 
            {/* Título: nombre del archivo y tamaño */}
            <Box justifyContent="space-between" paddingX={1}>
                <Text bold color={COLORES.titulo}>{basename(archivo)}</Text>
                <Text color={COLORES.secundario}>{filas.length} filas × {cabecera.length} columnas</Text>
            </Box>
 
            {/* Tabla */}
            <Box flexDirection="column" flexGrow={1}>
                <Box>
                    <Text>{' '.repeat(ANCHO_NUM)}</Text>
                    {columnasVisibles.map((nombre, i) => (
                        <Text key={i} bold color={inicioCol + i === columna ? COLORES.acento : COLORES.titulo}>
                            {ajustar(nombre)}
                        </Text>
                    ))}
                </Box>
 
                {filasVisibles.map((datosFila, i) => {
                    const numeroFila = inicioFila + i;
                    return (
                        <Box key={numeroFila}>
                            <Text color={COLORES.secundario}>{String(numeroFila + 1).padStart(ANCHO_NUM - 1) + ' '}</Text>
                            {datosFila.slice(inicioCol, inicioCol + COLUMNAS_VISIBLES).map((valor, j) => {
                                const numeroCol = inicioCol + j;
                                const seleccionada = numeroFila === fila && numeroCol === columna;
                                return (
                                    <Text
                                        key={numeroCol}
                                        backgroundColor={seleccionada ? COLORES.acento : undefined}
                                        color={seleccionada ? COLORES.fondo : COLORES.titulo}
                                    >
                                        {ajustar(valor)}
                                    </Text>
                                );
                            })}
                        </Box>
                    );
                })}
            </Box>
 
            {/* Pie: celda seleccionada, mensaje o editor, y atajos */}
            <Box paddingX={1}>
                <Text color={COLORES.titulo} wrap="truncate-end">
                    Fila {fila + 1}, columna {columna + 1} ({cabecera[columna]}): {valorActual}
                </Text>
            </Box>
 
            <Box paddingX={1} height={1}>
                {modo === 'editar' ? (
                    <>
                        <Text color={COLORES.acento}>Editar: </Text>
                        <TextInput defaultValue={valorActual} onSubmit={cambiarCelda} />
                    </>
                ) : (
                    <Text color={mensaje?.error ? 'red' : COLORES.acento}>{mensaje ? mensaje.texto : ' '}</Text>
                )}
            </Box>
 
            <Box paddingX={1}>
                {modo === 'editar' ? (
                    <>
                        <Atajo tecla="Enter" texto="aceptar" />
                        <Atajo tecla="Esc" texto="cancelar" />
                    </>
                ) : (
                    <>
                        <Atajo tecla="←↑↓→" texto="mover" />
                        <Atajo tecla="Enter" texto="editar" />
                        <Atajo tecla="< >" texto="ordenar" />
                        <Atajo tecla="A" texto="abrir" />
                        <Atajo tecla="G" texto="guardar" />
                        <Atajo tecla="Esc" texto="salir" />
                    </>
                )}
            </Box>
        </Box>
    );
}
 
const app = render(<App />);
await app.waitUntilExit();
console.clear();
 