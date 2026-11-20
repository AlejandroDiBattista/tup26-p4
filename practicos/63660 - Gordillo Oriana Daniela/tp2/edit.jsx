#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

const ANCHO = process.stdout.columns || 80;
const ALTO = process.stdout.rows || 24;
const ANCHO_CELDA = 16;
const ANCHO_INDICE = 5;

const COLORES = {
  fondo: '#161310',
  borde: '#726b61',
  titulo: '#ede7db',
  secundario: '#ada79e',
  acento: '#edbb64',
  seleccion: '#f5f5f5',
  textoSeleccion: '#000000',
  error: '#ff6b6b',
  exito: '#69db7c',
};

function recortar(texto, ancho) {
  const v = String(texto ?? '');
  return v.length >= ancho ? v.slice(0, ancho - 2) + '..' : v.padEnd(ancho);
}

function parsearCSV(contenido) {
  const lineas = contenido
    .split(/\r?\n/)
    .map(linea => linea.trim())
    .filter(linea => linea.length > 0);

  if (lineas.length === 0) {
    return { encabezados: [], filas: [] };
  }

  const encabezados = lineas[0].split(',').map(c => c.trim());
  const filas = lineas.slice(1).map(linea => linea.split(',').map(c => c.trim()));

  return { encabezados, filas };
}

function formatearCSV(encabezados, filas) {
  const cabecera = encabezados.join(',');
  const cuerpo = filas.map(f => f.join(',')).join('\n');
  return cabecera + (cuerpo ? '\n' + cuerpo : '');
}

