#!/usr/bin/env -S node --import tsx
import React, { useEffect, useState } from 'react';
import { render, Box, Text, useApp, useInput, useStdout } from 'ink';
import { TextInput } from '@inkjs/ui';
import { readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

async function abrir(archivo) {
  const texto = (await readFile(archivo, 'utf8')).replace(/^\uFEFF/, '');
  if (!texto || texto.includes('"')) throw new Error('El archivo está vacío o contiene comillas');
  const lineas = texto.split(/\r\n|\n|\r/);
  if (lineas.at(-1) === '') lineas.pop();
  const [cabecera, ...filas] = lineas.map(linea => linea.split(','));
  if (filas.some(fila => fila.length !== cabecera.length)) throw new Error('Las filas deben tener la misma cantidad de campos');
  return { archivo, cabecera, filas };
}

function App({ inicial }) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [pantalla, ajustar] = useState([stdout.columns || 80, stdout.rows || 24]);
  const [datos, cambiarDatos] = useState(null);
  const [[fila, columna], seleccionar] = useState([0, 0]);
  const [modo, cambiarModo] = useState(inicial ? 'ocupado' : 'abrir');
  const [mensaje, informar] = useState('');

  useEffect(() => {
    const resize = () => ajustar([stdout.columns || 80, stdout.rows || 24]);
    stdout.on('resize', resize);
    return () => stdout.off('resize', resize);
  }, [stdout]);

  async function cargar(nombre) {
    const contenido = await abrir(nombre);
    cambiarDatos(contenido);
    seleccionar([0, 0]);
    informar('');
  }

  useEffect(() => {
    if (inicial) cargar(inicial).catch(error => informar(error.message)).finally(() => cambiarModo(null));
  }, [inicial]);

  async function confirmar(valor) {
    if (modo === 'editar') {
      if (/[,\r\n"]/.test(valor)) {
        informar('La celda no admite comas, comillas ni saltos de línea');
        return;
      }
      const filas = datos.filas.map((registro, i) => i === fila
        ? registro.map((campo, j) => j === columna ? valor : campo)
        : registro);
      cambiarDatos({ ...datos, filas });
      informar('');
      cambiarModo(null);
      return;
    }
    const nombre = valor.trim();
    if (!nombre) {
      informar('Ingresá un nombre de archivo');
      return;
    }
    cambiarModo('ocupado');
    try {
      if (modo === 'abrir') {
        await cargar(nombre);
      } else {
        const texto = [datos.cabecera, ...datos.filas].map(registro => registro.join(',')).join('\n') + '\n';
        await writeFile(nombre, texto, 'utf8');
        cambiarDatos({ ...datos, archivo: nombre });
        informar('Guardado: ' + nombre);
      }
      cambiarModo(null);
    } catch (error) {
      informar(error.message);
      cambiarModo(modo);
    }
  }

  const cantidadFilas = datos?.filas.length ?? 0;
  const cantidadColumnas = datos?.cabecera.length ?? 0;
  useInput((input, key) => {
    if (modo === 'ocupado') return;
    if (key.escape) {
      if (modo) {
        cambiarModo(null);
        informar('');
      } else {
        exit();
      }
      return;
    }
    if (modo) return;
    if (input.toLowerCase() === 'a') cambiarModo('abrir');
    if (!datos) return;
    if (input.toLowerCase() === 'g') cambiarModo('guardar');
    if (key.return && cantidadFilas) cambiarModo('editar');
    if (key.upArrow) seleccionar([Math.max(0, fila - 1), columna]);
    if (key.downArrow && cantidadFilas) seleccionar([Math.min(cantidadFilas - 1, fila + 1), columna]);
    if (key.leftArrow) seleccionar([fila, Math.max(0, columna - 1)]);
    if (key.rightArrow) seleccionar([fila, Math.min(cantidadColumnas - 1, columna + 1)]);
    if (input === '<' || input === '>') {
      const collator = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });
      const sentido = input === '<' ? 1 : -1;
      const seleccionado = datos.filas[fila];
      const filas = [...datos.filas].sort((a, b) => sentido * collator.compare(a[columna], b[columna]));
      cambiarDatos({ ...datos, filas });
      seleccionar([Math.max(0, filas.indexOf(seleccionado)), columna]);
    }
  });

  const [ancho, alto] = pantalla;
  const anchoNumero = Math.max(3, String(cantidadFilas).length + 1);
  const anchoCelda = Math.max(5, Math.min(22, ancho - anchoNumero - 4));
  const visiblesX = Math.max(1, Math.floor((ancho - anchoNumero - 4) / anchoCelda));
  const visiblesY = Math.max(1, alto - 10);
  const inicioX = Math.floor(columna / visiblesX) * visiblesX;
  const inicioY = Math.floor(fila / visiblesY) * visiblesY;
  const valor = datos?.filas[fila]?.[columna] ?? '';
  const etiqueta = { abrir: 'Abrir archivo', guardar: 'Guardar como', editar: 'Editar celda' }[modo];

  function mostrarFila(registro, indice) {
    return (
      <Box key={indice}>
        <Box width={anchoNumero}><Text dimColor>{indice < 0 ? '#' : indice + 1}</Text></Box>
        {registro.slice(inicioX, inicioX + visiblesX).map((campo, i) => (
          <Box key={i} width={anchoCelda} paddingRight={1}>
            <Text bold={indice < 0} inverse={indice === fila && i + inicioX === columna} wrap="truncate-end">{campo}</Text>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      <Text bold color="yellow">Editor CSV{datos && ' · ' + basename(datos.archivo)}</Text>
      {datos && <Text>{cantidadFilas} filas · {cantidadColumnas} columnas</Text>}
      {datos && mostrarFila(datos.cabecera, -1)}
      {datos?.filas.slice(inicioY, inicioY + visiblesY).map((registro, i) => mostrarFila(registro, i + inicioY))}
      {cantidadFilas > 0 && <Text wrap="truncate-end">Fila {fila + 1}, columna {columna + 1} · {valor}</Text>}
      {mensaje && <Text color="yellow" wrap="truncate-end">{mensaje}</Text>}
      {modo === 'ocupado' && <Text>Procesando…</Text>}
      {etiqueta && (
        <Box>
          <Text>{etiqueta}{'  '}</Text>
          <TextInput key={modo} defaultValue={modo === 'editar' ? valor : modo === 'guardar' ? datos.archivo : ''} onSubmit={confirmar} />
        </Box>
      )}
      <Text dimColor wrap="truncate-end">A Abrir · G Guardar · Enter Editar · &lt;/&gt; Ordenar · Esc Volver/Salir</Text>
    </Box>
  );
}

render(<App inicial={process.argv[2]} />);
