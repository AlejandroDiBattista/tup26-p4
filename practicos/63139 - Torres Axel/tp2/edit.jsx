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
    if (abriendo) {
      if (key.escape) {
        setAbriendo(false);
      }
      if (key.return && rutaNueva.trim() !== "") {
        setRutaArchivo(rutaNueva.trim());
        setFilaSeleccionada(0);
        setColumnaSeleccionada(0);
        setAbriendo(false);
      }
      return;
    }
    if (editando) {
      if (key.escape) {
        setEditando(false);
      }
      if (key.return) {
        const nuevasFilas = filas.map((fila, i) =>
          fila.map((celda, j) =>
            i === filaSeleccionada && j === columnaSeleccionada
              ? textoEdicion
              : celda,
          ),
        );
        const nuevoContenido = [columnas, ...nuevasFilas]
          .map((fila) => fila.join(","))
          .join("\n");
        setContenido(nuevoContenido);
        setEditando(false);
      }
      return;
    }
    if (
      tecla === "<" ||
      tecla === ">" ||
      tecla.toLocaleLowerCase() === "o" ||
      tecla.toLocaleLowerCase() === "p"
    ) {
      const ascendente = tecla === "<" || tecla.toLocaleLowerCase() === "o";
      const direccion = ascendente ? 1 : -1;
      const filasOrdenadas = [...filas].sort((filaA, filaB) => {
        const a = filaA[columnaSeleccionada] ?? "";
        const b = filaB[columnaSeleccionada] ?? "";
        const sonNumeros =
          a.trim() !== "" &&
          b.trim() !== "" &&
          Number.isFinite(Number(a)) &&
          Number.isFinite(Number(b));
        const resultado = sonNumeros
          ? Number(a) - Number(b)
          : a.localeCompare(b, "es", {
              numeric: true,
              sensitivity: "base",
            });
        return resultado * direccion;
      });
      const nuevoContenido = [columnas, ...filasOrdenadas]
        .map((fila) => fila.join(","))
        .join("\n");
      setContenido(nuevoContenido);
      setFilaSeleccionada(0);
      return;
    }
    if (tecla.toLocaleLowerCase() === "a") {
      setRutaNueva("");
      setAbriendo(true);
      return;
    }
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
    if (key.return && !editando) {
      setTextoEdicion(valorSeleccionado);
      setEditando(true);
      return;
    }
  });
  const [contenido, setContenido] = useState("");
  const [rutaArchivo, setRutaArchivo] = useState(ruta_archivo);
  const lineas = contenido.replace(/\r\n?/g, "\n").split("\n");
  const cabecera = lineas[0];
  const columnas = cabecera.split(",");
  const seguidas = lineas.slice(1).filter((linea) => linea.trim() !== "");
  const filas = seguidas.map((fila) => fila.split(","));
  const [filaSeleccionada, setFilaSeleccionada] = useState(0);
  const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);
  const valorSeleccionado =
    filas[filaSeleccionada]?.[columnaSeleccionada] ?? "";
  const inicioFila = Math.max(0, filaSeleccionada - 4);
  const [editando, setEditando] = useState(false);
  const [textoEdicion, setTextoEdicion] = useState("");
  const [abriendo, setAbriendo] = useState(false);
  const [rutaNueva, setRutaNueva] = useState("");
  const [archivoActual, setArchivoActual] = useState("");
  useEffect(() => {
    async function leerArchivo() {
      try {
        const texto = await readFile(rutaArchivo, "utf8");
        setContenido(texto);
        setArchivoActual(rutaArchivo);
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
        <Text>Archivo:{archivoActual || "(ninguno)"}</Text>
        <Text>Columna:{columnaSeleccionada}</Text>
        <Text>Fila:{filaSeleccionada}</Text>
        <Text>valor:{valorSeleccionado}</Text>
        <Box flexDirection="row">
          <Box width={4} flexShrink={0} />
          {columnas.map((columna, indice) => (
            <Box key={indice} width={12} flexShrink={0}>
              <Text key={indice}>{columna}</Text>
            </Box>
          ))}
        </Box>
        {filas.slice(inicioFila, inicioFila + 5).map((fila, indiceVisible) => {
          const indiceFila = inicioFila + indiceVisible;
          return (
            <Box key={indiceFila} flexDirection="row">
              <Box width={4} flexShrink={0}>
                <Text>{indiceFila + 1}</Text>
              </Box>
              {fila.map((celda, indiceColumna) => {
                const Seleccionada =
                  indiceFila == filaSeleccionada &&
                  indiceColumna == columnaSeleccionada;
                return (
                  <Box key={indiceColumna} width={12} flexShrink={0}>
                    <Text
                      wrap="truncate"
                      backgroundColor={Seleccionada ? "cyan" : undefined}
                      color={Seleccionada ? "black" : undefined}
                    >
                      {celda || " "}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          );
        })}
        {editando && (
          <Box flexDirection="column">
            <Text>Editar celda:</Text>
            <TextInput defaultValue={textoEdicion} onChange={setTextoEdicion} />
          </Box>
        )}
        {abriendo && (
          <Box flexDirection="column">
            <Text>Abrir CSV - Enter:Abrir|Esc:cancelar </Text>

            <TextInput defaultValue={rutaNueva} onChange={setRutaNueva} />
          </Box>
        )}
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
