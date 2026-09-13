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

  const [abriendo, setAbriendo] = useState(false);
  const [archivoNuevo, setArchivoNuevo] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [archivoGuardar, setArchivoGuardar] = useState("");

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
      if (abriendo) {
        setAbriendo(false);
        setArchivoNuevo("");
        return;
      }
      if (guardando) {
        setGuardando(false);
        setArchivoGuardar("");
        return;
      }

      exit();
    }
    if (abriendo || guardando) {
      return;
    }
    if (tecla.toLowerCase() === "a" && !editando) {
      setAbriendo(true);
      setArchivoNuevo("");
      return;
    }
    if (tecla.toLowerCase() === "g" && !editando) {
      setArchivoGuardar(nombreArchivo);
      setGuardando(true);
      return;
    }
    if (key.return && !editando) {
      setEditando(true);
      setValorEditado(filas[filaSeleccionada]?.[columnaSeleccionada] || "");
      return;
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

    if (tecla === "<") {
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

    if (tecla === ">") {
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

  const inicio = Math.max(0, filaSeleccionada - 9);

  return (
    <Box
      width={COLUMNAS - 10}
      height={FILAS}
      justifyContent="center"
      alignItems="center"
    >
      <Box
        width={COLUMNAS - 10}
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
            {guardando ? (
              <Box flexDirection="column" alignItems="center">
                <Text color={COLORES.secundario}>
                  Guardar › {nombreArchivo}
                </Text>

                <Box>
                  <Text color={COLORES.secundario}>Nuevo nombre › </Text>
                  <TextInput
                    value={archivoGuardar}
                    onChange={setArchivoGuardar}
                    onSubmit={async () => {
                      try {
                        const nombreGuardar =
                          archivoGuardar.trim() || nombreArchivo;

                        const contenido = [
                          encabezados.join(","),
                          ...filas.map((fila) => fila.join(",")),
                        ].join("\n");

                        await writeFile(nombreGuardar, contenido, "utf8");

                        setNombreArchivo(basename(nombreGuardar));
                        setError("");
                        setGuardando(false);
                      } catch {
                        setError("No se pudo guardar el archivo");
                        setGuardando(false);
                      }
                    }}
                  />
                </Box>
              </Box>
            ) : abriendo ? (
              <Box>
                <Text color={COLORES.secundario}>Abrir ›</Text>

                <TextInput
                  value={archivoNuevo}
                  onChange={setArchivoNuevo}
                  onSubmit={async () => {
                    try {
                      const datos = await leerCSV(archivoNuevo);

                      setEncabezados(datos.encabezados);
                      setFilas(datos.filas);
                      setNombreArchivo(basename(archivoNuevo));

                      setFilaSeleccionada(0);
                      setColumnaSeleccionada(0);
                      setError("");
                      setAbriendo(false);
                    } catch {
                      setError("No se puede abrir el archivo");
                      setAbriendo(false);
                    }
                  }}
                />
              </Box>
            ) : editando ? (
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
                <Text color={COLORES.secundario}>
                  {filas.length} filas . {encabezados.length} columnas
                </Text>

                <Box flexDirection="column" alignItems="flex-start">
                  <Box>
                    <Box width={8} flexShrink={0}>
                      <Text bold color={COLORES.acento}>
                        #
                      </Text>
                    </Box>

                    <Box width={16}>
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

                    <Box width={10}>
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

                  {filas.slice(inicio, inicio + 10).map((fila, index) => {
                    const indiceReal = inicio + index;
                    return (
                      <Box key={indiceReal} flexShrink={0}>
                        <Box width={8} flexShrink={0}>
                          <Text color={COLORES.secundario}>
                            {indiceReal + 1}
                          </Text>
                        </Box>
                        <Box width={16}>
                          <Text
                            color={
                              filaSeleccionada === indiceReal &&
                              columnaSeleccionada === 0
                                ? COLORES.fondo
                                : COLORES.titulo
                            }
                            backgroundColor={
                              filaSeleccionada === indiceReal &&
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
                              filaSeleccionada === indiceReal &&
                              columnaSeleccionada === 1
                                ? COLORES.fondo
                                : COLORES.titulo
                            }
                            backgroundColor={
                              filaSeleccionada === indiceReal &&
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
                              filaSeleccionada === indiceReal &&
                              columnaSeleccionada === 2
                                ? COLORES.fondo
                                : COLORES.titulo
                            }
                            backgroundColor={
                              filaSeleccionada === indiceReal &&
                              columnaSeleccionada === 2
                                ? COLORES.acento
                                : undefined
                            }
                          >
                            {fila[2]}
                          </Text>
                        </Box>
                        <Box width={10}>
                          <Text
                            color={
                              filaSeleccionada === indiceReal &&
                              columnaSeleccionada === 3
                                ? COLORES.fondo
                                : COLORES.titulo
                            }
                            backgroundColor={
                              filaSeleccionada === indiceReal &&
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
                              filaSeleccionada === indiceReal &&
                              columnaSeleccionada === 4
                                ? COLORES.fondo
                                : COLORES.titulo
                            }
                            backgroundColor={
                              filaSeleccionada === indiceReal &&
                              columnaSeleccionada === 4
                                ? COLORES.acento
                                : undefined
                            }
                          >
                            {fila[4]}
                          </Text>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}
            <Text color={COLORES.secundario}>
              Fila {filaSeleccionada + 1} . Columna {columnaSeleccionada + 1}
            </Text>
            <Text color={COLORES.secundario}>
              <Text bold color={COLORES.acento}>
                A
              </Text>{" "}
              abrir .{" "}
              <Text bold color={COLORES.acento}>
                G
              </Text>{" "}
              guardar .{" "}
              <Text bold color={COLORES.acento}>
                Enter
              </Text>{" "}
              editar .{" "}
              <Text bold color={COLORES.acento}>
                &lt;
              </Text>{" "}
              ascendente .{" "}
              <Text bold color={COLORES.acento}>
                &gt;
              </Text>{" "}
              descendente .{" "}
              <Text bold color={COLORES.acento}>
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
