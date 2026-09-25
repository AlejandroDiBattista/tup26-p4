#!/usr/bin/env -S node --import tsx

import React from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import fs from 'fs';

const COLUMNAS = process.stdout.columns || 80;
const FILAS = process.stdout.rows || 24;

const COLORES = {
  fondo: '#161310',
  borde: '#726b61',
  titulo: '#ede7db',
  secundario: '#ada79e',
  acento: '#edbb64',
};

function App() {
  const { exit } = useApp();
  const [data, setData] = React.useState([]);
  const [pos, setPos] = React.useState({ row: 1, col: 0 }); // celda seleccionada
  const [editing, setEditing] = React.useState(false); // modo edición
  const [inputValue, setInputValue] = React.useState(""); // valor nuevo

  // Leer CSV
  React.useEffect(() => {
    const content = fs.readFileSync('empleados.csv', 'utf8');
    const rows = content.trim().split('\n').map(r => r.split(','));
    setData(rows);
  }, []);

  // Manejo de teclas
  useInput((input, key) => {
    if (key.escape) {
      if (editing) {
        setEditing(false); // cancelar edición
      } else {
        exit(); // salir del programa
      }
    }

    // Navegación
    if (!editing) {
      if (key.upArrow) setPos(p => ({ ...p, row: Math.max(1, p.row - 1) }));
      if (key.downArrow) setPos(p => ({ ...p, row: Math.min(data.length - 1, p.row + 1) }));
      if (key.leftArrow) setPos(p => ({ ...p, col: Math.max(0, p.col - 1) }));
      if (key.rightArrow) setPos(p => ({ ...p, col: Math.min(data[0].length - 1, p.col + 1) }));

      // Ordenar por columna
      if (input === '<') {
        const header = data[0];
        const body = [...data.slice(1)].sort((a, b) => a[pos.col].localeCompare(b[pos.col]));
        setData([header, ...body]);
      }
      if (input === '>') {
        const header = data[0];
        const body = [...data.slice(1)].sort((a, b) => b[pos.col].localeCompare(a[pos.col]));
        setData([header, ...body]);
      }

      // Guardar archivo
      if (input.toLowerCase() === 'g') {
        fs.writeFileSync('empleados_guardado.csv', data.map(r => r.join(',')).join('\n'));
      }

      // Editar celda
      if (key.return) {
        setEditing(true);
        setInputValue(data[pos.row][pos.col]);
      }
    } else {
      // Si estamos editando, cada tecla se agrega al valor
      if (key.return) {
        const newData = [...data];
        newData[pos.row][pos.col] = inputValue;
        setData(newData);
        setEditing(false);
      } else {
        setInputValue(prev => prev + input); // acumula caracteres
      }
    }
  });

  return (
    <Box width={COLUMNAS} height={FILAS} flexDirection="column" alignItems="center">
      <Text bold color={COLORES.titulo}>Editor CSV</Text>

      {/* Info del archivo */}
      <Text color={COLORES.secundario}>
        Archivo: empleados.csv | Filas: {data.length - 1} | Columnas: {data[0]?.length}
      </Text>

      {/* Tabla */}
      {data.map((row, i) => (
        <Box key={i}>
          {/* Número de fila */}
          <Text color={COLORES.secundario}>{String(i).padEnd(4)}</Text>
          {row.map((cell, j) => (
            <Text
              key={j}
              color={pos.row === i && pos.col === j ? COLORES.acento : (i === 0 ? COLORES.titulo : COLORES.secundario)}
            >
              {cell.padEnd(15)}
            </Text>
          ))}
        </Box>
      ))}

      {/* Modo edición */}
      {editing && (
        <Text color={COLORES.acento}>
          Editando celda [{pos.row},{pos.col}]: {inputValue}
        </Text>
      )}

      <Text color={COLORES.secundario}>
        <Text bold color={COLORES.acento}>Flechas</Text> mover | 
        <Text bold color={COLORES.acento}> &lt; / &gt; </Text> ordenar | 
        <Text bold color={COLORES.acento}> G </Text> guardar | 
        <Text bold color={COLORES.acento}> Enter </Text> editar | 
        <Text bold color={COLORES.acento}> Esc </Text> cancelar/salir
      </Text>
    </Box>
  );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();

