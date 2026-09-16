#!/usr/bin/env node
import React, { useState } from 'react';
import { render, Text, Box } from 'ink';
import fs from 'fs';

function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map(line => line.split(','));
  return { headers, rows };
}

function App({ filePath }) {
  const [data] = useState(() => {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseCSV(content);
  });

  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Text, { bold: true }, filePath),
    React.createElement(Text, {}, `${data.rows.length} filas · ${data.headers.length} columnas`)
  );
}

const filePath = process.argv[2];
if (!filePath) {
  console.log('Uso: edit <archivo.csv>');
  process.exit(1);
}

render(React.createElement(App, { filePath }));