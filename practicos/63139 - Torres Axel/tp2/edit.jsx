#!/usr/bin/env -S node --import tsx

import { render, Box, Text, useInput, useApp } from "ink";
import { readFile, writeFile } from "node:fs/promises";
import { TextInput } from "@inkjs/ui";
import { basename } from "node:path";
import React, { useEffect, useState } from "react";
const COLUMNAS = process.stdout.columns || 80;
const FILAS = process.stdout.rows || 24;

const COLORES = {
  fondo: "#161310",
  borde: "#726b61",
  titulo: "#ede7db",
  secundario: "#ada79e",
  acento: "#edbb64",
};
const ruta_archivo = process.argv[2];
function App() {
  const { exit } = useApp();

  useInput((tecla, key) => {
    if (key.escape) {
      exit();
    }
    if (key.rightArrow || tecla.toLocaleLowerCase() === "d") {
      setColumnaSeleccionada((actual) =>
        Math.min(actual + 1, columnas.length - 1),
      );
    }
    if (key.leftArrow || tecla.toLocaleLowerCase() === "s") {
      setColumnaSeleccionada((actual) => Math.max(actual - 1, 0));
    }
    if (key.downArrow || tecla.toLocaleLowerCase() === "x") {
      setFilaSeleccionada((actual) => Math.min(actual + 1, filas.length - 1));
    }
    if (key.upArrow || tecla.toLocaleLowerCase() === "w") {
      setFilaSeleccionada((actual) => Math.max(actual - 1, 0));
    }
  });
  const [contenido, setContenido] = useState("");
  const [rutaArchivo, setRutaArchivo] = useState(ruta_archivo);
  const lineas = contenido.replace(/\r\n?/g, "\n").split("\n");
  const cabecera = lineas[0];
  const columnas = cabecera.split(",");
  const seguidas = lineas.slice(1);
  const filas = seguidas.map((fila) => fila.split(","));
  const [filaSeleccionada, setFilaSeleccionada] = useState(0);
  const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);
  useEffect(() => {
    async function leerArchivo() {
      try {
        const texto = await readFile(rutaArchivo, "utf8");
        setContenido(texto);
      } catch (error) {
        console.log("error al leer archivo", error.message);
      }
    }
    if (rutaArchivo) {
      leerArchivo();
    }
  }, [rutaArchivo]);
  return (
    <Box
      width={COLUMNAS}
      height={FILAS}
      justifyContent="center"
      alignItems="center"
    >
      <Box
        width={70}
        flexDirection="column"
        borderStyle="round"
        borderColor={COLORES.borde}
        backgroundColor={COLORES.fondo}
      >
        <Box flexGrow={1} justifyContent="center" alignItems="center">
          <Text bold color={COLORES.titulo}>
            Editor CSV
          </Text>
        </Box>
        <Text>Columna:{columnaSeleccionada}</Text>
        <Text>Fila:{filaSeleccionada}</Text>
        <Box flexDirection="row">
          <Box width={4} flexShrink={0} />
          {columnas.map((columna, indice) => (
            <Box key={indice} width={12} flexShrink={0}>
              <Text key={indice}>{columna}</Text>
            </Box>
          ))}
        </Box>
        {filas.slice(0, 5).map((fila, indiceFila) => (
          <Box key={indiceFila} flexDirection="row">
            <Box width={4} flexShrink={0}>
              <Text>{indiceFila + 1}</Text>
            </Box>
            <Box width={12} flexShrink={0}>
              <Text wrap="truncate">{fila[0]}</Text>
            </Box>
            <Box width={12} flexShrink={0}>
              <Text wrap="truncate">{fila[1]}</Text>
            </Box>
            <Box width={12} flexShrink={0}>
              <Text wrap="truncate">{fila[2]}</Text>
            </Box>
            <Box width={12} flexShrink={0}>
              <Text wrap="truncate">{fila[3]}</Text>
            </Box>
            <Box width={12} flexShrink={0}>
              <Text wrap="truncate">{fila[4]}</Text>
            </Box>
          </Box>
        ))}
        <Text color={COLORES.secundario}>
          <Text bold color={COLORES.acento}>
            {" "}
            Esc
          </Text>
          {""}
          salir
        </Text>
      </Box>
    </Box>
  );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();
