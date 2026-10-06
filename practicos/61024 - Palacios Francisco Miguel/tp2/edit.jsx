#!/usr/bin/env -S node --import tsx

import React, { useState } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile, writeFile } from 'node:fs/promises';
import { TextInput } from '@inkjs/ui';
import { basename } from 'node:path';

const COLUMNAS = process.stdout.columns || 100;
const COLORES = {
  fondo: '#161310',
  borde: '#726b61',
  titulo: '#ede7db',
  secundario: '#ada79e',
  acento: '#edbb64',
};

const ANCHO_CELDA = 16;
const ANCHO_INDICE = 4;
const ANCHO_PANEL = 92;

function parseCsv(contenido) {
  return contenido
    .split(/\r?\n/)
    .filter(fila => fila.trim() !== '')
    .map(fila => fila.split(','));
}

function convertirACsv(datos) {
  return datos.map(fila => fila.join(',')).join('\n');
}

function App({ tabla, archivoInicial, errorInicial = '' }) {
  const { exit } = useApp();
  const [rutaActual, setRutaActual] = useState(archivoInicial);
  const [datos, setDatos] = useState(tabla);
  const [filaSeleccionada, setFilaSeleccionada] = useState(0);
  const [filaInicio, setFilaInicio] = useState(0);
  const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);
  const [editando, setEditando] = useState(false);
  const [modoPrompt, setModoPrompt] = useState(null);
  const [mensaje, setMensaje] = useState(errorInicial);

  const encabezado = datos[0] || [];
  const filas = datos.slice(1);
  const cantidadFilas = filas.length;
  const cantidadColumnas = Math.max(1, encabezado.length);
  const filasVisibles = Math.min(5, Math.max(1, filas.length || 1));
  const filaActual = Math.min(filaSeleccionada + 1, Math.max(1, cantidadFilas || 1));
  const columnaActual = columnaSeleccionada + 1;
  const valorActual = filas[filaSeleccionada]?.[columnaSeleccionada] ?? '';
  const anchoTabla = Math.min(COLUMNAS - 2, (ANCHO_INDICE + 1) + (ANCHO_CELDA + 3) * cantidadColumnas + 5);

  async function guardarEn(path) {
    try {
      await writeFile(path, convertirACsv(datos), 'utf-8');
      setRutaActual(path);
      setMensaje(`Guardado en ${path}`);
    } catch (error) {
      setMensaje(`Error: ${error.message}`);
    }
  }

  async function abrirArchivo(path) {
    try {
      const contenido = await readFile(path, 'utf-8');
      const nuevaTabla = parseCsv(contenido);

      if (!nuevaTabla.length || !nuevaTabla[0]?.length) {
        throw new Error('Archivo CSV vacío');
      }

      setDatos(nuevaTabla);
      setRutaActual(path);
      setFilaSeleccionada(0);
      setFilaInicio(0);
      setColumnaSeleccionada(0);
      setEditando(false);
      setMensaje(`Abierto ${path}`);
    } catch (error) {
      setMensaje(`Error: ${error.message}`);
    }
  }

  function ordenar(asc = true) {
    if (!datos[0]) return;

    const encabezadoActual = [...datos[0]];
    const filasActuales = [...datos.slice(1)];

    filasActuales.sort((a, b) => {
      const uno = String(a[columnaSeleccionada] ?? '').trim();
      const dos = String(b[columnaSeleccionada] ?? '').trim();
      return asc ? uno.localeCompare(dos) : dos.localeCompare(uno);
    });

    setDatos([encabezadoActual, ...filasActuales]);
  }

  useInput((tecla, key) => {
    if (modoPrompt) {
      if (key.escape) {
        setModoPrompt(null);
        setMensaje('');
      }
      return;
    }

    if (key.ctrl && tecla === 'c') {
      exit();
      return;
    }

    if (key.escape) {
      if (editando) {
        setEditando(false);
        return;
      }
      exit();
      return;
    }

    if (editando) return;

    const teclaLower = String(tecla).toLowerCase();

    if (teclaLower === 'a') {
      setModoPrompt('abrir');
      setMensaje('Nombre del archivo:');
      return;
    }

    if (teclaLower === 'g') {
      setModoPrompt('guardar');
      setMensaje('Guardar como:');
      return;
    }

    if (tecla === '<') {
      ordenar(true);
      return;
    }

    if (tecla === '>') {
      ordenar(false);
      return;
    }

    if (key.downArrow) {
      setFilaSeleccionada(fila => {
        const nuevaFila = Math.min(fila + 1, Math.max(0, filas.length - 1));
        if (nuevaFila >= filaInicio + filasVisibles) {
          setFilaInicio(inicio => Math.min(inicio + 1, Math.max(0, filas.length - filasVisibles)));
        }
        return nuevaFila;
      });
      return;
    }

    if (key.upArrow) {
      setFilaSeleccionada(fila => {
        const nuevaFila = Math.max(fila - 1, 0);
        if (nuevaFila < filaInicio) {
          setFilaInicio(inicio => Math.max(inicio - 1, 0));
        }
        return nuevaFila;
      });
      return;
    }

    if (key.rightArrow) {
      setColumnaSeleccionada(columna => Math.min(columna + 1, Math.max(0, cantidadColumnas - 1)));
      return;
    }

    if (key.leftArrow) {
      setColumnaSeleccionada(columna => Math.max(columna - 1, 0));
      return;
    }

    if (key.return) {
      setEditando(true);
      return;
    }

    if (key.ctrl && teclaLower === 's') {
      guardarEn(rutaActual);
    }
  });

  if (modoPrompt) {
    return (
      <Box
        width={COLUMNAS}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box
          width={Math.max(40, COLUMNAS - 10)}
          borderStyle="round"
          borderColor={COLORES.borde}
          flexDirection="column"
          paddingX={2}
          paddingY={1}
        >
          <Text color={COLORES.titulo}>{mensaje}</Text>
          <TextInput
            defaultValue={rutaActual}
            onSubmit={async valor => {
              const nombre = valor.trim() || rutaActual;

              if (modoPrompt === 'guardar') {
                await guardarEn(nombre);
              } else {
                await abrirArchivo(nombre);
              }

              setModoPrompt(null);
              setMensaje('');
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      width={COLUMNAS}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      paddingX={1}
      paddingY={1}
    >
      <Box
        width={Math.min(ANCHO_PANEL, anchoTabla)}
        borderStyle="round"
        borderColor={COLORES.borde}
        backgroundColor={COLORES.fondo}
        flexDirection="column"
        paddingX={1}
        paddingY={1}
      >
        <Box justifyContent="space-between" alignItems="center">
          <Text bold color={COLORES.titulo}>{basename(rutaActual)}</Text>
          <Text color={COLORES.secundario}>{cantidadFilas} filas · {cantidadColumnas} columnas</Text>
        </Box>

        <Text color={COLORES.secundario}>Valor seleccionado: {valorActual || 'vacío'}</Text>
        <Text color={COLORES.secundario}>Posición: fila {filaActual}, columna {columnaActual}</Text>

        <Box flexDirection="row" marginTop={1}>
          <Box width={ANCHO_INDICE} minWidth={ANCHO_INDICE} paddingRight={1}>
            <Text color={COLORES.titulo}>#</Text>
          </Box>

          {encabezado.map((titulo, indice) => (
            <Box key={indice} width={ANCHO_CELDA} minWidth={ANCHO_CELDA} paddingRight={1}>
              <Text
                wrap="truncate"
                color={indice === columnaSeleccionada ? COLORES.acento : COLORES.titulo}
              >
                {String(titulo)}
              </Text>
            </Box>
          ))}
        </Box>

        <Box flexDirection="column" marginTop={0}>
          {filas.slice(filaInicio, filaInicio + filasVisibles).map((fila, indice) => {
            const indiceReal = filaInicio + indice;
            const esFilaActual = indiceReal === filaSeleccionada;

            return (
              <Box key={indiceReal} flexDirection="row" alignItems="center" marginBottom={0}>
                <Box width={ANCHO_INDICE} minWidth={ANCHO_INDICE} paddingRight={1}>
                  <Text color={COLORES.secundario}>{indiceReal + 1}</Text>
                </Box>

                {fila.map((valor, indiceColumna) => {
                  const esCeldaActual = esFilaActual && indiceColumna === columnaSeleccionada;
                  const mostrandoInput = esCeldaActual && editando;

                  return (
                    <Box
                      key={`${indiceReal}-${indiceColumna}`}
                      width={ANCHO_CELDA}
                      minWidth={ANCHO_CELDA}
                      paddingRight={1}
                    >
                      {mostrandoInput ? (
                        <TextInput
                          defaultValue={String(valor ?? '')}
                          onSubmit={nuevaValor => {
                            const nuevosDatos = datos.map((filaDatos, filaIndex) =>
                              filaIndex === indiceReal + 1
                                ? filaDatos.map((valorActualCampo, campoIndex) =>
                                campoIndex === indiceColumna ? nuevaValor : valorActualCampo
                             )
                            : filaDatos
                            );
                            setDatos(nuevosDatos);
                            setEditando(false);
                            setMensaje('');
                          }}
                       />
                      ) : (
                        <Text
                          wrap="truncate"
                          color={esCeldaActual ? COLORES.acento : COLORES.titulo}
                        >
                          {String(valor ?? '')}
                        </Text>
                      )}
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </Box>

        <Text color={COLORES.secundario} marginTop={1}>
          <Text bold color={COLORES.acento}>Esc</Text> salir · <Text bold color={COLORES.acento}>A</Text> abrir · <Text bold color={COLORES.acento}>G</Text> guardar · <Text bold color={COLORES.acento}>Enter</Text> editar · <Text bold color={COLORES.acento}>{'<'}</Text>/{'>'} ordenar
        </Text>

        {mensaje ? <Text color={COLORES.secundario}>{mensaje}</Text> : null}
      </Box>
    </Box>
  );
}

const archivo = process.argv[2] || 'empleados.csv';
let tabla = [['']];
let mensajeInicial = '';

try {
  const contenido = await readFile(archivo, 'utf-8');
  tabla = parseCsv(contenido);
  if (!tabla.length || !tabla[0]?.length) {
    tabla = [['']];
  }
} catch (error) {
  mensajeInicial = `Error: ${error.message}`;
}

const app = render(<App tabla={tabla} archivoInicial={archivo} errorInicial={mensajeInicial} />);
await app.waitUntilExit();
console.clear();