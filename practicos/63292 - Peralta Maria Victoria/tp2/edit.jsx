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
  const [header, setHeader] = useState(inicial.header);
  const [data, setData] = useState(inicial.data);
  const [filename, setFilename] = useState(inicial.filename);
  const [selRow, setSelRow] = useState(0);
  const [selCol, setSelCol] = useState(0);
  const [offset, setOffset] = useState(0);
  const [mode, setMode] = useState(inicial.header ? 'view' : 'open');
  const [error, setError] = useState(inicial.error);
  const visibleRows = Math.max(3, FILAS - 8);
  const sinFilas = header ? data.length === 0 : true;

  useEffect(() => {
    if (selRow < offset) setOffset(selRow);
    else if (selRow >= offset + visibleRows) setOffset(selRow - visibleRows + 1);
  }, [selRow]);

  useInput((tecla, key) => {
    if (key.escape) {
      if (mode === 'view' || !header) exit();
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
    if (tecla.toLowerCase() === 'a') { setError(null); setMode('open'); }
    if (tecla.toLowerCase() === 'g') { setError(null); setMode('save'); }
  });

  function confirmarEdicion(valor) {
    const nueva = data.map((f) => f.slice());
    nueva[selRow][selCol] = valor;
    setData(nueva);
    setMode('view');
  }

  async function abrir(ruta) {
    try {
      const texto = await readFile(ruta, 'utf8');
      const {header: h, data: d} = parseCSV(texto);
      setHeader(h);
      setData(d);
      setFilename(ruta);
      setSelRow(0);
      setSelCol(0);
      setOffset(0);
      setError(null);
      setMode('view');
    } catch (e) {
      setError(`no se pudo abrir ${ruta}: ${e.message}`);
    }
  }

  async function guardar(ruta) {
    try {
      const texto = [header, ...data].map((f) => f.join(',')).join('\n') + '\n';
      await writeFile(ruta, texto, 'utf8');
      setFilename(ruta);
      setError(null);
      setMode('view');
    } catch (e) {
      setError(`no se pudo guardar ${ruta}: ${e.message}`);
    }
  }

  if (!header) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color={COLORES.titulo}>Editor CSV</Text>
        <Box marginTop={1}>
          <Text color={COLORES.acento}>Abrir</Text>
          <Text color={COLORES.secundario}> {'>'} </Text>
          <TextInput defaultValue="" onSubmit={abrir} />
        </Box>
        {error && <Text color="red">{error}</Text>}
        <Box marginTop={1}>
          <Text color={COLORES.secundario}><Text bold color={COLORES.acento}>Esc</Text> salir</Text>
        </Box>
      </Box>
    );
  }

  const widths = colWidths(header, data);
  const numAncho = String(data.length).length;
  const visibles = data.slice(offset, offset + visibleRows);

  return (
    <Box flexDirection="column" padding={1}>
      <Box justifyContent="space-between">
        <Text bold color={COLORES.titulo}>{filename}</Text>
        <Text color={COLORES.secundario}>{data.length} filas · {header.length} columnas</Text>
      </Box>

      <Box marginTop={1}>
        <Text color={COLORES.acento}>{mode === 'open' ? 'Abrir' : mode === 'save' ? 'Guardar' : 'Valor'}</Text>
        <Text color={COLORES.secundario}> {'>'} </Text>
        {mode === 'edit' ? (
          <TextInput defaultValue={data[selRow][selCol]} onSubmit={confirmarEdicion} />
        ) : mode === 'open' ? (
          <TextInput defaultValue={filename || ''} onSubmit={abrir} />
        ) : mode === 'save' ? (
          <TextInput defaultValue={filename || ''} onSubmit={guardar} />
        ) : (
          <Text color={COLORES.titulo}>{sinFilas ? '(sin filas)' : data[selRow][selCol]}</Text>
        )}
      </Box>

      {error && <Text color="red">{error}</Text>}

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
            <><Text bold color={COLORES.acento}>A</Text> abrir · <Text bold color={COLORES.acento}>G</Text> guardar · <Text bold color={COLORES.acento}>Enter</Text> editar · <Text bold color={COLORES.acento}>&lt;/&gt;</Text> ordenar · <Text bold color={COLORES.acento}>Esc</Text> salir</>
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
  let inicial = {header: null, data: [], filename: null, error: null};

  if (archivo) {
    try {
      const texto = await readFile(archivo, 'utf8');
      const {header, data} = parseCSV(texto);
      inicial = {header, data, filename: archivo, error: null};
    } catch (e) {
      inicial = {header: null, data: [], filename: null, error: `no se pudo abrir ${archivo}: ${e.message}`};
    }
  }

  const app = render(<App inicial={inicial} />);
  await app.waitUntilExit();
  console.clear();
}

main();