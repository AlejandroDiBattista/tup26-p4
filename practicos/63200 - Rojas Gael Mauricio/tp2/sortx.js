#!/usr/bin/env node
import React, { useState } from 'react';
import { render, Text, Box, useInput } from 'ink';
import fs from 'fs';

function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map(line => line.split(','));
  return { headers, rows };
}

function colWidths(headers, rows) {
  return headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => (r[i] ?? '').length)) + 2
  );
}

function App({ filePath }) {
  const [data, setData] = useState(() => {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseCSV(content);
  });
  const [row, setRow] = useState(0);
  const [col, setCol] = useState(0);

  const widths = colWidths(data.headers, data.rows);

  useInput((input, key) => {
    if (key.upArrow) setRow(r => Math.max(0, r - 1));
    if (key.downArrow) setRow(r => Math.min(data.rows.length - 1, r + 1));
    if (key.leftArrow) setCol(c => Math.max(0, c - 1));
    if (key.rightArrow) setCol(c => Math.min(data.headers.length - 1, c + 1));
  });

  const value = data.rows[row]?.[col] ?? '';

  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Box, { justifyContent: 'space-between' },
      React.createElement(Text, { bold: true }, filePath),
      React.createElement(Text, {}, `${data.rows.length} filas · ${data.headers.length} columnas`)
    ),
    React.createElement(Text, { color: 'yellow' }, `Valor > ${value}`),
    React.createElement(Box, {},
      React.createElement(Text, {}, '   '),
      ...data.headers.map((h, i) =>
        React.createElement(Text, { key: i, bold: true, underline: true }, h.padEnd(widths[i]))
      )
    ),
    ...data.rows.map((r, ri) =>
      React.createElement(Box, { key: ri },
        React.createElement(Text, {}, String(ri + 1).padStart(2) + ' '),
        ...r.map((v, ci) =>
          React.createElement(Text, {
            key: ci,
            inverse: ri === row && ci === col
          }, v.padEnd(widths[ci]))
        )
      )
    ),
    React.createElement(Box, { justifyContent: 'space-between', marginTop: 1 },
      React.createElement(Text, { dimColor: true }, 'A abrir · G guardar · Enter editar · < ascendente · > descendente · Esc salir'),
      React.createElement(Text, { dimColor: true }, `Fila ${row + 1} · Columna ${col + 1}`)
    )
  );
}

const filePath = process.argv[2];
if (!filePath) {
  console.log('Uso: edit <archivo.csv>');
  process.exit(1);
}

render(React.createElement(App, { filePath }));