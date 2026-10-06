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

function saveCSV(path, headers, rows) {
  const content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n') + '\n';
  fs.writeFileSync(path, content);
}

function colWidths(headers, rows) {
  return headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => (r[i] ?? '').length)) + 2
  );
}

function App({ filePath: initialPath }) {
  const [path, setPath] = useState(initialPath || '');
  const [data, setData] = useState(() => {
    if (!initialPath) return { headers: [], rows: [] };
    const content = fs.readFileSync(initialPath, 'utf-8');
    return parseCSV(content);
  });
  const [row, setRow] = useState(0);
  const [col, setCol] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  // mode: 'view' | 'opening' | 'saving'
  const [mode, setMode] = useState(initialPath ? 'view' : 'opening');
  const [textInput, setTextInput] = useState('');
  const [message, setMessage] = useState('');

  const widths = colWidths(data.headers, data.rows);
  const value = data.rows[row]?.[col] ?? '';

  useInput((input, key) => {
    // Modo abrir/guardar: se está escribiendo un nombre de archivo
    if (mode === 'opening' || mode === 'saving') {
      if (key.return) {
        try {
          if (mode === 'opening') {
            const content = fs.readFileSync(textInput, 'utf-8');
            setData(parseCSV(content));
            setPath(textInput);
          } else {
            saveCSV(textInput, data.headers, data.rows);
            setPath(textInput);
          }
          setMessage('');
          setMode('view');
        } catch (e) {
          setMessage('Error: ' + e.message);
        }
        setTextInput('');
        return;
      }
      if (key.escape) {
        setMode('view');
        setTextInput('');
        return;
      }
      if (key.backspace || key.delete) {
        setTextInput(v => v.slice(0, -1));
        return;
      }
      if (input) {
        setTextInput(v => v + input);
      }
      return;
    }

    // Modo edición de celda
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

    // Modo vista: navegación, orden y comandos
    if (key.upArrow) setRow(r => Math.max(0, r - 1));
    if (key.downArrow) setRow(r => Math.min(data.rows.length - 1, r + 1));
    if (key.leftArrow) setCol(c => Math.max(0, c - 1));
    if (key.rightArrow) setCol(c => Math.min(data.headers.length - 1, c + 1));

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

    if (key.return) {
      setEditValue(value);
      setEditing(true);
    }

    if (input === 'a') {
      setTextInput('');
      setMessage('');
      setMode('opening');
    }
    if (input === 'g') {
      setTextInput(path);
      setMessage('');
      setMode('saving');
    }
    if (key.escape) {
      process.exit(0);
    }
  });

  const statusLine =
    mode === 'opening' ? `Abrir > ${textInput}` :
    mode === 'saving' ? `Guardar > ${textInput}` :
    editing ? `Editar > ${editValue}` :
    `Valor > ${value}`;

  const footerLeft =
    mode === 'opening' || mode === 'saving' ? 'Enter confirmar · Esc cancelar' :
    editing ? 'Enter guardar · Esc cancelar' :
    'A abrir · G guardar · Enter editar · < ascendente · > descendente · Esc salir';

  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Box, { justifyContent: 'space-between' },
      React.createElement(Text, { bold: true }, path || '(sin archivo)'),
      React.createElement(Text, {}, `${data.rows.length} filas · ${data.headers.length} columnas`)
    ),
    React.createElement(Text, { color: message ? 'red' : 'yellow' }, message || statusLine),
    data.headers.length > 0 && React.createElement(Box, {},
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
      React.createElement(Text, { dimColor: true }, footerLeft),
      React.createElement(Text, { dimColor: true },
        data.rows.length > 0 ? `Fila ${row + 1} · Columna ${col + 1}` : ''
      )
    )
  );
}

const filePath = process.argv[2];
render(React.createElement(App, { filePath }));