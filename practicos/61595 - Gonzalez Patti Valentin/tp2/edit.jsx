
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { existsSync } from 'node:fs';

const COLUMNAS = process.stdout.columns || 80;
const FILAS = process.stdout.rows || 24;

const COLORES = {
    fondo: '#161310',
    borde: '#726b61',
    titulo: '#ede7db',
    secundario: '#ada79e',
    acento: '#edbb64',
};

const ANCHO_COLUMNA = 18;

function leerCSV(contenido) {
    const lineas = contenido
        .replace(/^\uFEFF/, '')
        .trimEnd()
        .split(/\r?\n/);

    if (lineas.length === 0 || !lineas[0]) {
        throw new Error('El archivo CSV está vacío.');
    }

    const cabecera = lineas[0].split(',');

    if (cabecera.some(campo => campo === '')) {
        throw new Error('La cabecera contiene campos vacíos.');
    }

    const filas = lineas.slice(1).map(linea => linea.split(','));

    if (filas.some(fila => fila.length !== cabecera.length)) {
        throw new Error(
            'Todas las filas deben tener la misma cantidad de columnas.'
        );
    }

    return { cabecera, filas };
}

function serializarCSV(cabecera, filas) {
    return [cabecera, ...filas]
        .map(fila => fila.join(','))
        .join('\n') + '\n';
}

function compararValores(a, b) {
    const numeroA = Number(a);
    const numeroB = Number(b);

    if (a.trim() !== '' && b.trim() !== '' &&
        Number.isFinite(numeroA) && Number.isFinite(numeroB)) {
        return numeroA - numeroB;
    }

    return a.localeCompare(b, 'es', {
        sensitivity: 'base',
        numeric: true,
    });
}