function EditorTabla() {
  const { exit } = useApp();
  const [rutaArchivo, setRutaArchivo] = useState(process.argv[2] || 'empleados.csv');
  const [encabezados, setEncabezados] = useState([]);
  const [filas, setFilas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('normal');

  const [filaSeleccionada, setFilaSeleccionada] = useState(0);
  const [colSeleccionada, setColSeleccionada] = useState(0);
  const [filaInicio, setFilaInicio] = useState(0);

  // Modos: 'tabla' | 'editar' | 'abrir' | 'guardar'
  const [modo, setModo] = useState('tabla');
  const [bufferTexto, setBufferTexto] = useState('');

  const filasVisibles = Math.max(3, Math.min(10, ALTO - 14));

  async function cargarArchivo(ruta) {
    try {
      const contenido = await readFile(ruta, 'utf-8');
      const { encabezados: enc, filas: fil } = parsearCSV(contenido);
      if (enc.length === 0) {
        throw new Error('El archivo CSV está vacío.');
      }
      setEncabezados(enc);
      setFilas(fil);
      setRutaArchivo(ruta);
      setFilaSeleccionada(0);
      setColSeleccionada(0);
      setFilaInicio(0);
      setMensaje(`Archivo cargado: ${basename(ruta)}`);
      setTipoMensaje('exito');
      return true;
    } catch (err) {
      setMensaje(`Error al abrir: ${err.message}`);
      setTipoMensaje('error');
      return false;
    }
  }

  async function guardarArchivo(ruta) {
    try {
      if (!ruta || !ruta.trim()) {
        throw new Error('Debe especificar un nombre de archivo válido.');
      }
      const contenido = formatearCSV(encabezados, filas);
      await writeFile(ruta.trim(), contenido, 'utf-8');
      setRutaArchivo(ruta.trim());
      setMensaje(`Archivo guardado exitosamente: ${basename(ruta)}`);
      setTipoMensaje('exito');
      return true;
    } catch (err) {
      setMensaje(`Error al guardar: ${err.message}`);
      setTipoMensaje('error');
      return false;
    }
  }

  function ordenarPorColumna(colIdx, ascendente = true) {
    if (filas.length === 0 || colIdx < 0 || colIdx >= encabezados.length) return;

    const copia = [...filas];
    copia.sort((a, b) => {
      const valA = a[colIdx] ?? '';
      const valB = b[colIdx] ?? '';

      const numA = Number(valA);
      const numB = Number(valB);

      let res = 0;
      if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
        res = numA - numB;
      } else {
        res = String(valA).localeCompare(String(valB), 'es', { numeric: true });
      }

      return ascendente ? res : -res;
    });

    setFilas(copia);
    const nombreCol = encabezados[colIdx] || `Columna ${colIdx + 1}`;
    setMensaje(`Ordenado por ${nombreCol} (${ascendente ? 'ascendente' : 'descendente'})`);
    setTipoMensaje('normal');
  }

  useEffect(() => {
    if (rutaArchivo) {
      cargarArchivo(rutaArchivo);
    }
  }, []);

  useInput(
    (input, key) => {
      // Si estamos en un modo de entrada de texto (editar, abrir, guardar)
      if (modo !== 'tabla') {
        if (key.escape) {
          setModo('tabla');
          setMensaje('Acción cancelada.');
          setTipoMensaje('normal');
          return;
        }

        if (key.return) {
          if (modo === 'editar') {
            const nuevasFilas = filas.map((fila, fIdx) => {
              if (fIdx === filaSeleccionada) {
                const nuevaFila = [...fila];
                nuevaFila[colSeleccionada] = bufferTexto;
                return nuevaFila;
              }
              return fila;
            });
            setFilas(nuevasFilas);
            setMensaje(`Celda [${filaSeleccionada + 1}, ${colSeleccionada + 1}] actualizada.`);
            setTipoMensaje('exito');
            setModo('tabla');
          } else if (modo === 'abrir') {
            const destino = bufferTexto.trim() || rutaArchivo;
            cargarArchivo(destino);
            setModo('tabla');
          } else if (modo === 'guardar') {
            const destino = bufferTexto.trim() || rutaArchivo;
            guardarArchivo(destino);
            setModo('tabla');
          }
          return;
        }

        if (key.backspace || key.delete) {
          setBufferTexto(prev => prev.slice(0, -1));
          return;
        }

        if (input && !key.ctrl && !key.meta) {
          setBufferTexto(prev => prev + input);
          return;
        }

        return;
      }

      // Modo tabla normal
      if (key.escape) {
        exit();
        return;
      }

      if (key.upArrow) {
        setFilaSeleccionada(prev => {
          const sig = Math.max(0, prev - 1);
          if (sig < filaInicio) {
            setFilaInicio(sig);
          }
          return sig;
        });
        return;
      }

      if (key.downArrow) {
        setFilaSeleccionada(prev => {
          const sig = Math.min(Math.max(0, filas.length - 1), prev + 1);
          if (sig >= filaInicio + filasVisibles) {
            setFilaInicio(sig - filasVisibles + 1);
          }
          return sig;
        });
        return;
      }

      if (key.leftArrow) {
        setColSeleccionada(prev => Math.max(0, prev - 1));
        return;
      }

      if (key.rightArrow) {
        setColSeleccionada(prev => Math.min(Math.max(0, encabezados.length - 1), prev + 1));
        return;
      }

      if (input === '<' || input === ',') {
        ordenarPorColumna(colSeleccionada, true);
        return;
      }

      if (input === '>' || input === '.') {
        ordenarPorColumna(colSeleccionada, false);
        return;
      }

      if (input === 'a' || input === 'A') {
        setModo('abrir');
        setBufferTexto('');
        setMensaje('Abrir archivo CSV');
        setTipoMensaje('normal');
        return;
      }

      if (input === 'g' || input === 'G') {
        setModo('guardar');
        setBufferTexto(rutaArchivo || 'empleados.csv');
        setMensaje('Guardar archivo CSV');
        setTipoMensaje('normal');
        return;
      }

      if (key.return) {
        if (filas.length > 0 && encabezados.length > 0) {
          const actual = filas[filaSeleccionada]?.[colSeleccionada] ?? '';
          setBufferTexto(actual);
          setModo('editar');
          setMensaje(`Editando Fila ${filaSeleccionada + 1}, Columna ${colSeleccionada + 1}`);
          setTipoMensaje('normal');
        }
        return;
      }
    },
    { isActive: Boolean(process.stdin.isTTY) }
  );

  const celdaActual = filas[filaSeleccionada]?.[colSeleccionada] ?? '';
  const filasParaMostrar = filas.slice(filaInicio, filaInicio + filasVisibles);

  return (
    <Box width={ANCHO} height={ALTO} flexDirection="column" padding={1}>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={COLORES.borde}
        backgroundColor={COLORES.fondo}
        paddingX={1}
      >
        {/* Cabecera superior con archivo y estadísticas */}
        <Box justifyContent="space-between">
          <Text bold color={COLORES.titulo}>Editor CSV</Text>
          <Text color={COLORES.acento}>{basename(rutaArchivo)}</Text>
        </Box>
        <Text color={COLORES.secundario}>
          {filas.length} filas · {encabezados.length} columnas
        </Text>

        {/* Valor y posición actual */}
        <Box marginY={1}>
          <Text bold color={COLORES.acento}>Valor {'>'} </Text>
          <Text color={COLORES.titulo}>{celdaActual || '(vacío)'}</Text>
        </Box>

        {/* Modal / Diálogo de entrada de texto si está activo */}
        {modo !== 'tabla' ? (
          <Box
            flexDirection="column"
            borderStyle="single"
            borderColor={COLORES.acento}
            paddingX={1}
            marginY={1}
          >
            <Text bold color={COLORES.acento}>
              {modo === 'editar' ? 'Editar celda' : modo === 'abrir' ? 'Abrir archivo' : 'Guardar archivo'}
            </Text>
            <Box flexDirection="row">
              <Text color={COLORES.secundario}>
                {modo === 'editar' ? 'Nuevo valor: ' : 'Nombre del archivo: '}
              </Text>
              <Text bold color={COLORES.titulo}>{bufferTexto}</Text>
              <Text color={COLORES.acento}>_</Text>
            </Box>
            <Text color={COLORES.secundario}>
              [Enter] Confirmar  ·  [Esc] Cancelar
            </Text>
          </Box>
        ) : null}

        {/* Encabezado de la tabla */}
        <Box flexDirection="row" marginBottom={1}>
          <Box width={ANCHO_INDICE}>
            <Text bold color={COLORES.secundario}>#</Text>
          </Box>
          {encabezados.map((col, idx) => (
            <Box key={idx} width={ANCHO_CELDA}>
              <Text bold color={colSeleccionada === idx ? COLORES.acento : COLORES.titulo}>
                {recortar(col.toUpperCase(), ANCHO_CELDA - 1)}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Filas de datos visibles con scroll */}
        {filasParaMostrar.map((fila, indexRelativo) => {
          const indexReal = filaInicio + indexRelativo;
          return (
            <Box key={indexReal} flexDirection="row">
              <Box width={ANCHO_INDICE}>
                <Text color={COLORES.secundario}>{indexReal + 1}</Text>
              </Box>
              {fila.map((celda, cIdx) => {
                const activo = indexReal === filaSeleccionada && cIdx === colSeleccionada;
                return (
                  <Box key={cIdx} width={ANCHO_CELDA}>
                    <Text
                      color={activo ? COLORES.textoSeleccion : COLORES.titulo}
                      backgroundColor={activo ? COLORES.seleccion : undefined}
                      bold={activo}
                    >
                      {recortar(celda, ANCHO_CELDA - 1)}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          );
        })}

        {/* Barra inferior de comandos y posición */}
        <Box marginTop={1} justifyContent="space-between">
          <Text color={COLORES.secundario}>
            <Text bold color={COLORES.acento}>A</Text> abrir ·{' '}
            <Text bold color={COLORES.acento}>G</Text> guardar ·{' '}
            <Text bold color={COLORES.acento}>Enter</Text> editar ·{' '}
            <Text bold color={COLORES.acento}>{'<'}</Text> asc ·{' '}
            <Text bold color={COLORES.acento}>{'>'}</Text> desc ·{' '}
            <Text bold color={COLORES.acento}>Esc</Text> salir
          </Text>
          <Text color={COLORES.secundario}>
            Fila {filas.length > 0 ? filaSeleccionada + 1 : 0} · Columna {encabezados.length > 0 ? colSeleccionada + 1 : 0}
          </Text>
        </Box>

        {/* Mensaje de estado o error */}
        {mensaje ? (
          <Box marginTop={1}>
            <Text
              color={
                tipoMensaje === 'error'
                  ? COLORES.error
                  : tipoMensaje === 'exito'
                  ? COLORES.exito
                  : COLORES.acento
              }
            >
              {mensaje}
            </Text>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

const app = render(<EditorTabla />);
if (process.stdin.isTTY) {
  await app.waitUntilExit();
  console.clear();
}