#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

const COLUMNAS_TERM = process.stdout.columns || 100;
const FILAS_TERM = process.stdout.rows || 26;

const COLORES = {
  fondo: '#161310',
  borde: '#3a3632',
  texto: '#ede7db',
  secundario: '#8a8275',
  acento: '#edbb64',
  seleccionBg: '#e6e1d8',
  seleccionFg: '#161310',
  headerSelBg: '#2d2415',
  numFilaSelBg: '#3a2e18',
  numFilaSelFg: '#edbb64',
  error: '#ff5555',
};

// Ruta pasada por argumento de consola
const argArchivo = process.argv[2] || '';

function App() {
  const { exit } = useApp();

  const [nombreArchivo, setNombreArchivo] = useState(argArchivo);
  const [cabeceras, setCabeceras] = useState([]);
  const [filas, setFilas] = useState([]);

  const [cursor, setCursor] = useState({ fila: 0, col: 0 });
  const [modo, setModo] = useState('NAVEGACION'); // 'NAVEGACION' | 'EDICION' | 'ABRIR' | 'GUARDAR'
  const [inputBuffer, setInputBuffer] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  // Carga inicial si se pasa un argumento
  useEffect(() => {
    if (argArchivo) {
      cargarArchivoCSV(argArchivo);
    } else {
      // Datos por defecto en caso de no pasar argumento
      setCabeceras(['NOMBRE', 'APELLIDO', 'EDAD', 'SALARIO', 'DEPARTAMENTO']);
      setFilas([
        ['Carla', 'Castro', '42', '120.000', 'Gerencia'],
        ['Federico', 'Fernández', '38', '95.000', 'Gerencia'],
        ['Bruno', 'Benítez', '28', '72.000', 'Diseño'],
      ]);
    }
  }, []);

  async function cargarArchivoCSV(ruta) {
    try {
      setMensajeError('');
      const contenido = await readFile(ruta, 'utf-8');
      const lineas = contenido
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lineas.length === 0) {
        setMensajeError('El archivo está vacío.');
        return false;
      }

      const parsedHeaders = lineas[0].split(',').map((h) => h.toUpperCase());
      const parsedRows = lineas.slice(1).map((l) => l.split(','));

      setCabeceras(parsedHeaders);
      setFilas(parsedRows);
      setNombreArchivo(ruta);
      setCursor({ fila: 0, col: 0 });
      return true;
    } catch (err) {
      setMensajeError(`Error al abrir '${ruta}': ${err.message}`);
      return false;
    }
  }

  async function guardarArchivoCSV(ruta) {
    try {
      setMensajeError('');
      const lineas = [
        cabeceras.join(','),
        ...filas.map((r) => r.join(',')),
      ];
      await writeFile(ruta, lineas.join('\n'), 'utf-8');
      setNombreArchivo(ruta);
      return true;
    } catch (err) {
      setMensajeError(`Error al guardar: ${err.message}`);
      return false;
    }
  }

  function ordenarColumna(ascendente = true) {
    if (filas.length === 0) return;
    const colIdx = cursor.col;
    const filasOrdenadas = [...filas].sort((a, b) => {
      const valA = a[colIdx] || '';
      const valB = b[colIdx] || '';

      const cleanA = valA.replace(/\./g, '').replace(',', '.');
      const cleanB = valB.replace(/\./g, '').replace(',', '.');
      const numA = Number(cleanA);
      const numB = Number(cleanB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return ascendente ? numA - numB : numB - numA;
      }

      return ascendente
        ? valA.localeCompare(valB, 'es', { numeric: true, sensitivity: 'base' })
        : valB.localeCompare(valA, 'es', { numeric: true, sensitivity: 'base' });
    });

    setFilas(filasOrdenadas);
  }

  useInput((input, key) => {
    // 1. DIÁLOGOS (Abrir / Guardar)
    if (modo === 'ABRIR' || modo === 'GUARDAR') {
      if (key.escape) {
        setModo('NAVEGACION');
        setInputBuffer('');
        setMensajeError('');
        return;
      }
      if (key.return) {
        const target = inputBuffer.trim();
        if (target) {
          if (modo === 'ABRIR') {
            cargarArchivoCSV(target).then((ok) => {
              if (ok) setModo('NAVEGACION');
            });
          } else {
            guardarArchivoCSV(target).then((ok) => {
              if (ok) setModo('NAVEGACION');
            });
          }
        }
        return;
      }
      if (key.backspace || key.delete) {
        setInputBuffer((p) => p.slice(0, -1));
        return;
      }
      if (input && !key.ctrl && !key.meta) {
        setInputBuffer((p) => p + input);
        return;
      }
      return;
    }

    // 2. MODO EDICIÓN
    if (modo === 'EDICION') {
      if (key.escape || key.return) {
        setModo('NAVEGACION');
        return;
      }

      const { fila, col } = cursor;
      const valorActual = filas[fila]?.[col] || '';

      if (key.backspace || key.delete) {
        actualizarCelda(fila, col, valorActual.slice(0, -1));
      } else if (input && !key.ctrl && !key.meta) {
        actualizarCelda(fila, col, valorActual + input);
      }
      return;
    }

    // 3. MODO NAVEGACIÓN
    if (key.escape) {
      exit();
      return;
    }

    if (key.return) {
      setModo('EDICION');
      return;
    }

    if (key.upArrow) {
      setCursor((c) => ({ ...c, fila: Math.max(0, c.fila - 1) }));
    } else if (key.downArrow) {
      setCursor((c) => ({ ...c, fila: Math.min(filas.length - 1, c.fila + 1) }));
    } else if (key.leftArrow) {
      setCursor((c) => ({ ...c, col: Math.max(0, c.col - 1) }));
    } else if (key.rightArrow) {
      setCursor((c) => ({ ...c, col: Math.min(cabeceras.length - 1, c.col + 1) }));
    }

    if (input === '<') {
      ordenarColumna(true);
    } else if (input === '>') {
      ordenarColumna(false);
    } else if (input === 'a' || input === 'A') {
      setModo('ABRIR');
      setInputBuffer(nombreArchivo || 'empleados.csv');
      setMensajeError('');
    } else if (input === 'g' || input === 'G') {
      setModo('GUARDAR');
      setInputBuffer(nombreArchivo || 'empleados.csv');
      setMensajeError('');
    }
  });

  const actualizarCelda = (f, c, valor) => {
    const copia = filas.map((r) => [...r]);
    if (!copia[f]) copia[f] = new Array(cabeceras.length).fill('');
    copia[f][c] = valor;
    setFilas(copia);
  };

  // Cálculos de renderizado y paginado
  const numFilas = filas.length;
  const numCols = cabeceras.length;

  const anchoNumCol = Math.max(4, String(numFilas).length + 2);
  const anchoDisponible = COLUMNAS_TERM - anchoNumCol - 8;
  const anchoColumna = Math.max(12, Math.floor(anchoDisponible / Math.max(1, numCols)));

  const maxFilasVisibles = Math.max(4, FILAS_TERM - 8);
  const offsetFila = Math.max(
    0,
    Math.min(cursor.fila - Math.floor(maxFilasVisibles / 2), numFilas - maxFilasVisibles)
  );
  const filasVisibles = filas.slice(offsetFila, offsetFila + maxFilasVisibles);

  const valorCeldaActual = filas[cursor.fila]?.[cursor.col] ?? '';

  return (
    <Box
      width={COLUMNAS_TERM}
      height={FILAS_TERM}
      flexDirection="column"
      borderStyle="round"
      borderColor={COLORES.borde}
      paddingX={1}
      backgroundColor={COLORES.fondo}
    >
      {/* Header Info Superior */}
      <Box justifyContent="space-between" paddingX={1} marginTop={0}>
        <Text bold color={COLORES.texto}>
          {nombreArchivo ? basename(nombreArchivo) : 'sin_titulo.csv'}
        </Text>
        <Text color={COLORES.secundario}>
          {numFilas} filas · {numCols} columnas
        </Text>
      </Box>

      {/* Indicador de Valor o Prompt para Abrir/Guardar */}
      <Box marginY={1} paddingX={1}>
        {modo === 'ABRIR' ? (
          <Text color={COLORES.acento} bold>
            Abrir › <Text color={COLORES.texto}>{inputBuffer}</Text>
            <Text color={COLORES.acento}>█</Text>
          </Text>
        ) : modo === 'GUARDAR' ? (
          <Text color={COLORES.acento} bold>
            Guardar › <Text color={COLORES.texto}>{inputBuffer}</Text>
            <Text color={COLORES.acento}>█</Text>
          </Text>
        ) : (
          <Text color={COLORES.secundario}>
            Valor › <Text color={COLORES.texto}>{valorCeldaActual}</Text>
            {modo === 'EDICION' && <Text color={COLORES.acento}> █ [editando]</Text>}
          </Text>
        )}
      </Box>

      {/* Tabla de Datos */}
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {/* Cabeceras de columnas */}
        <Box flexDirection="row" marginBottom={0}>
          <Box width={anchoNumCol} justifyContent="flex-end" paddingRight={1}>
            <Text bold color={COLORES.secundario}>
              #
            </Text>
          </Box>
          {cabeceras.map((colName, idx) => {
            const esColSeleccionada = cursor.col === idx;
            return (
              <Box
                key={idx}
                width={anchoColumna}
                backgroundColor={esColSeleccionada ? COLORES.headerSelBg : undefined}
                paddingX={1}
              >
                <Text bold color={esColSeleccionada ? COLORES.acento : COLORES.secundario}>
                  {colName.padEnd(anchoColumna - 2).slice(0, anchoColumna - 2)}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Filas */}
        {filasVisibles.map((fila, relativeIdx) => {
          const absoluteIdx = offsetFila + relativeIdx;
          const esFilaSeleccionada = cursor.fila === absoluteIdx;

          return (
            <Box key={absoluteIdx} flexDirection="row">
              {/* Número de Fila */}
              <Box
                width={anchoNumCol}
                justifyContent="flex-end"
                paddingRight={1}
                backgroundColor={esFilaSeleccionada ? COLORES.numFilaSelBg : undefined}
              >
                <Text
                  bold={esFilaSeleccionada}
                  color={esFilaSeleccionada ? COLORES.numFilaSelFg : COLORES.secundario}
                >
                  {absoluteIdx + 1}
                </Text>
              </Box>

              {/* Celdas */}
              {cabeceras.map((_, colIdx) => {
                const esCeldaSeleccionada = esFilaSeleccionada && cursor.col === colIdx;
                const valor = fila[colIdx] || '';

                let bgColor = undefined;
                let colorTexto = COLORES.texto;

                if (esCeldaSeleccionada) {
                  bgColor = COLORES.seleccionBg;
                  colorTexto = COLORES.seleccionFg;
                }

                const textoFormateado = valor.padEnd(anchoColumna - 2).slice(0, anchoColumna - 2);

                return (
                  <Box key={colIdx} width={anchoColumna} paddingX={1} backgroundColor={bgColor}>
                    <Text bold={esCeldaSeleccionada} color={colorTexto}>
                      {textoFormateado}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>

      {/* Mensaje de Error (si existe) */}
      {mensajeError && (
        <Box paddingX={1}>
          <Text color={COLORES.error} bold>
            ⚠ {mensajeError}
          </Text>
        </Box>
      )}

      {/* Footer / Barra de Atajos */}
      <Box justifyContent="space-between" paddingX={1} marginTop={0}>
        <Box flexDirection="row">
          {modo === 'ABRIR' ? (
            <Text color={COLORES.secundario}>
              <Text bold color={COLORES.acento}>
                Enter
              </Text>{' '}
              abrir ·{' '}
              <Text bold color={COLORES.acento}>
                Esc
              </Text>{' '}
              cancelar
            </Text>
          ) : modo === 'GUARDAR' ? (
            <Text color={COLORES.secundario}>
              <Text bold color={COLORES.acento}>
                Enter
              </Text>{' '}
              guardar ·{' '}
              <Text bold color={COLORES.acento}>
                Esc
              </Text>{' '}
              cancelar
            </Text>
          ) : (
            <Text color={COLORES.secundario}>
              <Text bold color={COLORES.acento}>
                A
              </Text>{' '}
              abrir ·{' '}
              <Text bold color={COLORES.acento}>
                G
              </Text>{' '}
              guardar ·{' '}
              <Text bold color={COLORES.acento}>
                Enter
              </Text>{' '}
              editar ·{' '}
              <Text bold color={COLORES.acento}>
                &lt;
              </Text>{' '}
              ascendente ·{' '}
              <Text bold color={COLORES.acento}>
                &gt;
              </Text>{' '}
              descendente ·{' '}
              <Text bold color={COLORES.acento}>
                Esc
              </Text>{' '}
              salir
            </Text>
          )}
        </Box>
        <Text color={COLORES.secundario}>
          Fila {cursor.fila + 1} · Columna {cursor.col + 1}
        </Text>
      </Box>
    </Box>
  );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();