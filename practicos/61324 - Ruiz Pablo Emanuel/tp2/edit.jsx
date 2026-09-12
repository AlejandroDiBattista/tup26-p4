#!/usr/bin/env -S node --import tsx

import React, { useEffect, useState } from "react";
import { render, Box, Text, useInput, useApp } from "ink";
import { readFile, writeFile } from "node:fs/promises";
import { TextInput } from "@inkjs/ui";
import { basename } from "node:path";

const COLUMNAS = process.stdout.columns || 80;
const FILAS = process.stdout.rows || 24;

const COLORES = {
  fondo: "#161310",
  borde: "#726b61",
  titulo: "#ede7db",
  secundario: "#ada79e",
  acento: "#edbb64",
};

async function leerCSV(nombreArchivo) {
  const contenido = await readFile(nombreArchivo, "utf8");
  const lineas = contenido.trim().split("\n");
  const encabezados = lineas[0].split(",");

  const filas = lineas.slice(1).map((lineas) => {
    return lineas.split(",");
  });
  return {
    encabezados,
    filas,
  };
}

function App() {
  const { exit } = useApp();

  const [encabezados, setEncabezados] = useState([]);
  const [filas, setFilas] = useState([]);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarArchivo() {
      try {
        const archivo = process.argv[2] || "empleados.csv";
        const datos = await leerCSV(archivo);

        setEncabezados(datos.encabezados);
        setFilas(datos.filas);
        setNombreArchivo(basename(archivo));
      } catch (error) {
        setError("No se puede abrir el archivo");
      }
    }
    cargarArchivo();
  }, []);

  useInput((tecla, key) => {
    if (key.escape) {
      exit();
    }
  });

  return (
    <Box
      width={COLUMNAS}
      height={FILAS}
      justifyContent="center"
      alignItems="center"
    >
      <Box
        width={COLUMNAS - 4}
        height={10}
        flexDirection="column"
        borderStyle="round"
        borderColor={COLORES.borde}
        backgroundColor={COLORES.fondo}
      >
        <Box
          flexGrow={1}
          flexDirection="colum"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            flexGrow={1}
            flexDirection="colum"
            justifyContent="center"
            alignItems="center"
          >
            <Text bold color={COLORES.titulo}>
              {nombreArchivo || "Editor CSV"}
            </Text>
            {error ? (
              <Text color="red">{error}</Text>
            ) : (
              <>
                <Text color={COLORES.secundario}>{filas.length} filas</Text>

                <Text color={COLORES.secundario}>
                  {encabezados.length} columnas
                </Text>

                <Text color={COLORES.titulo}>{encabezados.join(" | ")}</Text>
              </>
            )}
          </Box>
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
