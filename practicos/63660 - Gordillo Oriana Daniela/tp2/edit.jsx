#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useApp } from 'ink';
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

  async function cargarArchivo(ruta) {
    try {
      const contenido = await readFile(ruta, 'utf-8');
      const { encabezados: enc, filas: fil } = parsearCSV(contenido);
      setEncabezados(enc);
      setFilas(fil);
      setRutaArchivo(ruta);
      setMensaje(`Archivo cargado: ${basename(ruta)}`);
    } catch (err) {
      setMensaje(`Error al leer archivo: ${err.message}`);
    }
  }

  useEffect(() => {
    if (rutaArchivo) {
      cargarArchivo(rutaArchivo);
    }
  }, []);

  return (
    <Box width={ANCHO} height={ALTO} flexDirection="column" padding={1}>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={COLORES.borde}
        backgroundColor={COLORES.fondo}
        paddingX={1}
      >
        <Box justifyContent="space-between">
          <Text bold color={COLORES.titulo}>Editor CSV</Text>
          <Text color={COLORES.acento}>{basename(rutaArchivo)}</Text>
        </Box>
        <Text color={COLORES.secundario}>
          Filas: {filas.length} · Columnas: {encabezados.length}
        </Text>
        {mensaje ? <Text color={COLORES.acento}>{mensaje}</Text> : null}
      </Box>
    </Box>
  );
}

const app = render(<EditorTabla />);
await app.waitUntilExit();
console.clear();