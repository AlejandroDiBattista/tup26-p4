import React, {useState} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

// Leer el CSV: la primera fila contiene los títulos.
async function leerCSV(archivo) {
    const [titulos, ...registros] = (await readFile(archivo, 'utf8'))
        .replace(/\r/g, '')
        .replace(/\n$/, '')
        .split('\n')
        .map(linea => linea.split(','));

    return {titulos, registros};
}

async function escribirCSV(archivo, titulos, registros) {
    const csv = [titulos, ...registros]
        .map(registro => registro.join(','))
        .join('\n');

    await writeFile(archivo, csv, 'utf8');
}

const archivoInicial = process.argv[2] ?? '';
let inicial = {titulos: [], registros: []};
let errorInicial = '';
if (archivoInicial) {
    try {
        inicial = await leerCSV(archivoInicial);
    } catch (error) {
        errorInicial = error.message;
    }
}

const ANCHO = 20;
const ANCHO_NUMERICO = 12;
const NUMERO = 6;
const SEPARACION = 2;
const FILAS = Math.max(1, (process.stdout.rows || 24) - 11);
const ESPACIO_COLUMNAS = Math.max(1, (process.stdout.columns || 80) - NUMERO - 4 - SEPARACION);

// Paleta cálida definida en OKLCH y convertida a HEX para la terminal.
const COLORES = {
    fondo:      '#161310',
    texto:      '#ede7db',
    secundario: '#ada79e',
    borde:      '#726b61',
    acento:     '#edbb64',
    exito:      '#81d39f',
    error:      '#fb9890',
};

const formatoNumero = new Intl.NumberFormat('es-AR', {
    useGrouping: true,
    maximumFractionDigits: 20,
});

// Todas las celdas se dibujan de la misma manera.
function Celda({valor, ancho, activa = false, seleccionada = false, derecha = false, encabezado = false}) {
    const contenido = String(valor ?? '');
    const texto = (derecha && !encabezado && contenido.trim()
        ? formatoNumero.format(contenido.trim())
        : contenido).slice(0, ancho);
    return (
        <Text
            backgroundColor={seleccionada ? 'white' : activa ? 'black' : undefined}
            color={seleccionada ? 'black' : activa ? COLORES.acento : encabezado ? COLORES.secundario : COLORES.texto}
            bold={activa || seleccionada || encabezado}
        >
            {derecha ? texto.padStart(ancho) : texto.padEnd(ancho)}
        </Text>
    );
}

function Pantalla({children}) {
    return (
        <Box flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo} paddingX={1}>
            {children}
        </Box>
    );
}

function Encabezado({archivo, filas, columnas}) {
    return (
        <Box justifyContent="space-between">
            <Box flexGrow={1} flexShrink={1} minWidth={0}>
                <Text bold color={COLORES.texto} wrap="truncate">{archivo ? basename(archivo) : 'Editor CSV'}</Text>
            </Box>
            <Box flexShrink={0} marginLeft={1}>
                <Text color={COLORES.secundario}>{filas} filas · {columnas} columnas</Text>
            </Box>
        </Box>
    );
}

function Entrada({archivo, valor, modo, onSubmit}) {
    const etiquetas = {abrir: 'Abrir', guardar: 'Guardar', editar: 'Editar'};
    const inicial = modo === 'abrir' ? '' : modo === 'guardar' ? archivo : valor;
    return (
        <Box marginY={1} height={1} overflow="hidden">
            <Box flexShrink={0} marginRight={1}>
                <Text bold={Boolean(modo)} color={modo ? COLORES.acento : COLORES.secundario}>
                    {etiquetas[modo] || 'Valor'} ›
                </Text>
            </Box>
            <Box flexGrow={1} minWidth={0}>
                {modo ? (
                    <Text bold color={COLORES.texto}>
                        <TextInput
                            key={modo}
                            defaultValue={inicial}
                            placeholder={modo === 'editar' ? 'Escribí el nuevo valor…' : 'archivo.csv'}
                            onSubmit={onSubmit}
                        />
                    </Text>
                ) : (
                    <Text color={COLORES.texto} wrap="truncate">{valor || (archivo ? '—' : 'Ingresá la ruta de un archivo CSV')}</Text>
                )}
            </Box>
        </Box>
    );
}

