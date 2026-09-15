#!/usr/bin/env -S node --import tsx

import React, { useEffect, useState } from 'react';
import { render, Box, Text, useApp } from 'ink';
import { readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

const ANCHO = process.stdout.columns || 80;
const ALTO  = process.stdout.rows    || 24;
const TAM_CELDA = 16;
const P = {
  fondo: '#161310', borde: '#726b61', titulo: '#ede7db',
  secundario: '#ada79e', acento: '#edbb64',
};

function recortar(texto, ancho) {
  const v = String(texto ?? '');
  return v.length >= ancho ? v.slice(0, ancho - 2) + '...' : v.padEnd(ancho - 1);
}

function EditorTabla() {
  const { exit } = useApp();
  const [rutaArchivo, setRutaArchivo] = useState(null);
  const [encabezados, setEncabezados] = useState([]);
  const [registros,   setRegistros]   = useState([]);
  const [aviso,       setAviso]       = useState('');

  function interpretarCSV(texto) {
    const limpio = texto.trim();
    if (!limpio) throw new Error('El archivo CSV esta vacio.');
    const lineas   = limpio.split('\n').map(l => l.replace('\r', ''));
    const cabecera = lineas[0].split(',');
    const filas    = lineas.slice(1).map(l => l.split(','));
    if (filas.some(f => f.length !== cabecera.length))
      throw new Error('El archivo contiene filas con distinta cantidad de columnas.');
    setEncabezados(cabecera);
    setRegistros(filas);
  }

  async function leerArchivo(nombre) {
    try {
      interpretarCSV(await readFile(nombre, 'utf8'));
      setRutaArchivo(nombre);
      setAviso('Archivo abierto: ' + basename(nombre));
      return true;
    } catch (e) { setAviso('Error: ' + e.message); return false; }
  }

  const armarCSV = () =>
    [encabezados.join(','), ...registros.map(f => f.join(','))].join('\n');

  async function escribirArchivo(nombre) {
    try {
      if (!nombre.trim()) throw new Error('Debe indicar un nombre de archivo.');
      await writeFile(nombre, armarCSV(), 'utf8');
      setRutaArchivo(nombre);
      setAviso('Archivo guardado: ' + basename(nombre));
      return true;
    } catch (e) { setAviso('Error: ' + e.message); return false; }
  }

  useEffect(() => { if (process.argv[2]) leerArchivo(process.argv[2]); }, []);

  return (
    <Box width={ANCHO} height={ALTO} flexDirection='column' padding={1}>
      <Box flexDirection='column' flexGrow={1} borderStyle='round' borderColor={P.borde} backgroundColor={P.fondo} paddingX={1}>
        <Box justifyContent='space-between'>
          <Text bold color={P.titulo}>Editor CSV</Text>
          <Text color={P.acento}>{rutaArchivo ? basename(rutaArchivo) : 'Sin archivo'}</Text>
        </Box>
        <Text color={P.secundario}>Filas: {registros.length}{' | '}Columnas: {encabezados.length}</Text>
        {aviso && <Text color={P.secundario}>{aviso}</Text>}
      </Box>
    </Box>
  );
}

const app = render(<EditorTabla />);
await app.waitUntilExit();
console.clear();
