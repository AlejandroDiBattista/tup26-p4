#!/usr/bin/env -S node --import tsx

import React, { useState } from 'react';
import { render, Box, Text, useApp } from 'ink';

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
  const [encabezados, setEncabezados] = useState([]);
  const [registros,   setRegistros]   = useState([]);

  return (
    <Box width={ANCHO} height={ALTO} flexDirection='column' padding={1}>
      <Box flexDirection='column' flexGrow={1} borderStyle='round' borderColor={P.borde} backgroundColor={P.fondo} paddingX={1}>
        <Text bold color={P.titulo}>Editor CSV</Text>
        <Text color={P.secundario}>Sin archivo cargado.</Text>
      </Box>
    </Box>
  );
}

const app = render(<EditorTabla />);
await app.waitUntilExit();
console.clear();