function FilaTabla({registro, numero, columnas, seleccionada, columna}) {
    return (
        <Box columnGap={SEPARACION}>
            <Celda valor={numero + 1} ancho={NUMERO} derecha activa={seleccionada} />
            {columnas.map(c => (
                <Celda
                    key={c.indice}
                    valor={registro[c.indice] ?? ''}
                    ancho={c.ancho}
                    derecha={c.numerica}
                    seleccionada={seleccionada && c.indice === columna}
                />
            ))}
        </Box>
    );
}

function EncabezadoTabla({columnas, columna}) {
    return (
        <Box columnGap={SEPARACION}>
            <Celda valor="#" ancho={NUMERO} derecha encabezado />
            {columnas.map(c => (
                <Celda
                    key={c.indice}
                    valor={c.titulo.toLocaleUpperCase('es')}
                    ancho={c.ancho}
                    derecha={c.numerica}
                    activa={c.indice === columna}
                    encabezado
                />
            ))}
        </Box>
    );
}

function Tabla({titulos, datos, fila, columna}) {
    const [vista, setVista] = useState({fila: 0, columna: 0});
    const numericas = titulos.map((_, c) => {
        const valores = datos.map(registro => (registro[c] ?? '').trim()).filter(Boolean);
        return valores.length > 0 && valores.every(valor =>
            /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(valor)
        );
    });

    const anchos = numericas.map(numerica => numerica ? ANCHO_NUMERICO : ANCHO);

    // Conservar la ventana hasta que el cursor cruce uno de sus bordes.
    const inicioFila = fila < vista.fila ? fila
        : fila >= vista.fila + FILAS ? fila - FILAS + 1
        : vista.fila;
    let inicioColumna = Math.min(vista.columna, columna);
    let ocupado = anchos.slice(inicioColumna, columna + 1).reduce((total, ancho) => total + ancho + SEPARACION, -SEPARACION);
    while (ocupado > ESPACIO_COLUMNAS && inicioColumna < columna) {
        ocupado -= anchos[inicioColumna] + SEPARACION;
        inicioColumna++;
    }
    let finColumna = columna + 1;
    while (finColumna < titulos.length && ocupado + SEPARACION + anchos[finColumna] <= ESPACIO_COLUMNAS) {
        ocupado += SEPARACION + anchos[finColumna];
        finColumna++;
    }

    if (inicioFila !== vista.fila || inicioColumna !== vista.columna) {
        setVista({fila: inicioFila, columna: inicioColumna});
    }

    const filasVisibles = datos.slice(inicioFila, inicioFila + FILAS);
    const columnas = titulos.slice(inicioColumna, finColumna).map((titulo, c) => ({
        indice: inicioColumna + c,
        titulo,
        ancho: anchos[inicioColumna + c],
        numerica: numericas[inicioColumna + c],
    }));

    return (
        <Box flexDirection="column">
            <EncabezadoTabla columnas={columnas} columna={columna} />
            <Box flexDirection="column" height={FILAS}>
                {filasVisibles.map((registro, f) => (
                    <FilaTabla
                        key={inicioFila + f}
                        registro={registro}
                        numero={inicioFila + f}
                        columnas={columnas}
                        seleccionada={inicioFila + f === fila}
                        columna={columna}
                    />
                ))}
            </Box>
        </Box>
    );
}

function Comandos({modo}) {
    const comandos = modo
        ? [['Enter', modo === 'editar' ? 'aplicar' : modo], ['Esc', 'cancelar']]
        : [['A', 'abrir'], ['G', 'guardar'], ['Enter', 'editar'], ['<', 'ascendente'], ['>', 'descendente'], ['Esc', 'salir']];
    return comandos.map(([tecla, accion], i) => (
        <React.Fragment key={tecla}>
            {i > 0 && ' · '}
            <Text bold color={COLORES.acento}>{tecla}</Text> {accion}
        </React.Fragment>
    ));
}

