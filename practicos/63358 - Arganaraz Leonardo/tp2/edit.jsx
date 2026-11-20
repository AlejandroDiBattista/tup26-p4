#!/usr/bin/env -S npx tsx

import React, { useEffect, useState } from "react";
import { render, Box, Text } from "ink";
import fs from "node:fs";

/*
 * ==========================================
 * CONFIGURACIÓN
 * ==========================================
 */

const VISIBLE_ROWS = 10;
const VISIBLE_COLUMNS = 5;

/*
 * ==========================================
 * LEER CSV
 * ==========================================
 */

function leerCSV(nombreArchivo) {
  const contenido = fs.readFileSync(
    nombreArchivo,
    "utf8"
  );

  const limpio = contenido.replace(
    /^\uFEFF/,
    ""
  );

  if (limpio.trim() === "") {
    return [];
  }

  const lineas = limpio
    .trim()
    .split(/\r?\n/);

  return lineas.map((linea) =>
    linea.split(",")
  );
}

/*
 * ==========================================
 * CONVERTIR A CSV
 * ==========================================
 */

function convertirCSV(datos) {
  return datos
    .map((fila) => fila.join(","))
    .join("\n");
}

/*
 * ==========================================
 * APLICACIÓN
 * ==========================================
 */

function App() {
  const archivoInicial = process.argv[2];

  const [datos, setDatos] = useState([]);
  const [fila, setFila] = useState(1);
  const [columna, setColumna] = useState(0);

  const [archivo, setArchivo] = useState(
    archivoInicial || ""
  );

  const [modo, setModo] = useState(
    "normal"
  );

  const [entrada, setEntrada] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [inicioFila, setInicioFila] =
    useState(0);

  const [inicioColumna, setInicioColumna] =
    useState(0);

  /*
   * ==========================================
   * ABRIR ARCHIVO INICIAL
   * ==========================================
   */

  useEffect(() => {
    if (!archivoInicial) {
      return;
    }

    abrirArchivo(archivoInicial);
  }, []);

  /*
   * ==========================================
   * SCROLL VERTICAL
   * ==========================================
   */

  useEffect(() => {
    if (fila < inicioFila + 1) {
      setInicioFila(
        Math.max(0, fila - 1)
      );
    }

    if (
      fila >=
      inicioFila + VISIBLE_ROWS
    ) {
      setInicioFila(
        fila - VISIBLE_ROWS + 1
      );
    }
  }, [fila]);

  /*
   * ==========================================
   * SCROLL HORIZONTAL
   * ==========================================
   */

  useEffect(() => {
    if (columna < inicioColumna) {
      setInicioColumna(columna);
    }

    if (
      columna >=
      inicioColumna + VISIBLE_COLUMNS
    ) {
      setInicioColumna(
        columna -
          VISIBLE_COLUMNS +
          1
      );
    }
  }, [columna]);

  /*
   * ==========================================
   * ABRIR
   * ==========================================
   */

  function abrirArchivo(nombre) {
    try {
      const nuevoCSV = leerCSV(nombre);

      if (nuevoCSV.length === 0) {
        setMensaje(
          "El archivo está vacío."
        );
        return;
      }

      setDatos(nuevoCSV);
      setArchivo(nombre);

      setFila(
        nuevoCSV.length > 1
          ? 1
          : 0
      );

      setColumna(0);

      setInicioFila(0);
      setInicioColumna(0);

      setMensaje(
        `Archivo abierto: ${nombre}`
      );
    } catch {
      setMensaje(
        `Error al abrir el archivo: ${nombre}`
      );
    }
  }

  /*
   * ==========================================
   * GUARDAR
   * ==========================================
   */

  function guardarArchivo(nombre) {
    try {
      fs.writeFileSync(
        nombre,
        convertirCSV(datos),
        "utf8"
      );

      setArchivo(nombre);
      setEntrada("");
      setModo("normal");

      setMensaje(
        `Archivo guardado correctamente: ${nombre}`
      );
    } catch {
      setMensaje(
        `Error al guardar el archivo: ${nombre}`
      );
    }
  }

  /*
   * ==========================================
   * EDITAR
   * ==========================================
   */

  function editarCelda() {
    if (
      datos.length <= 1 ||
      fila < 1
    ) {
      return;
    }

    setEntrada(
      datos[fila]?.[columna] ?? ""
    );

    setModo("editar");

    setMensaje(
      `Editando fila ${fila}, columna ${
        columna + 1
      }`
    );
  }

  /*
   * ==========================================
   * ORDENAR
   * ==========================================
   */

  function ordenar(direccion) {
    if (datos.length <= 1) {
      return;
    }

    const cabecera = datos[0];

    const filas = datos.slice(1);

    filas.sort((a, b) => {
      const valorA =
        a[columna] ?? "";

      const valorB =
        b[columna] ?? "";

      const resultado =
        valorA.localeCompare(
          valorB,
          undefined,
          {
            numeric: true,
            sensitivity: "base"
          }
        );

      return direccion === "asc"
        ? resultado
        : -resultado;
    });

    setDatos([
      cabecera,
      ...filas
    ]);

    setMensaje(
      direccion === "asc"
        ? "Orden ascendente."
        : "Orden descendente."
    );
  }

  /*
   * ==========================================
   * MANEJAR TECLAS
   * ==========================================
   */

  function manejarTecla(tecla) {
    /*
     * ========================================
     * MODO NORMAL
     * ========================================
     */

    if (modo === "normal") {
      /*
       * FLECHA ARRIBA
       */

      if (tecla === "UP") {
        setFila((actual) =>
          Math.max(
            1,
            actual - 1
          )
        );

        return;
      }

      /*
       * FLECHA ABAJO
       */

      if (tecla === "DOWN") {
        if (datos.length <= 1) {
          return;
        }

        setFila((actual) =>
          Math.min(
            datos.length - 1,
            actual + 1
          )
        );

        return;
      }

      /*
       * FLECHA IZQUIERDA
       */

      if (tecla === "LEFT") {
        setColumna((actual) =>
          Math.max(
            0,
            actual - 1
          )
        );

        return;
      }

      /*
       * FLECHA DERECHA
       */

      if (tecla === "RIGHT") {
        if (datos.length === 0) {
          return;
        }

        const cantidadColumnas =
          datos[0].length;

        setColumna((actual) =>
          Math.min(
            cantidadColumnas - 1,
            actual + 1
          )
        );

        return;
      }

      /*
       * ENTER
       */

      if (tecla === "ENTER") {
        editarCelda();
        return;
      }

      /*
       * ESC
       */

      if (tecla === "ESC") {
        process.exit(0);
      }

      /*
       * A
       */

      if (
        tecla.length === 1 &&
        tecla.toLowerCase() === "a"
      ) {
        setModo("abrir");
        setEntrada("");

        setMensaje(
          "Ingrese el nombre del archivo:"
        );

        return;
      }

      /*
       * G
       */

      if (
        tecla.length === 1 &&
        tecla.toLowerCase() === "g"
      ) {
        setModo("guardar");
        setEntrada(archivo);

        setMensaje(
          "Ingrese el nombre del archivo:"
        );

        return;
      }

      /*
       * <
       */

      if (tecla === "<") {
        ordenar("asc");
        return;
      }

      /*
       * >
       */

      if (tecla === ">") {
        ordenar("desc");
        return;
      }

      return;
    }

    /*
     * ========================================
     * MODO ABRIR / GUARDAR / EDITAR
     * ========================================
     */

    /*
     * ESC
     */

    if (tecla === "ESC") {
      setModo("normal");
      setEntrada("");

      setMensaje(
        "Acción cancelada."
      );

      return;
    }

    /*
     * ENTER
     */

    if (tecla === "ENTER") {
      /*
       * ABRIR
       */

      if (modo === "abrir") {
        const nombre =
          entrada.trim();

        if (nombre !== "") {
          abrirArchivo(nombre);
          setModo("normal");
          setEntrada("");
        }

        return;
      }

      /*
       * GUARDAR
       */

      if (modo === "guardar") {
        const nombre =
          entrada.trim();

        if (nombre !== "") {
          guardarArchivo(nombre);
        }

        return;
      }

      /*
       * EDITAR
       */

      if (modo === "editar") {
        const nuevosDatos =
          datos.map(
            (filaActual) => [
              ...filaActual
            ]
          );

        if (nuevosDatos[fila]) {
          nuevosDatos[fila][columna] =
            entrada;
        }

        setDatos(nuevosDatos);

        setModo("normal");
        setEntrada("");

        setMensaje(
          "Celda modificada."
        );

        return;
      }
    }

    /*
     * BACKSPACE
     */

    if (tecla === "BACKSPACE") {
      setEntrada(
        (valor) =>
          valor.slice(0, -1)
      );

      return;
    }

    /*
     * TEXTO
     */

    if (
      tecla.length === 1
    ) {
      setEntrada(
        (valor) =>
          valor + tecla
      );
    }
  }

  /*
   * ==========================================
   * CAPTURAR TECLADO DIRECTAMENTE
   * ==========================================
   */

  useEffect(() => {
    const stdin = process.stdin;

    if (!stdin.isTTY) {
      return;
    }

    const estabaEnRaw =
      stdin.isRaw;

    try {
      stdin.setRawMode(true);
    } catch {
      // La terminal puede no permitir
      // modificar el modo raw.
    }

    stdin.resume();

    function recibirDatos(data) {
      const texto =
        data.toString("utf8");

      /*
       * Flechas ANSI
       */

      if (texto === "\x1b[A") {
        manejarTecla("UP");
        return;
      }

      if (texto === "\x1b[B") {
        manejarTecla("DOWN");
        return;
      }

      if (texto === "\x1b[C") {
        manejarTecla("RIGHT");
        return;
      }

      if (texto === "\x1b[D") {
        manejarTecla("LEFT");
        return;
      }

      /*
       * ESC
       */

      if (texto === "\x1b") {
        manejarTecla("ESC");
        return;
      }

      /*
       * ENTER
       */

      if (
        texto === "\r" ||
        texto === "\n"
      ) {
        manejarTecla("ENTER");
        return;
      }

      /*
       * BACKSPACE
       */

      if (
        texto === "\x7f" ||
        texto === "\b"
      ) {
        manejarTecla(
          "BACKSPACE"
        );
        return;
      }

      /*
       * Teclas normales
       */

      for (
        const caracter of texto
      ) {
        manejarTecla(caracter);
      }
    }

    stdin.on(
      "data",
      recibirDatos
    );

    return () => {
      stdin.removeListener(
        "data",
        recibirDatos
      );

      if (
        !estabaEnRaw &&
        stdin.isTTY
      ) {
        try {
          stdin.setRawMode(false);
        } catch {
          // Nada.
        }
      }
    };
  }, [
    modo,
    entrada,
    datos,
    fila,
    columna,
    archivo
  ]);

  /*
   * ==========================================
   * DATOS VISIBLES
   * ==========================================
   */

  const cabecera =
    datos.length > 0
      ? datos[0]
      : [];

  const filas =
    datos.length > 1
      ? datos.slice(
          inicioFila + 1,
          inicioFila +
            1 +
            VISIBLE_ROWS
        )
      : [];

  const columnasVisibles =
    cabecera.slice(
      inicioColumna,
      inicioColumna +
        VISIBLE_COLUMNS
    );

  /*
   * ==========================================
   * INTERFAZ
   * ==========================================
   */

  return (
    <Box flexDirection="column">

      <Text bold>
        EDITOR DE CSV
      </Text>

      <Text>
        {" "}
      </Text>

      {datos.length === 0 ? (
        <Box flexDirection="column">
          <Text>
            No hay ningún archivo abierto.
          </Text>

          <Text>
            Presione A para abrir un archivo CSV.
          </Text>
        </Box>
      ) : (
        <>
          <Text>
            Archivo: {archivo}
          </Text>

          <Text>
            Filas: {datos.length - 1}{" "}
            | Columnas:{" "}
            {cabecera.length}
          </Text>

          <Text>
            {" "}
          </Text>

          {/* CABECERA */}

          <Box>

            <Box width={6}>
              <Text bold>
                #
              </Text>
            </Box>

            {columnasVisibles.map(
              (
                nombreColumna,
                indice
              ) => (
                <Box
                  width={18}
                  key={
                    inicioColumna +
                    indice
                  }
                >
                  <Text bold>
                    {nombreColumna}
                  </Text>
                </Box>
              )
            )}

          </Box>

          {/* FILAS */}

          {filas.map(
            (
              filaActual,
              indiceFila
            ) => {
              const filaReal =
                inicioFila +
                indiceFila +
                1;

              return (
                <Box
                  key={filaReal}
                >

                  <Box width={6}>
                    <Text>
                      {filaReal}
                    </Text>
                  </Box>

                  {columnasVisibles.map(
                    (
                      _,
                      indiceColumna
                    ) => {
                      const columnaReal =
                        inicioColumna +
                        indiceColumna;

                      const valor =
                        filaActual[
                          columnaReal
                        ] ?? "";

                      const seleccionada =
                        filaReal ===
                          fila &&
                        columnaReal ===
                          columna;

                      return (
                        <Box
                          width={18}
                          key={
                            columnaReal
                          }
                        >
                          <Text
                            inverse={
                              seleccionada
                            }
                          >
                            {String(
                              valor
                            ).slice(
                              0,
                              16
                            )}
                          </Text>
                        </Box>
                      );
                    }
                  )}

                </Box>
              );
            }
          )}

          <Text>
            {" "}
          </Text>

          <Text>
            Celda: fila {fila},
            columna{" "}
            {columna + 1}
          </Text>

          <Text>
            Valor:{" "}
            {datos[fila]?.[
              columna
            ] ?? ""}
          </Text>
        </>
      )}

      <Text>
        {" "}
      </Text>

      <Text>
        A: Abrir | G: Guardar |
        Enter: Editar
      </Text>

      <Text>
        &lt;: Ascendente | &gt;:
        Descendente | Esc: Salir
      </Text>

      {modo !== "normal" && (
        <>
          <Text>
            {" "}
          </Text>

          <Text>
            {modo === "abrir" &&
              "Archivo: "}

            {modo === "guardar" &&
              "Guardar como: "}

            {modo === "editar" &&
              "Nuevo valor: "}

            {entrada}
          </Text>
        </>
      )}

      {mensaje && (
        <>
          <Text>
            {" "}
          </Text>

          <Text>
            {mensaje}
          </Text>
        </>
      )}

    </Box>
  );
}

/*
 * ==========================================
 * INICIAR
 * ==========================================
 */

render(<App />);