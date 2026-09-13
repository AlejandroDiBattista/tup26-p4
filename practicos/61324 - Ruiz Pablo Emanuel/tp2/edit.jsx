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

  const [filaSeleccionada, setFilaSeleccionada] = useState(0);
  const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);

  const [editando, setEditando] = useState(false);
  const [valorEditado, setValorEditado] = useState("");

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
      if (editando) {
        setEditando(false);
        return;
      }
      exit();
    }
    if (key.return) {
      setEditando(true);
      setValorEditado(filas[filaSeleccionada]?.[columnaSeleccionada] || "");
    }
    if (editando) {
      return;
    }
    if (key.upArrow) {
      setFilaSeleccionada((fila) => Math.max(0, fila - 1));
    }

    if (key.downArrow && filas.length > 0) {
      setFilaSeleccionada((fila) => Math.min(filas.length - 1, fila + 1));
    }

    if (key.leftArrow) {
      setColumnaSeleccionada((columna) => Math.max(0, columna - 1));
    }

    if (key.rightArrow && encabezados.length > 0) {
      setColumnaSeleccionada((columna) =>
        Math.min(encabezados.length - 1, columna + 1),
      );
    }
    if (tecla === "<" && !editando) {
      const filasOrdenadas = [...filas].sort((a, b) => {
        const valorA = a[columnaSeleccionada];
        const valorB = b[columnaSeleccionada];

        const numeroA = Number(valorA);
        const numeroB = Number(valorB);

        if (!Number.isNaN(numeroA) && !Number.isNaN(numeroB)) {
          return numeroA - numeroB;
        }
        return valorA.localeCompare(valorB);
      });
      setFilas(filasOrdenadas);
      setFilaSeleccionada(0);
    }

    if (tecla === ">" && !editando) {
      const filasOrdenadas = [...filas].sort((a, b) => {
        const valorA = a[columnaSeleccionada];
        const valorB = b[columnaSeleccionada];

        const numeroA = Number(valorA);
        const numeroB = Number(valorB);

        if (!Number.isNaN(numeroA) && !Number.isNaN(numeroB)) {
          return numeroB - numeroA;
        }
        return valorB.localeCompare(valorA);
      });
      setFilas(filasOrdenadas);
      setFilaSeleccionada(0);
    }
  });

  return (
    <Box
      width={COLUMNAS - 6}
      height={FILAS}
      justifyContent="center"
      alignItems="center"
    >
      <Box
        width={COLUMNAS - 6}
        height={FILAS}
        flexDirection="column"
        borderStyle="round"
        borderColor={COLORES.borde}
        backgroundColor={COLORES.fondo}
      >
        <Box
          flexGrow={1}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            flexGrow={1}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Text bold color={COLORES.titulo}>
              {nombreArchivo || "Editor CSV"}
            </Text>
            {editando ? (
              <Box>
                <Text color={COLORES.secundario}>Editar ›</Text>
                <TextInput
                  value={valorEditado}
                  onChange={setValorEditado}
                  onSubmit={() => {
                    const nuevasFilas = [...filas];

                    nuevasFilas[filaSeleccionada] = [
                      ...nuevasFilas[filaSeleccionada],
                    ];

                    nuevasFilas[filaSeleccionada][columnaSeleccionada] =
                      valorEditado;

                    setFilas(nuevasFilas);
                    setEditando(false);
                  }}
                />
              </Box>
            ) : (
              <Text color={COLORES.secundario}>
                Valor › {filas[filaSeleccionada]?.[columnaSeleccionada] || ""}
              </Text>
            )}
            {error ? (
              <Text color="red">{error}</Text>
            ) : (
              <>
                <Text color={COLORES.secundario}>{filas.length} filas</Text>

                <Text color={COLORES.secundario}>
                  {encabezados.length} columnas
                </Text>

                <Box>
                  <Box width={8} flexShrink={0}>
                    <Text bold color={COLORES.acento}>
                      #
                    </Text>
                  </Box>

                  <Box width={10}>
                    <Text bold color={COLORES.acento}>
                      {encabezados[0]}
                    </Text>
                  </Box>

                  <Box width={10}>
                    <Text bold color={COLORES.acento}>
                      {encabezados[1]}
                    </Text>
                  </Box>

                  <Box width={10}>
                    <Text bold color={COLORES.acento}>
                      {encabezados[2]}
                    </Text>
                  </Box>

                  <Box width={15}>
                    <Text bold color={COLORES.acento}>
                      {encabezados[3]}
                    </Text>
                  </Box>

                  <Box width={16}>
                    <Text bold color={COLORES.acento}>
                      {encabezados[4]}
                    </Text>
                  </Box>
                </Box>

                {filas.slice(0, 10).map((fila, index) => (
                  <Box key={index} flexShrink={0}>
                    <Box width={8} flexShrink={0}>
                      <Text color={COLORES.secundario}>{index + 1}</Text>
                    </Box>

                    <Box width={10}>
                      <Text
                        color={
                          filaSeleccionada === index &&
                          columnaSeleccionada === 0
                            ? COLORES.fondo
                            : COLORES.titulo
                        }
                        backgroundColor={
                          filaSeleccionada === index &&
                          columnaSeleccionada === 0
                            ? COLORES.acento
                            : undefined
                        }
                      >
                        {fila[0]}
                      </Text>
                    </Box>

                    <Box width={10}>
                      <Text
                        color={
                          filaSeleccionada === index &&
                          columnaSeleccionada === 1
                            ? COLORES.fondo
                            : COLORES.titulo
                        }
                        backgroundColor={
                          filaSeleccionada === index &&
                          columnaSeleccionada === 1
                            ? COLORES.acento
                            : undefined
                        }
                      >
                        {fila[1]}
                      </Text>
                    </Box>

                    <Box width={10}>
                      <Text
                        color={
                          filaSeleccionada === index &&
                          columnaSeleccionada === 2
                            ? COLORES.fondo
                            : COLORES.titulo
                        }
                        backgroundColor={
                          filaSeleccionada === index &&
                          columnaSeleccionada === 2
                            ? COLORES.acento
                            : undefined
                        }
                      >
                        {fila[2]}
                      </Text>
                    </Box>

                    <Box width={15}>
                      <Text
                        color={
                          filaSeleccionada === index &&
                          columnaSeleccionada === 3
                            ? COLORES.fondo
                            : COLORES.titulo
                        }
                        backgroundColor={
                          filaSeleccionada === index &&
                          columnaSeleccionada === 3
                            ? COLORES.acento
                            : undefined
                        }
                      >
                        {fila[3]}
                      </Text>
                    </Box>

                    <Box width={16}>
                      <Text
                        color={
                          filaSeleccionada === index &&
                          columnaSeleccionada === 4
                            ? COLORES.fondo
                            : COLORES.titulo
                        }
                        backgroundColor={
                          filaSeleccionada === index &&
                          columnaSeleccionada === 4
                            ? COLORES.acento
                            : undefined
                        }
                      >
                        {fila[4]}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </>
            )}
            <Text color={COLORES.secundario}>
              Fila {filaSeleccionada + 1} . Columna {columnaSeleccionada + 1}
            </Text>

            <Text color={COLORES.secundario}>
              <Text bold color={COLORES.acento}>
                {" "}
                Esc
              </Text>{" "}
              salir
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const app = render(<App />);
app.waitUntilExit().then(() => {
  console.clear();
});
