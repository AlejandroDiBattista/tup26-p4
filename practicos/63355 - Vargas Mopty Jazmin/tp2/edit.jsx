#!/usr/bin/env -S node --import tsx

import React, {useState, useEffect} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS = process.stdout.rows || 24;

const COLORES = {
    fondo: '#161310',
    borde: '#726b61',
    titulo: '#ede7db',
    secundario: '#ada79e',
    acento: '#edbb64',
};

// RESOLUCIÓN 

function convertirCSV(texto) {
    const lineas = texto.replace(/\r/g, '').replace(/\n$/, '').split('\n');

    if (!lineas[0]?.trim()) {
        throw new Error('El archivo CSV está vacío');
    }

    const datos = lineas.map(linea => linea.split(','));
    const encabezados = datos[0];
    const filas = datos.slice(1);

    if (filas.some(f => f.length !== encabezados.length)) {
        throw new Error('Las filas tienen distinta cantidad de columnas');
    }

    return {encabezados, filas};
}

function generarCSV(encabezados, filas) {
    return [encabezados, ...filas]
        .map(fila => fila.join(','))
        .join('\n') + '\n';
}

function comparar(a, b) {
    const x = String(a).trim();
    const y = String(b).trim();

    if (
        x !== '' &&
        y !== '' &&
        Number.isFinite(Number(x)) &&
        Number.isFinite(Number(y))
    ) {
        return Number(x) - Number(y);
    }

    return x.localeCompare(y, 'es', {sensitivity: 'base'});
}

// Ajusta el contenido al ancho de cada columna.
function ajustar(valor, ancho) {
    const texto = String(valor ?? '');

    if (texto.length > ancho) {
        return texto.slice(0, ancho - 1) + '…';
    }

    return texto.padEnd(ancho);
}

