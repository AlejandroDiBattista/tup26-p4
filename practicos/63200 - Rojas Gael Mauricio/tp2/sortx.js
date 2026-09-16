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
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const widths = colWidths(data.headers, data.rows);
  const value = data.rows[row]?.[col] ?? '';

  useInput((input, key) => {
    // Mientras se edita una celda, las teclas van todas al texto de edición
    if (editing) {
      if (key.return) {
        setData(prev => {
          const rows = prev.rows.map(r => [...r]);
          rows[row][col] = editValue;
          return { ...prev, rows };
        });
        setEditing(false);
      } else if (key.escape) {
        setEditing(false);
      } else if (key.backspace || key.delete) {
        setEditValue(v => v.slice(0, -1));
      } else if (input) {
        setEditValue(v => v + input);
      }
      return;
    }

    // Navegación
    if (key.upArrow) setRow(r => Math.max(0, r - 1));
    if (key.downArrow) setRow(r => Math.min(data.rows.length - 1, r + 1));
    if (key.leftArrow) setCol(c => Math.max(0, c - 1));
    if (key.rightArrow) setCol(c => Math.min(data.headers.length - 1, c + 1));

    // Ordenamiento
    if (input === '<' || input === '>') {
      const dir = input === '<' ? 1 : -1;
      setData(prev => {
        const sorted = [...prev.rows].sort((a, b) => {
          const va = a[col], vb = b[col];
          const na = Number(va), nb = Number(vb);
          const cmp = (!isNaN(na) && !isNaN(nb)) ? na - nb : va.localeCompare(vb);
          return cmp * dir;
        });
        return { ...prev, rows: sorted };
      });
    }

    // Entrar en modo edición
    if (key.return) {
      setEditValue(value);
      setEditing(true);
    }
  });

  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Box, { justifyContent: 'space-between' },
      React.createElement(Text, { bold: true }, filePath),
      React.createElement(Text, {}, `${data.rows.length} filas · ${data.headers.length} columnas`)
    ),
    React.createElement(Text, { color: 'yellow' },
      editing ? `Editar > ${editValue}` : `Valor > ${value}`
    ),
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
      React.createElement(Text, { dimColor: true },
        editing
          ? 'Enter guardar · Esc cancelar'
          : 'A abrir · G guardar · Enter editar · < ascendente · > descendente · Esc salir'
      ),
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