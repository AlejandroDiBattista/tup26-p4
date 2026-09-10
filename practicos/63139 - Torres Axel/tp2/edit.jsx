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
  });
  const [contenido, setContenido] = useState("");
  const [rutaArchivo, setRutaArchivo] = useState(ruta_archivo);
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
        width={40}
        height={10}
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
        <Text color={COLORES.secundario}>
          <Text bold color={COLORES.acento}>
            {" "}
            Esc
          </Text>{" "}
          salir
        </Text>
      </Box>
    </Box>
  );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();