function App() {
    const {exit} = useApp();

    // Datos del archivo.
    const [archivo, setArchivo] = useState(process.argv[2] || '');
    const [encabezados, setEncabezados] = useState([]);
    const [filas, setFilas] = useState([]);

    // Posición seleccionada.
    const [fila, setFila] = useState(0);
    const [columna, setColumna] = useState(0);

    // Desplazamiento de la tabla.
    const [inicio, setInicio] = useState(0);
    const [inicioColumna, setInicioColumna] = useState(0);

    // Estados de la interfaz.
    const [modo, setModo] = useState(
        process.argv[2] ? 'cargando' : 'abrir'
    );
    const [texto, setTexto] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [modificado, setModificado] = useState(false);

    const altoTabla = Math.max(1, FILAS - 12);
    const anchoTabla = Math.max(18, COLUMNAS - 12);

    // Calcula el ancho de cada columna.
    const anchos = encabezados.map((titulo, i) => {
        const largo = Math.max(
            9,
            titulo.length + 2,
            ...filas.map(f => String(f[i] ?? '').length + 2)
        );

        return Math.min(22, largo);
    });

    // Abrir un archivo.
    async function abrir(nombre) {
        if (!nombre.trim()) {
            setMensaje('Ingresá un nombre de archivo');
            setModo('normal');
            return;
        }

        try {
            const contenido = await readFile(nombre, 'utf8');
            const datos = convertirCSV(contenido);

            setArchivo(nombre);
            setEncabezados(datos.encabezados);
            setFilas(datos.filas);

            setFila(0);
            setColumna(0);
            setInicio(0);
            setInicioColumna(0);

            setModificado(false);
            setMensaje('Archivo abierto correctamente');
        } catch (error) {
            setMensaje('Error al abrir: ' + error.message);
        }

        setModo('normal');
    }

    async function guardar(nombre) {
        if (!nombre.trim()) {
            setMensaje('Ingresá un nombre de archivo');
            setModo('normal');
            return;
        }

        if (!encabezados.length) {
            setMensaje('No hay datos para guardar');
            setModo('normal');
            return;
        }

        try {
            const contenido = generarCSV(encabezados, filas);

            await writeFile(nombre, contenido, 'utf8');

            setArchivo(nombre);
            setModificado(false);
            setMensaje('Archivo guardado correctamente');
        } catch (error) {
            setMensaje('Error al guardar: ' + error.message);
        }

        setModo('normal');
    }

    // Editar la celda seleccionada.
    function editar(valor) {
        if (/[\r\n,"]/.test(valor)) {
            setMensaje(
                'No se permiten comas, comillas ni saltos de línea'
            );
            setModo('normal');
            return;
        }

        setFilas(actuales =>
            actuales.map((datos, i) =>
                i === fila
                    ? datos.map((celda, j) =>
                        j === columna ? valor : celda
                    )
                    : datos
            )
        );

        setModificado(true);
        setMensaje('Celda modificada');
        setModo('normal');
    }

    function ordenar(direccion) {
        if (!filas.length) return;

        setFilas(actuales =>
            [...actuales].sort((a, b) =>
                comparar(a[columna], b[columna]) * direccion
            )
        );

        setFila(0);
        setInicio(0);
        setModificado(true);

        setMensaje(
            direccion === 1
                ? 'Orden ascendente'
                : 'Orden descendente'
        );
    }

    useEffect(() => {
        if (process.argv[2]) {
            abrir(process.argv[2]);
        }
    }, []);

    // Controles del teclado.
    useInput((tecla, key) => {
        if (modo !== 'normal') {
            return;
        }

        if (key.escape) {
            exit();
            return;
        }

        if (tecla.toLowerCase() === 'a') {
            setTexto('');
            setModo('abrir');
            return;
        }

        if (tecla.toLowerCase() === 'g') {
            setTexto(archivo);
            setModo('guardar');
            return;
        }

        if (!encabezados.length) return;

        if (key.leftArrow) {
            setColumna(c => Math.max(0, c - 1));
            return;
        }

        if (key.rightArrow) {
            setColumna(c =>
                Math.min(encabezados.length - 1, c + 1)
            );
            return;
        }

        if (key.upArrow) {
            setFila(f => Math.max(0, f - 1));
            return;
        }

        if (key.downArrow) {
            setFila(f =>
                Math.min(filas.length - 1, f + 1)
            );
            return;
        }

        if (key.return && filas.length) {
            setTexto(filas[fila][columna]);
            setModo('editar');
            return;
        }

        if (tecla === '<') {
            ordenar(1);
            return;
        }

        if (tecla === '>') {
            ordenar(-1);
        }
    }, {isActive: modo === 'normal'});

    // Desplazamiento vertical.
    useEffect(() => {
        setInicio(actual => {
            if (fila < actual) {
                return fila;
            }

            if (fila >= actual + altoTabla) {
                return fila - altoTabla + 1;
            }

            return actual;
        });
    }, [fila, altoTabla]);

    useEffect(() => {
        if (columna < inicioColumna) {
            setInicioColumna(columna);
            return;
        }

        let ancho = 5;

        for (let i = inicioColumna; i <= columna; i++) {
            ancho += anchos[i] || 9;
        }

        if (ancho > anchoTabla) {
            setInicioColumna(columna);
        }
    }, [columna, inicioColumna, anchoTabla, encabezados, filas]);

    // Columnas visibles en pantalla.
    const columnasVisibles = [];
    let ocupado = 5;

    for (let i = inicioColumna; i < encabezados.length; i++) {
        if (
            columnasVisibles.length > 0 &&
            ocupado + anchos[i] > anchoTabla
        ) {
            break;
        }

        columnasVisibles.push(i);
        ocupado += anchos[i];
    }

    return (
        <Box
            width={COLUMNAS}
            height={FILAS}
            justifyContent="center"
            alignItems="center"
        >
            <Box
                width={Math.min(COLUMNAS, Math.max(44, COLUMNAS - 2))}
                height={Math.min(FILAS, Math.max(12, FILAS - 2))}
                flexDirection="column"
                borderStyle="round"
                borderColor={COLORES.borde}
                backgroundColor={COLORES.fondo}
                paddingX={1}
            >
                {/* Encabezado */}
                <Box justifyContent="space-between">
                    <Text bold color={COLORES.titulo}>
                        Editor CSV — {
                            archivo ? basename(archivo) : 'sin archivo'
                        }
                        {modificado ? ' *' : ''}
                    </Text>

                    <Text color={COLORES.secundario}>
                        {filas.length} filas
                    </Text>
                </Box>

                {/* Campo de entrada */}
                <Box marginY={1}>
                    {['abrir', 'guardar', 'editar'].includes(modo) ? (
                        <>
                            <Text color={COLORES.acento}>
                                {modo === 'abrir'
                                    ? 'Abrir archivo: '
                                    : modo === 'guardar'
                                        ? 'Guardar como: '
                                        : 'Nuevo valor: '}
                            </Text>

                            <TextInput
                                key={`${modo}-${fila}-${columna}`}
                                defaultValue={texto}
                                onSubmit={valor => {
                                    if (modo === 'abrir') {
                                        abrir(valor);
                                    } else if (modo === 'guardar') {
                                        guardar(valor);
                                    } else {
                                        editar(valor);
                                    }
                                }}
                            />
                        </>
                    ) : (
                        <Text color={COLORES.secundario}>
                            Celda: {filas[fila]?.[columna] ?? ''}
                        </Text>
                    )}
                </Box>

                {/* Tabla de datos */}
                {encabezados.length > 0 ? (
                    <Box flexDirection="column" flexGrow={1}>
                        <Box>
                            <Text color={COLORES.secundario}>
                                {' #   '}
                            </Text>

                            {columnasVisibles.map(i => (
                                <Text
                                    key={i}
                                    bold
                                    color={
                                        i === columna
                                            ? COLORES.acento
                                            : COLORES.titulo
                                    }
                                >
                                    {ajustar(encabezados[i], anchos[i])}
                                </Text>
                            ))}
                        </Box>

                        {filas
                            .slice(inicio, inicio + altoTabla)
                            .map((datos, indice) => {
                                const numero = inicio + indice;

                                return (
                                    <Box key={numero}>
                                        <Text
                                            color={
                                                numero === fila
                                                    ? COLORES.acento
                                                    : COLORES.secundario
                                            }
                                        >
                                            {String(numero + 1).padStart(3)}
                                            {'  '}
                                        </Text>

                                        {columnasVisibles.map(i => {
                                            const activa =
                                                numero === fila &&
                                                i === columna;

                                            return (
                                                <Text
                                                    key={i}
                                                    color={
                                                        activa
                                                            ? COLORES.fondo
                                                            : COLORES.titulo
                                                    }
                                                    backgroundColor={
                                                        activa
                                                            ? COLORES.acento
                                                            : undefined
                                                    }
                                                    bold={activa}
                                                >
                                                    {ajustar(
                                                        datos[i],
                                                        anchos[i]
                                                    )}
                                                </Text>
                                            );
                                        })}
                                    </Box>
                                );
                            })}
                    </Box>
                ) : (
                    <Box
                        flexGrow={1}
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Text color={COLORES.secundario}>
                            Abrí un CSV para comenzar
                        </Text>
                    </Box>
                )}

                {/* Mensajes */}
                <Box>
                    <Text color={COLORES.acento}>
                        {mensaje}
                    </Text>
                </Box>

                {/* Controles */}
                <Box>
                    <Text color={COLORES.secundario} wrap="truncate">
                        {modo === 'normal'
                            ? 'Flechas mover · Enter editar · A abrir · G guardar · < asc · > desc · Esc salir'
                            : 'Enter confirmar · Esc cancelar'}
                    </Text>
                </Box>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();