function App() {
    const { exit } = useApp();

    const [cabecera, setCabecera] = useState([]);
    const [datos, setDatos] = useState([]);
    const [archivo, setArchivo] = useState('');
    const [filaSeleccionada, setFilaSeleccionada] = useState(0);
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);

    const [modo, setModo] = useState('normal');
    const [texto, setTexto] = useState('');
    const [mensaje, setMensaje] = useState(
        'Presioná A para abrir un archivo CSV.'
    );
    const [error, setError] = useState(false);
    const [cargando, setCargando] = useState(false);

    const hayArchivo = cabecera.length > 0;
    const totalFilas = datos.length;
    const totalColumnas = cabecera.length;

    async function abrirArchivo(nombre) {
        const ruta = resolve(nombre.trim());

        if (!nombre.trim()) {
            throw new Error('Ingresá el nombre del archivo.');
        }

        const contenido = await readFile(ruta, 'utf8');
        const resultado = leerCSV(contenido);

        setCabecera(resultado.cabecera);
        setDatos(resultado.filas);
        setArchivo(ruta);
        setFilaSeleccionada(0);
        setColumnaSeleccionada(0);
        setMensaje(`Archivo abierto: ${basename(ruta)}`);
        setError(false);
    }

    async function guardarArchivo(nombre) {
        if (!hayArchivo) {
            throw new Error('Primero tenés que abrir un archivo CSV.');
        }

        const ruta = resolve(nombre.trim());

        if (!nombre.trim()) {
            throw new Error('Ingresá el nombre del archivo.');
        }

        await writeFile(
            ruta,
            serializarCSV(cabecera, datos),
            'utf8'
        );

        setArchivo(ruta);
        setMensaje(`Archivo guardado: ${basename(ruta)}`);
        setError(false);
    }

    useEffect(() => {
        const inicial = process.argv[2];

        if (inicial) {
            setCargando(true);

            abrirArchivo(inicial)
                .catch(err => {
                    setMensaje(`Error: ${err.message}`);
                    setError(true);
                })
                .finally(() => setCargando(false));
        }
    }, []);

    useInput((entrada, key) => {
        if (cargando) return;

        // Modos para abrir, guardar o editar.
        if (modo !== 'normal') {
            if (key.escape) {
                setModo('normal');
                setTexto('');
                setMensaje('Operación cancelada.');
                setError(false);
                return;
            }

            if (key.return) {
                const valor = texto.trim();

                if (!valor) {
                    setMensaje('Ingresá un valor.');
                    setError(true);
                    return;
                }

                if (modo === 'editar') {
                    const nuevasFilas = datos.map((fila, indice) =>
                        indice === filaSeleccionada
                            ? fila.map((celda, columna) =>
                                columna === columnaSeleccionada
                                    ? texto
                                    : celda
                            )
                            : fila
                    );

                    setDatos(nuevasFilas);
                    setMensaje('Celda modificada. Presioná G para guardar.');
                    setError(false);
                    setModo('normal');
                    setTexto('');
                    return;
                }

                const accion = modo;
                setCargando(true);
                setModo('normal');
                setTexto('');

                const operacion = accion === 'abrir'
                    ? abrirArchivo(valor)
                    : guardarArchivo(valor);

                operacion
                    .catch(err => {
                        setMensaje(`Error: ${err.message}`);
                        setError(true);
                    })
                    .finally(() => setCargando(false));

                return;
            }

            if (key.backspace || key.delete) {
                setTexto(actual => actual.slice(0, -1));
                return;
            }

            if (entrada && !key.ctrl && !key.meta) {
                setTexto(actual => actual + entrada);
            }

            return;
        }

        // Salir.
        if (key.escape) {
            exit();
            return;
        }

        // Abrir archivo.
        if (entrada.toLowerCase() === 'a') {
            setModo('abrir');
            setTexto('');
            setMensaje('Nombre o ruta del CSV que querés abrir:');
            setError(false);
            return;
        }

        // Guardar archivo.
        if (entrada.toLowerCase() === 'g') {
            if (!hayArchivo) {
                setMensaje('Primero abrí un archivo con A.');
                setError(true);
                return;
            }

            setModo('guardar');
            setTexto(archivo);
            setMensaje('Nombre o ruta del archivo de destino:');
            setError(false);
            return;
        }

        if (!hayArchivo || totalFilas === 0) return;

        // Navegación entre celdas.
        if (key.upArrow) {
            setFilaSeleccionada(fila =>
                Math.max(0, fila - 1)
            );
        } else if (key.downArrow) {
            setFilaSeleccionada(fila =>
                Math.min(totalFilas - 1, fila + 1)
            );
        } else if (key.leftArrow) {
            setColumnaSeleccionada(columna =>
                Math.max(0, columna - 1)
            );
        } else if (key.rightArrow) {
            setColumnaSeleccionada(columna =>
                Math.min(totalColumnas - 1, columna + 1)
            );
        }

        // Editar celda.
        if (key.return) {
            setModo('editar');
            setTexto(datos[filaSeleccionada][columnaSeleccionada]);
            setMensaje('Editá el valor y presioná Enter para confirmar.');
            setError(false);
            return;
        }

        // Orden ascendente.
        if (entrada === '<') {
            const ordenados = [...datos].sort((a, b) =>
                compararValores(
                    a[columnaSeleccionada],
                    b[columnaSeleccionada]
                )
            );

            setDatos(ordenados);
            setFilaSeleccionada(0);
            setMensaje(
                `Orden ascendente por ${cabecera[columnaSeleccionada]}.`
            );
            setError(false);
        }

        // Orden descendente.
        if (entrada === '>') {
            const ordenados = [...datos].sort((a, b) =>
                compararValores(
                    b[columnaSeleccionada],
                    a[columnaSeleccionada]
                )
            );

            setDatos(ordenados);
            setFilaSeleccionada(0);
            setMensaje(
                `Orden descendente por ${cabecera[columnaSeleccionada]}.`
            );
            setError(false);
        }
    });

    // Cantidad de filas visibles y desplazamiento vertical.
    const filasVisibles = Math.max(3, FILAS - 13);
    const inicio = Math.max(
        0,
        Math.min(
            filaSeleccionada - Math.floor(filasVisibles / 2),
            totalFilas - filasVisibles
        )
    );
    const filasVista = datos.slice(inicio, inicio + filasVisibles);

    function recortar(valor, ancho = ANCHO_COLUMNA) {
        const texto = String(valor ?? '');

        if (texto.length <= ancho) {
            return texto.padEnd(ancho);
        }

        return texto.slice(0, ancho - 1) + '…';
    }

    function Celda({ valor, seleccionada, encabezado = false }) {
        return (
            <Box
                width={ANCHO_COLUMNA + 2}
                flexShrink={0}
                paddingX={1}
                backgroundColor={seleccionada ? COLORES.acento : undefined}
            >
                <Text
                    bold={encabezado || seleccionada}
                    color={
                        seleccionada
                            ? COLORES.fondo
                            : encabezado
                                ? COLORES.acento
                                : COLORES.titulo
                    }
                >
                    {recortar(valor)}
                </Text>
            </Box>
        );
    }

    return (
        <Box
            width={COLUMNAS}
            height={FILAS}
            flexDirection="column"
            paddingX={1}
            backgroundColor={COLORES.fondo}
        >
            <Box
                justifyContent="space-between"
                borderStyle="round"
                borderColor={COLORES.borde}
                paddingX={1}
            >
                <Text bold color={COLORES.titulo}>
                    Editor CSV
                </Text>
                <Text color={COLORES.secundario}>
                    {archivo ? basename(archivo) : 'Sin archivo'}
                </Text>
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Text color={COLORES.secundario}>
                    Filas: {totalFilas} | Columnas: {totalColumnas}
                </Text>

                {hayArchivo ? (
                    <Box flexDirection="column" marginTop={1}>
                        <Box
                            flexDirection="row"
                            borderStyle="single"
                            borderColor={COLORES.borde}
                        >
                            <Box width={5} paddingX={1}>
                                <Text bold color={COLORES.acento}>
                                    N°
                                </Text>
                            </Box>

                            {cabecera.map((nombre, columna) => (
                                <Celda
                                    key={columna}
                                    valor={nombre}
                                    encabezado
                                    seleccionada={columna === columnaSeleccionada}
                                />
                            ))}
                        </Box>

                        {filasVista.map((fila, indiceVista) => {
                            const indiceReal = inicio + indiceVista;

                            return (
                                <Box
                                    key={indiceReal}
                                    flexDirection="row"
                                    backgroundColor={
                                        indiceReal === filaSeleccionada
                                            ? '#29241d'
                                            : undefined
                                    }
                                >
                                    <Box width={5} paddingX={1}>
                                        <Text
                                            color={
                                                indiceReal === filaSeleccionada
                                                    ? COLORES.acento
                                                    : COLORES.secundario
                                            }
                                            bold={indiceReal === filaSeleccionada}
                                        >
                                            {String(indiceReal + 1).padStart(2, '0')}
                                        </Text>
                                    </Box>

                                    {fila.map((valor, columna) => (
                                        <Celda
                                            key={columna}
                                            valor={valor}
                                            seleccionada={
                                                indiceReal === filaSeleccionada &&
                                                columna === columnaSeleccionada
                                            }
                                        />
                                    ))}
                                </Box>
                            );
                        })}
                    </Box>
                ) : (
                    <Box marginY={2}>
                        <Text color={COLORES.secundario}>
                            {cargando
                                ? 'Cargando archivo...'
                                : 'No hay ningún CSV abierto. Presioná A para comenzar.'}
                        </Text>
                    </Box>
                )}
            </Box>

            <Box
                marginTop={1}
                flexDirection="column"
                borderStyle="round"
                borderColor={COLORES.borde}
                paddingX={1}
            >
                {modo !== 'normal' ? (
                    <Box flexDirection="column">
                        <Text bold color={COLORES.acento}>
                            {modo === 'abrir'
                                ? 'Abrir archivo'
                                : modo === 'guardar'
                                    ? 'Guardar archivo'
                                    : 'Editar celda'}
                        </Text>

                        <Text color={COLORES.titulo}>
                            {modo === 'editar'
                                ? `Fila ${filaSeleccionada + 1}, columna ${cabecera[columnaSeleccionada]}`
                                : 'Ingresá el nombre o la ruta del archivo'}
                        </Text>

                        <Text color={COLORES.acento}>
                            {'> '}{texto}
                        </Text>

                        <Text color={COLORES.secundario}>
                            Enter confirmar | Esc cancelar
                        </Text>
                    </Box>
                ) : (
                    <Box flexDirection="column">
                        <Text color={error ? 'red' : COLORES.secundario}>
                            {mensaje}
                        </Text>

                        {hayArchivo && totalFilas > 0 && (
                            <Text color={COLORES.titulo}>
                                Celda: fila {filaSeleccionada + 1}, columna{' '}
                                {columnaSeleccionada + 1} ({cabecera[columnaSeleccionada]})
                                {' | Valor: '}
                                {datos[filaSeleccionada][columnaSeleccionada]}
                            </Text>
                        )}
                    </Box>
                )}
            </Box>

            <Box marginTop={1} flexDirection="row" flexWrap="wrap" gap={1}>
                <Text color={COLORES.acento}>A</Text>
                <Text color={COLORES.secundario}>Abrir</Text>
                <Text color={COLORES.acento}>G</Text>
                <Text color={COLORES.secundario}>Guardar</Text>
                <Text color={COLORES.acento}>Enter</Text>
                <Text color={COLORES.secundario}>Editar</Text>
                <Text color={COLORES.acento}>{'< >'}</Text>
                <Text color={COLORES.secundario}>Ordenar</Text>
                <Text color={COLORES.acento}>Esc</Text>
                <Text color={COLORES.secundario}>Salir / cancelar</Text>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();