function Pie({mensaje, hayError, modo, fila, columna}) {
    return (
        <Box justifyContent="space-between" marginTop={1}>
            <Box flexGrow={1} flexShrink={1} minWidth={0}>
                <Text color={mensaje ? (hayError ? COLORES.error : COLORES.exito) : COLORES.secundario} wrap="truncate">
                    {mensaje ? `${hayError ? 'Error: ' : '✓ '}${mensaje}` : <Comandos modo={modo} />}
                </Text>
            </Box>
            <Box flexShrink={0} marginLeft={1}>
                <Text color={COLORES.secundario}>Fila {fila} · Columna {columna}</Text>
            </Box>
        </Box>
    );
}

function App() {
    const {exit} = useApp();

    const [archivo, setArchivo] = useState(errorInicial ? '' : archivoInicial);
    const [titulos, setTitulos] = useState(inicial.titulos);
    const [datos, setDatos] = useState(inicial.registros);
    const [modo, setModo] = useState(!archivoInicial || errorInicial ? 'abrir' : null);
    const [mensaje, setMensaje] = useState(errorInicial);
    const [hayError, setHayError] = useState(Boolean(errorInicial));
    const [fila, setFila] = useState(0);
    const [columna, setColumna] = useState(0);

    // Acciones sobre los datos.
    function ordenar(sentido) {
        const ordenados = [...datos].sort((a, b) =>
            sentido * (a[columna] ?? '').localeCompare(
                b[columna] ?? '', 'es', {numeric: true}
            )
        );

        setDatos(ordenados);
        setFila(0);
    }

    function actualizarCelda(valor) {
        // Copiar la tabla y la fila antes de modificar la celda.
        const nuevos = [...datos];
        nuevos[fila] = [...datos[fila]];
        nuevos[fila][columna] = valor;

        setDatos(nuevos);
        setModo(null);
    }

    async function seleccionarArchivo(nombre) {
        if (!nombre.trim()) {
            setMensaje('Ingresá el nombre del archivo.');
            setHayError(true);
            return;
        }
        try {
            if (modo === 'abrir') {
                const contenido = await leerCSV(nombre);
                setTitulos(contenido.titulos);
                setDatos(contenido.registros);
                setFila(0);
                setColumna(0);
                setMensaje(`Abierto: ${nombre}`);
            } else {
                await escribirCSV(nombre, titulos, datos);
                setMensaje(`Guardado: ${nombre}`);
            }
            setArchivo(nombre);
            setHayError(false);
            setModo(null);
        } catch (error) {
            setMensaje(error.message);
            setHayError(true);
        }
    }

    // Mientras se edita, TextInput se encarga del teclado.
    useInput((tecla, key) => {
        if (mensaje) {
            setMensaje('');
            setHayError(false);
        }
        if (key.escape) {
            if (modo) {
                setModo(null);
            } else {
                exit();
            }
            return;
        }
        if (modo) {
            return;
        }
        const comando = tecla.toLowerCase();
        if (!key.ctrl && (comando === 'a' || comando === 'g')) {
            if (comando === 'g' && !archivo) return;
            setModo(comando === 'a' ? 'abrir' : 'guardar');
            return;
        }

        if (!archivo) return;

        if (key.upArrow)
            setFila(f => Math.max(0, f - 1));

        if (key.downArrow)
            setFila(f => Math.max(0, Math.min(datos.length - 1, f + 1)));

        if (key.leftArrow)
            setColumna(c => Math.max(0, c - 1));

        if (key.rightArrow)
            setColumna(c => Math.min(titulos.length - 1, c + 1));

        if (key.return && datos.length) setModo('editar');
        if (tecla === '<' || tecla === '+') ordenar(1);
        if (tecla === '>' || tecla === '-') ordenar(-1);

    });

    return (
        <Pantalla>
            <Encabezado archivo={archivo} filas={datos.length} columnas={titulos.length} />
            <Entrada
                archivo={archivo}
                valor={datos[fila]?.[columna] ?? ''}
                modo={modo}
                onSubmit={modo === 'editar' ? actualizarCelda : seleccionarArchivo}
            />
            <Tabla titulos={titulos} datos={datos} fila={fila} columna={columna} />
            <Pie
                mensaje={mensaje}
                hayError={hayError}
                modo={modo}
                fila={datos.length ? fila + 1 : 0}
                columna={titulos.length ? columna + 1 : 0}
            />
        </Pantalla>
    );
}

render(<App />);
