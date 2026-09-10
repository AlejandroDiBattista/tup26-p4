#!/usr/bin/env -S node --import tsx

import React, {useState, useEffect} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';

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

function isNumericCol(data, col) {
  return data.every((f) => f[col].trim() !== '' && !Number.isNaN(Number(f[col])));
}

function sortData(data, col, desc, numeric) {
  return data.slice().sort((a, b) => {
    const res = numeric ? Number(a[col]) - Number(b[col]) : a[col].localeCompare(b[col]);
    return desc ? -res : res;
  });
}

function App({inicial}) {
  const {exit} = useApp();
  const {header, filename} = inicial;
  const [data, setData] = useState(inicial.data);
  const [selRow, setSelRow] = useState(0);
  const [selCol, setSelCol] = useState(0);
  const [offset, setOffset] = useState(0);
  const [mode, setMode] = useState('view');
  const visibleRows = Math.max(3, FILAS - 8);
  const widths = colWidths(header, data);
  const numAncho = String(data.length).length;
  const visibles = data.slice(offset, offset + visibleRows);
  const sinFilas = data.length === 0;

  useEffect(() => {
    if (selRow < offset) setOffset(selRow);
    else if (selRow >= offset + visibleRows) setOffset(selRow - visibleRows + 1);
  }, [selRow]);

  useInput((tecla, key) => {
    if (key.escape) {
      if (mode === 'view') exit();
      else setMode('view');
      return;
    }
    if (mode !== 'view') return;
    if (key.leftArrow) setSelCol((c) => Math.max(0, c - 1));
    if (key.rightArrow) setSelCol((c) => Math.min(header.length - 1, c + 1));
    if (key.upArrow && !sinFilas) setSelRow((r) => Math.max(0, r - 1));
    if (key.downArrow && !sinFilas) setSelRow((r) => Math.min(data.length - 1, r + 1));
    if (key.return && !sinFilas) setMode('edit');
    if (tecla === '<' && !sinFilas) setData((d) => sortData(d, selCol, false, isNumericCol(d, selCol)));
    if (tecla === '>' && !sinFilas) setData((d) => sortData(d, selCol, true, isNumericCol(d, selCol)));
  });

  function confirmarEdicion(valor) {
    const nueva = data.map((f) => f.slice());
    nueva[selRow][selCol] = valor;
    setData(nueva);
    setMode('view');
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box justifyContent="space-between">
        <Text bold color={COLORES.titulo}>{filename}</Text>
        <Text color={COLORES.secundario}>{data.length} filas · {header.length} columnas</Text>
      </Box>

      <Box marginTop={1}>
        <Text color={COLORES.acento}>Valor</Text>
        <Text color={COLORES.secundario}> {'>'} </Text>
        {mode === 'edit' ? (
          <TextInput defaultValue={data[selRow][selCol]} onSubmit={confirmarEdicion} />
        ) : (
          <Text color={COLORES.titulo}>{sinFilas ? '(sin filas)' : data[selRow][selCol]}</Text>
        )}
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

      <Box marginTop={1} justifyContent="space-between">
        <Text color={COLORES.secundario}>
          {mode === 'view' ? (
            <><Text bold color={COLORES.acento}>Enter</Text> editar · <Text bold color={COLORES.acento}>&lt;/&gt;</Text> ordenar · <Text bold color={COLORES.acento}>Esc</Text> salir</>
          ) : (
            <><Text bold color={COLORES.acento}>Enter</Text> confirmar · <Text bold color={COLORES.acento}>Esc</Text> cancelar</>
          )}
        </Text>
        <Text color={COLORES.secundario}>Fila {sinFilas ? '-' : selRow + 1} · Columna {selCol + 1}</Text>
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