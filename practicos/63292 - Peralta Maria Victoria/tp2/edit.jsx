#!/usr/bin/env -S node --import tsx

import React, {useState, useEffect} from 'react';
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
  const [selRow, setSelRow] = useState(0);
  const [selCol, setSelCol] = useState(0);
  const [offset, setOffset] = useState(0);
  const visibleRows = Math.max(3, FILAS - 8);
  const widths = colWidths(header, data);
  const numAncho = String(data.length).length;
  const visibles = data.slice(offset, offset + visibleRows);

  useEffect(() => {
    if (selRow < offset) setOffset(selRow);
    else if (selRow >= offset + visibleRows) setOffset(selRow - visibleRows + 1);
  }, [selRow]);

  useInput((tecla, key) => {
    if (key.escape) exit();
    if (key.leftArrow) setSelCol((c) => Math.max(0, c - 1));
    if (key.rightArrow) setSelCol((c) => Math.min(header.length - 1, c + 1));
    if (key.upArrow) setSelRow((r) => Math.max(0, r - 1));
    if (key.downArrow) setSelRow((r) => Math.min(data.length - 1, r + 1));
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
          <Text key={h} bold backgroundColor={i === selCol ? COLORES.acento : undefined} color={i === selCol ? COLORES.fondo : COLORES.acento}>
            {h.padEnd(widths[i] + 2)}
          </Text>
        ))}
      </Box>

      {visibles.map((f, vi) => {
        const ri = offset + vi;
        return (
          <Box key={ri}>
            <Text backgroundColor={ri === selRow ? COLORES.acento : undefined} color={ri === selRow ? COLORES.fondo : COLORES.secundario}>
              {String(ri + 1).padStart(numAncho)}{' '}
            </Text>
            {f.map((v, ci) => (
              <Text key={ci} backgroundColor={ri === selRow && ci === selCol ? COLORES.titulo : undefined} color={ri === selRow && ci === selCol ? COLORES.fondo : COLORES.titulo}>
                {v.padEnd(widths[ci] + 2)}
              </Text>
            ))}
          </Box>
        );
      })}

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