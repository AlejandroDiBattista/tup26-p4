#!/usr/bin/env -S node --import tsx

import React from "react";
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

function App() {
  const { exit } = useApp();

  const [archivo, setArchivo] = React.useState(null);
  const [cabecera, setCabecera] = React.useState([]);
  const [datos, setDatos] = React.useState([]);
  const [filaSeleccionada, setFilaSeleccionada] = React.useState(0);
  const [columnaSeleccionada, setColumnaSeleccionada] = React.useState(0);

  const [modo, setModo] = React.useState("normal"); // "normal" | "abrir" | "guardar" | "editar"
  const [error, setError] = React.useState(null);

  async function abrirArchivo(nombre) {
    const contenido = await readFile(nombre, "utf8");

    const lineas = contenido.trim().split("\n");

    const nuevaCabecera = lineas[0].split(",");

    const nuevosDatos = lineas.slice(1).map((linea) => linea.split(","));

    setArchivo(nombre);
    setCabecera(nuevaCabecera);
    setDatos(nuevosDatos);
  }

  async function guardarArchivo(nombre) {
    const lineas = [cabecera.join(","), ...datos.map((fila) => fila.join(","))];
    await writeFile(nombre, lineas.join("\n") + "\n", "utf8");
    setArchivo(nombre);
  }

  async function manejarSubmitAbrir(nombre) {
    try {
      await abrirArchivo(nombre);
      setModo("normal");
      setError(null);
    } catch {
      setError(`No se pudo abrir "${nombre}"`);
    }
  }

  async function manejarSubmitGuardar(nombre) {
    try {
      await guardarArchivo(nombre);
      setModo("normal");
      setError(null);
    } catch {
      setError(`No se pudo guardar "${nombre}"`);
    }
  }

  React.useEffect(() => {
    const archivoInicial = process.argv[2];

    if (archivoInicial) {
      abrirArchivo(archivoInicial);
    }
  }, []);

  useInput((tecla, key) => {
    if (modo !== "normal") {
      if (key.escape) {
        setModo("normal");
        setError(null);
      }
      return;
    }

    if (key.escape) {
      exit();
    }

    if (tecla === "a") {
      setModo("abrir");
      return;
    }

    if (tecla === "g") {
      setModo("guardar");
      return;
    }

    if (key.upArrow) {
      setFilaSeleccionada((fila) => Math.max(0, fila - 1));
    }

    if (key.downArrow) {
      setFilaSeleccionada((fila) => Math.min(datos.length - 1, fila + 1));
    }

    if (key.leftArrow) {
      setColumnaSeleccionada((columna) => Math.max(0, columna - 1));
    }

    if (key.rightArrow) {
      setColumnaSeleccionada((columna) =>
        Math.min(cabecera.length - 1, columna + 1),
      );
    }
  });

  return (
    <Box width={COLUMNAS} height={FILAS} flexDirection="column" padding={1}>
      <Text color={COLORES.titulo} bold>
        Editor CSV
      </Text>

      <Text color={COLORES.secundario}>
        {archivo ?? "No se abrió ningún archivo"}
      </Text>

      <Text color={COLORES.acento}>
        Fila: {filaSeleccionada} | Columna: {columnaSeleccionada}
      </Text>

      <Box flexDirection="column">
        <Fila
          fila={cabecera}
          indiceFila={-1}
          filaSeleccionada={filaSeleccionada}
          columnaSeleccionada={columnaSeleccionada}
        />

        {datos.map((fila, indice) => (
          <Fila
            key={indice}
            fila={fila}
            indiceFila={indice}
            filaSeleccionada={filaSeleccionada}
            columnaSeleccionada={columnaSeleccionada}
          />
        ))}
      </Box>

      {modo === "normal" && (
        <Text color={COLORES.secundario}>A abrir · G guardar · Esc salir</Text>
      )}

      {modo === "abrir" && (
        <Box>
          <Text color={COLORES.acento}>Abrir archivo: </Text>
          <TextInput onSubmit={manejarSubmitAbrir} />
        </Box>
      )}

      {modo === "guardar" && (
        <Box>
          <Text color={COLORES.acento}>Guardar como: </Text>
          <TextInput
            defaultValue={archivo ?? ""}
            onSubmit={manejarSubmitGuardar}
          />
        </Box>
      )}

      {error && <Text color="red">{error}</Text>}
    </Box>
  );
}

function Celda({ valor, seleccionada }) {
  return (
    <Box width={15}>
      <Text inverse={seleccionada}>{valor}</Text>
    </Box>
  );
}

function Fila({ fila, indiceFila, filaSeleccionada, columnaSeleccionada }) {
  return (
    <Box>
      {fila.map((valor, columna) => (
        <Celda
          key={columna}
          valor={valor}
          seleccionada={
            indiceFila === filaSeleccionada && columna === columnaSeleccionada
          }
        />
      ))}
    </Box>
  );
}
const app = render(<App />);
await app.waitUntilExit();
console.clear();
