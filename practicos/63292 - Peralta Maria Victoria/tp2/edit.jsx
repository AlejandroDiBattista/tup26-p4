#!/usr/bin/env -S node --import tsx

import React from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';

const COLUMNAS = process.stdout.columns || 80;
const FILAS = process.stdout.rows || 24;

const COLORES = {
  fondo: '#161310',
  borde: '#726b61',
  titulo: '#ede7db',
  secundario: '#ada79e',
  acento: '#edbb64',
};

function parseCSV(texto) {
  const lineas = texto.split(/\r\n|\n/).filter((l, i, arr) => !(l === '' && i === arr.length - 1));
  if (lineas.length === 0) throw new Error('el archivo está vacío');
  const filas = lineas.map((l) => l.split(','));
  const header = filas[0];
  const data = filas.slice(1);
  for (const f of data) {
    if (f.length !== header.length) throw new Error('las filas no tienen la misma cantidad de campos');
  }
  return {header, data};
}

function colWidths(header, data) {
  return header.map((h, i) => {
    let w = h.length;
    for (const f of data) w = Math.max(w, f[i].length);
    return w;
  });
}
function App({inicial}) {
  const {exit} = useApp();
  const {header, data, filename} = inicial;
  const widths = colWidths(header, data);
  const numAncho = String(data.length).length;

  useInput((tecla, key) => {
    if (key.escape) exit();
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box justifyContent="space-between">
        <Text bold color={COLORES.titulo}>{filename}</Text>
        <Text color={COLORES.secundario}>{data.length} filas · {header.length} columnas</Text>
      </Box>

      <Box marginTop={1}>
        <Text>{' '.repeat(numAncho + 1)}</Text>
        {header.map((h, i) => (
          <Text key={h} bold color={COLORES.acento}>{h.padEnd(widths[i] + 2)}</Text>
        ))}
      </Box>

      {data.map((f, ri) => (
        <Box key={ri}>
          <Text color={COLORES.secundario}>{String(ri + 1).padStart(numAncho)} </Text>
          {f.map((v, ci) => (
            <Text key={ci} color={COLORES.titulo}>{v.padEnd(widths[ci] + 2)}</Text>
          ))}
        </Box>
      ))}

      <Box marginTop={1}>
        <Text color={COLORES.secundario}><Text bold color={COLORES.acento}>Esc</Text> salir</Text>
      </Box>
    </Box>
  );
}

async function main() {
  const archivo = process.argv[2];
  const texto = await readFile(archivo, 'utf8');
  const {header, data} = parseCSV(texto);
  const app = render(<App inicial={{header, data, filename: archivo}} />);
  await app.waitUntilExit();
  console.clear();
}

main();