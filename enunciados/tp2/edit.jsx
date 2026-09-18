#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect} from "react";
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
  const [archivo, setArchivo] = useState("");
  const [cabeceras, setCabeceras] = useState([]);
  const [datos, setDatos] = useState([]);

  const [fila, setFila] = useState(0);
  const [columna, setColumna] = useState(0);

  const [modo, setModo] = useState("tabla");
  const [mensaje, setMensaje] = useState("");
  const [scrollFila, setScrollFila] = useState(0);
  const [scrollColumna, setScrollColumna] = useState(0);

  const filasVisibles = Math.max(1, FILAS - 9);

  const columnasVisibles = Math.max(1, Math.floor((COLUMNAS - 5) / 16));

  async function abrirCSV(nombreArchivo) {
    try {
      const contenido = await readFile(nombreArchivo, "utf8");
      const texto = contenido.trimEnd();
      if (!texto) {
        throw new Error("El archivo está vacio");
      }

      const lineas = texto.split(/\r?\n/);
      const nuevasCabeceras = lineas[0].split(",");

      const nuevasFilas = lineas.slice(1).map((linea) => linea.split(","));

      for (const filaActual of nuevasFilas) {
        if (filaActual.length !== nuevasCabeceras.length) {
          throw new Error("Las filas no tienen la misma cantidad de columnas");
        }
      }
      setArchivo(nombreArchivo);
      setCabeceras(nuevasCabeceras);
      setDatos(nuevasFilas);
      setFila(0);
      setColumna(0);
      setScrollFila(0);
      setScrollColumna(0);
      setMensaje("");
    } catch (error) {
      setMensaje(`Error al abrir el archivo: ${error.message}`);
    }
  }

  async function guardarCSV(nombreArchivo) {
    try {
      const contenido = [
        cabeceras.join(","),
        ...datos.map((filaActual) => filaActual.join(",")),
      ].join("\n");
      await writeFile(nombreArchivo, contenido, "utf8");
      setArchivo(nombreArchivo);
      setMensaje("");
      setModo("tabla");
    } catch (error) {
      setMensaje(`Error al guardar el archivo: ${error.message}`);
    }
  }
  const archivoInicial = process.argv[2];

  useEffect(() => {
    if (archivoInicial) {
      abrirCSV(archivoInicial);
    }
  }, []);

  useInput((input, key) => {
    if (key.escape) {
      if (modo !== "tabla") {
        setModo("tabla");
        setMensaje("");
      } else {
        exit();
      }
      return;
    }
    if (modo !== "tabla") {
      return;
    }
    if (key.upArrow && datos.length > 0) {
      setFila((actual) => {
        const nuevaFila = Math.max(0, actual - 1);
        if (nuevaFila < scrollFila) {
          setScrollFila(nuevaFila);
        }
        return nuevaFila;
      });
    }

    if (key.downArrow && datos.length > 0) {
      setFila((actual) => {
        const nuevaFila = Math.min(datos.length - 1, actual + 1);

        if (nuevaFila >= scrollFila + filasVisibles) {
          setScrollFila(nuevaFila - filasVisibles + 1);
        }
        return nuevaFila;
      });
    }
    if (key.leftArrow && cabeceras.length > 0) {
      setColumna((actual) => {
        const nuevaColumna = Math.max(0, actual - 1);
        if (nuevaColumna < scrollColumna) {
          setScrollColumna(nuevaColumna);
        }
        return nuevaColumna;
      });
    }
    if (key.rightArrow && cabeceras.length > 0) {
      setColumna((actual) => {
        const nuevaColumna = Math.min(cabeceras.length - 1, actual + 1);

        if (nuevaColumna >= scrollColumna + columnasVisibles) {
          setScrollColumna(nuevaColumna - columnasVisibles + 1);
        }

        return nuevaColumna;
      });
    }

    if (input.toLowerCase() === "a") {
      setModo("abrir");
      setMensaje("");
    }

    if (input.toLowerCase() === "g") {
      setModo("guardar");
      setMensaje("");
    }

    if (key.return && datos.length > 0) {
      setModo("editar");
      setMensaje("");
    }

    if (input === "<" && datos.length > 0) {
      const copia = [...datos];
      copia.sort((a, b) => {
        const valorA = a[columna] ?? "";
        const valorB = b[columna] ?? "";
        const numeroA = Number(valorA);
        const numeroB = Number(valorB);
        if (
          valorA !== "" &&
          valorB !== "" &&
          !Number.isNaN(numeroA) &&
          !Number.isNaN(numeroB)
        ) {
          return numeroA - numeroB;
        }
        return valorA.localeCompare(valorB, "es", {
          sensitivity: "base",
        });
      });
      setDatos(copia);
      setFila(0);
      setScrollFila(0);
    }
    if (input === ">" && datos.length > 0) {
      const copia = [...datos];
      copia.sort((a, b) => {
        const valorA = a[columna] ?? "";
        const valorB = b[columna] ?? "";
        const numeroA = Number(valorA);
        const numeroB = Number(valorB);

        if (
          valorA !== "" &&
          valorB !== "" &&
          !Number.isNaN(numeroA) &&
          !Number.isNaN(numeroB)
        ) {
          return numeroB - numeroA;
        }
        return valorB.localeCompare(valorA, "es", {
          sensitivity: "base",
        });
      });
      setDatos(copia);
      setFila(0);
      setScrollFila(0);
    }
  });
  const valorSeleccionado = datos[fila]?.[columna] ?? "";

  const datosVisibles = datos.slice(scrollFila, scrollFila + filasVisibles);
  const cabecerasVisibles = cabeceras.slice(
    scrollColumna,
    scrollColumna + columnasVisibles,
  );
  return (
    <Box width={COLUMNAS} height={FILAS} flexDirection="column" padding={1}>
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold color={COLORES.titulo}>
          {archivo ? basename(archivo) : "Editor CSV"}
        </Text>
        <Text color={COLORES.secundario}>
          {datos.length} filas · {cabeceras.length} columnas
        </Text>
      </Box>

      <Box flexDirection="column" flexGrow={1}>
        <Box>
          <Box width={5}>
            <Text bold color={COLORES.acento}>
              #
            </Text>
          </Box>
          {cabecerasVisibles.map((cabecera, indice) => {
            const indiceReal = scrollColumna + indice;
            return (
              <Box key={indiceReal} width={16}>
                <Text
                  bold
                  color={
                    indiceReal === columna ? COLORES.acento : COLORES.titulo
                  }
                >
                  {cabecera}
                </Text>
              </Box>
            );
          })}
        </Box>
        {datosVisibles.map((filaActual, indice) => {
          const indiceFila = scrollFila + indice;
          return (
            <Box key={indiceFila}>
              <Box width={5}>
                <Text color={COLORES.secundario}>{indiceFila + 1}</Text>
              </Box>

              {filaActual
                .slice(scrollColumna, scrollColumna + columnasVisibles)
                .map((celda, indice) => {
                  const indiceColumna = scrollColumna + indice;

                  const seleccionada =
                    indiceFila === fila && indiceColumna === columna;
                  return (
                    <Box key={indiceColumna} width={16}>
                      <Text
                        backgroundColor={
                          seleccionada ? COLORES.acento : undefined
                        }
                        color={seleccionada ? "black" : COLORES.titulo}
                      >
                        {celda}
                      </Text>
                    </Box>
                  );
                })}
            </Box>
          );
        })}
      </Box>
      <Box flexDirection="column" marginTop={1}>
        <Text color={COLORES.secundario}>
          Valor:{" "}
          <Text bold color={COLORES.acento}>
            {valorSeleccionado}
          </Text>
        </Text>
        <Text color={COLORES.secundario}>
          Fila: {fila + 1}
          {" · "}
          Columna: {columna + 1}
        </Text>
      </Box>

      {mensaje && (
        <Box marginTop={1}>
          <Text color={COLORES.acento}>{mensaje}</Text>
        </Box>
      )}
      {modo === "abrir" && (
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor={COLORES.borde}
          paddingX={1}
          marginTop={1}
        >
          <Text color={COLORES.titulo}>Abrir archivo:</Text>
          <TextInput
            placeholder="empleados.csv"
            onSubmit={(nombre) => {
              if (!nombre.trim()) {
                setMensaje("Debe ingresar un nombre de archivo");
                return;
              }
              abrirCSV(nombre.trim());
              setModo("tabla");
            }}
          />
          <Text color={COLORES.secundario}>Enter confirmar · Esc cancelar</Text>
        </Box>
      )}
      {modo === "guardar" && (
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor={COLORES.borde}
          paddingX={1}
          marginTop={1}
        >
          <Text color={COLORES.titulo}>Guardar como:</Text>

          <TextInput
            defaultValue={archivo ? basename(archivo) : "empleados.csv"}
            onSubmit={(nombre) => {
              if (!nombre.trim()) {
                setMensaje("Debe ingresar un nombre de archivo");

                return;
              }
              guardarCSV(nombre.trim());
            }}
          />
          <Text color={COLORES.secundario}>Enter confirmar · Esc cancelar</Text>
        </Box>
      )}

      {modo === "editar" && (
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor={COLORES.borde}
          paddingX={1}
          marginTop={1}
        >
          <Text color={COLORES.titulo}>Editar celda:</Text>

          <Text color={COLORES.secundario}>
            Fila {fila + 1}
            {" · "}
            Columna {columna + 1}
          </Text>

          <TextInput
            defaultValue={valorSeleccionado}
            onSubmit={(nuevoValor) => {
              const copia = datos.map((filaActual) => [...filaActual]);

              copia[fila][columna] = nuevoValor;

              setDatos(copia);

              setModo("tabla");
            }}
          />
          <Text color={COLORES.secundario}>Enter confirmar · Esc cancelar</Text>
        </Box>
      )}

      {modo === "tabla" && (
        <Box marginTop={1}>
          <Text color={COLORES.secundario}>
            A abrir · G guardar · Enter editar · Esc salir · {"<"} ascendente ·{" "}
            {">"} descendente
          </Text>
        </Box>
      )}
    </Box>
  );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();
