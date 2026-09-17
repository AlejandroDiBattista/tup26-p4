#!/usr/bin/env -S node --import tsx

import React, { useState } from "react";
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
            if (modo !== 'tabla') {
                setModo('tabla');
                setMensaje('');

            } else {
                exit();
            }
            return;
        }
        if (modo !== 'tabla') {
            return;
        }
        if (key.upArrow && datos.length > 0) {
            setFila(actual => {
                const nuevaFila = Math.max(
                    0,
                    actual - 1
                );
                if (nuevaFila < scrollFila) {
                    setScrollFila(nuevaFila);
                }
                return nuevaFila;
            });
        }

        if (key.downArrow && datos.length > 0) {

            setFila(actual => {
                const nuevaFila = Math.min(
                    datos.length - 1,
                    actual + 1
                );

                if (
                    nuevaFila >=
                    scrollFila + filasVisibles
                ) {
                    setScrollFila(
                        nuevaFila - filasVisibles + 1
                    );
                }
                return nuevaFila;
            });
        }
          if (key.leftArrow && cabeceras.length > 0) {
            setColumna(actual => {
                const nuevaColumna = Math.max(
                    0,
                    actual - 1
                );
                if (
                    nuevaColumna < scrollColumna
                ) {
                    setScrollColumna(nuevaColumna);
                }
                return nuevaColumna;
            });
        }
        if (key.rightArrow && cabeceras.length > 0) {
            setColumna(actual => {
                const nuevaColumna = Math.min(
                    cabeceras.length - 1,
                    actual + 1
                );

                if (
                    nuevaColumna >=
                    scrollColumna + columnasVisibles
                ) {

                    setScrollColumna(
                        nuevaColumna -
                        columnasVisibles +
                        1
                    );
                }

                return nuevaColumna;
            });
        }

        if (input.toLowerCase() === 'a') {
            setModo('abrir');
            setMensaje('');

        }

        if (input.toLowerCase() === 'g') {
            setModo('guardar');
            setMensaje('');

        }

        if (key.return && datos.length > 0) {
            setModo('editar');
            setMensaje('');

        }

        if (input === '<' && datos.length > 0) {
            const copia = [...datos];
            copia.sort((a, b) => {
                const valorA = a[columna] ?? '';
                const valorB = b[columna] ?? '';
                const numeroA = Number(valorA);
                const numeroB = Number(valorB);
                if (
                    valorA !== '' &&
                    valorB !== '' &&
                    !Number.isNaN(numeroA) &&
                    !Number.isNaN(numeroB)
                ) {
                    return numeroA - numeroB;
                }
                return valorA.localeCompare(
                    valorB,
                    'es',
                    {
                        sensitivity: 'base'
                    }
                );
            });
            setDatos(copia);
            setFila(0);
            setScrollFila(0);
        }
        if (input === '>' && datos.length > 0) {
            const copia = [...datos];
            copia.sort((a, b) => {
                const valorA = a[columna] ?? '';
                const valorB = b[columna] ?? '';
                const numeroA = Number(valorA);
                const numeroB = Number(valorB);


                if (
                    valorA !== '' &&
                    valorB !== '' &&
                    !Number.isNaN(numeroA) &&
                    !Number.isNaN(numeroB)
                ) {
                    return numeroB - numeroA;
                }
                return valorB.localeCompare(
                    valorA,
                    'es',
                    {
                        sensitivity: 'base'
                    }
                );
            });
            setDatos(copia);
            setFila(0);
            setScrollFila(0);
        }
    });
    const valorSeleccionado =
        datos[fila]?.[columna] ?? '';

    const datosVisibles = datos.slice(
        scrollFila,
        scrollFila + filasVisibles
    );
    const cabecerasVisibles = cabeceras.slice(
        scrollColumna,
        scrollColumna + columnasVisibles
    );
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
