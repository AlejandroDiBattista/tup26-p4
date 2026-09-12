#!/usr/bin/env -S node --import tsx

import React, {useState, useEffect} from "react";
import {render, Box, Text, useInput, useApp, useStdout} from "ink";
import {readFile, writeFile} from "node:fs/promises";
import {TextInput} from "@inkjs/ui";
import {basename} from "node:path";

async function parseFile(file) {
    const data = await readFile(file, {encoding: "utf-8"});
    const [header, ...rows] = data.split(/\r?\n|\r/);
    const parsedColumns = header.split(",").map((c) => c.trim());
    const parsedData = rows
    .filter((r) => r.trim() !== "")
    .map((row) => {
        const values = row.split(",").map((v) => v.trim());
        return Object.fromEntries(parsedColumns.map((c, i) => [c, values[i]]));
    });
    return {parsedData, parsedColumns};
}

function serializeCSV(data, columns) {
    const filas = data.map((fila) => columns.map((c) => fila[c]).join(","));
    return [columns.join(","), ...filas].join("\n") + "\n";
}

const TECLAS = [
    {funcion: "Abrir", tecla: "A", tipo: ["nav"], showOnEmpty: true},
    {funcion: "Guardar", tecla: "G", tipo: ["nav"]},
    {funcion: "Guardar", tecla: "Enter", tipo: ["save"]},
    {funcion: "Editar", tecla: "Enter", tipo: ["nav"]},
    {funcion: "Orden ascendente", tecla: "<", tipo: ["nav"]},
    {funcion: "Orden descendente", tecla: ">", tipo: ["nav"]},
    {funcion: "Guardar campo", tecla: "Enter", tipo: ["edit"]},
    {funcion: "Guardar ruta", tecla: "Enter", tipo: ["open"]},
    {funcion: "Salir", tecla: "Esc", tipo: ["nav"], showOnEmpty: true},
    {funcion: "Volver", tecla: "Esc", tipo: ["edit", "save","open"], showOnEmpty: true}
]

function Tabla({data, columns, inicio, seleccionado, tablaFilas}) {
    const anchoIndice = String(data.length).length + 1;
    const anchos = columns.map((col) =>
        Math.max(col.length, ...data.map((fila) => String(fila[col]).length))
    );

    const esColumnaActiva = (i) => i === seleccionado.columna;
    const esFilaActiva = (filaAbsoluto) => filaAbsoluto === seleccionado.fila;
    const esCeldaActiva = (filaIdx, i) => esFilaActiva(filaIdx) && esColumnaActiva(i);

    const slicedData = data.slice(inicio, inicio + tablaFilas);

    return (
        <Box flexDirection="column">
            <Box>
                <Box width={anchoIndice + 2}>
                    <Text color={COLORES.titulo}>#</Text>
                </Box>
                {columns.map((col, i) => (
                    <Box key={col} width={anchos[i] + 2} backgroundColor={esColumnaActiva(i) ? COLORES.acentoDim : undefined}>
                        <Text color={esColumnaActiva(i) ? COLORES.acento : COLORES.titulo}>{col.toUpperCase()}</Text>
                    </Box>
                ))}
            </Box>
            {slicedData.map((fila, filaIdx) => (
                <Box flexShrink={0} key={filaIdx}>
                    <Box width={anchoIndice + 2} backgroundColor={esFilaActiva(inicio + filaIdx) ? COLORES.acentoDim : undefined}>
                        <Text color={esFilaActiva(inicio + filaIdx) ? COLORES.acento : COLORES.titulo}>{inicio + filaIdx + 1}</Text>
                    </Box>
                    {columns.map((col, i) => (
                        <Box key={col} width={anchos[i] + 2} backgroundColor={esCeldaActiva(inicio + filaIdx, i) ? "white" : undefined}>
                            <Text color={esCeldaActiva(inicio + filaIdx, i) ? "black" : COLORES.secundario}>{String(fila[col])}</Text>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
}

function useWindowSize() {
    const {stdout} = useStdout();
    const [size, setSize] = useState({
        columnas: stdout.columns || 80,
        filas: stdout.rows || 24,
    });

    useEffect(() => {
        const onResize = () => {
            setSize({
                columnas: stdout.columns || 80,
                filas: stdout.rows || 24,
            });
        };
        stdout.on("resize", onResize);
        return () => stdout.off("resize", onResize);
    }, [stdout]);

    return size;
}

const COLORES = {
    fondo:     "#161310",
    borde:     "#726b61",
    titulo:    "#ede7db",
    secundario:"#ada79e",
    acento:    "#edbb64",
    acentoDim: "#5c4d2c",
};

function Teclas({modo, dataBool, seleccionado}) {
    const teclas = TECLAS.filter((tecla) => tecla.tipo.includes(modo) && (dataBool || tecla.showOnEmpty));
    return (
        <Box paddingTop={1} justifyContent="space-between">
            <Box>
                {teclas.map((tecla, i) => (
                    <Text key={i} color={COLORES.secundario}>
                        <Text bold color={COLORES.acento}>{tecla.tecla}</Text> {tecla.funcion}{i < teclas.length - 1 ? " · " : ""}
                    </Text>
                ))}
            </Box>
            {dataBool && (
                <Text dimColor>Fila {seleccionado.fila + 1} · Columna {seleccionado.columna + 1}</Text>
            )}
        </Box>
    );
}

function App({ruta: rutaInicial, data: dataInicial, columns: columnsInicial}) {
    const {exit} = useApp();
    const {columnas, filas} = useWindowSize();
    const [ruta, setRuta] = useState(rutaInicial);
    const [data, setData] = useState(dataInicial ?? []);
    const [columns, setColumns] = useState(columnsInicial ?? []);
    const rowAmount = data.length;
    const columnAmount = columns.length;
    const hayDatos = data.length > 0;
    const [seleccionado, setSeleccionado] = useState({fila: 0, columna: 0});
    const [inicio, setInicio] = useState(0);
    const [modo, setModo] = useState("nav");
    const [error, setError] = useState(null);
    const tablaFilas = filas - 9;

    useInput((tecla, key) => {
        switch (modo) {
            case "nav":
                if (key.escape) exit();
                if (tecla.toLowerCase() === "a") setModo("open");
                if (!hayDatos) break;
                if (key.upArrow) {
                    const nuevaFila = Math.max(0, seleccionado.fila - 1);
                    setSeleccionado((s) => ({...s, fila: nuevaFila}));
                    if (nuevaFila < inicio) {
                        setInicio(nuevaFila);
                    }
                }
                if (key.downArrow) {
                    const nuevaFila = Math.min(data.length - 1, seleccionado.fila + 1);
                    setSeleccionado((s) => ({...s, fila: nuevaFila}));
                    if (nuevaFila > inicio + tablaFilas - 1) {
                        setInicio(nuevaFila - tablaFilas + 1);
                    }
                }
                if (key.leftArrow) {
                    setSeleccionado((s) => ({...s, columna: Math.max(0, s.columna - 1)}));
                }
                if (key.rightArrow) {
                    setSeleccionado((s) => ({...s, columna: Math.min(columns.length - 1, s.columna + 1)}));
                }
                if (key.return) setModo("edit");
                if (tecla.toLowerCase() === "g") setModo("save");
                if (tecla === "<" || tecla === ">") {
                    const col = columns[seleccionado.columna];
                    const direccion = tecla === "<" ? 1 : -1;
                    setData((d) => [...d].sort((a, b) => {
                        const av = a[col];
                        const bv = b[col];
                        const an = Number(av);
                        const bn = Number(bv);
                        const comparacion = av !== "" && bv !== "" && !Number.isNaN(an) && !Number.isNaN(bn)
                            ? an - bn
                            : String(av).localeCompare(String(bv));
                        return comparacion * direccion;
                    }));
                }
                break;
            case "edit":
                if (key.escape) setModo("nav");
                break;
            case "save":
                if (key.escape) setModo("nav");
                break;
            case "open":
                if (key.escape) setModo("nav");
                break;
        }
    })

    const confirmarEdicion = (valor) => {
        setData((d) => d.map((fila, i) =>
            i === seleccionado.fila ? {...fila, [columns[seleccionado.columna]]: valor} : fila
        ));
        setModo("nav");
    };

    const confirmarGuardado = async (nombre) => {
        try {
            await writeFile(nombre, serializeCSV(data, columns), {encoding: "utf-8"});
            setRuta(nombre);
            setError(null);
        } catch (e) {
            setError(`No se pudo guardar "${nombre}": ${e.message}`);
        }
        setModo("nav");
    };

    const confirmarAbrir = async (ruta) => {
        try {
            const data = await parseFile(ruta);
            setData(data.parsedData);
            setColumns(data.parsedColumns);
            setRuta(ruta);
            setSeleccionado((s) => ({
                fila: Math.max(0, Math.min(s.fila, data.parsedData.length - 1)),
                columna: Math.max(0, Math.min(s.columna, data.parsedColumns.length - 1)),
            }));
            setInicio(0);
            setError(null);
        } catch (e) {
            setError(`No se pudo abrir "${ruta}": ${e.message}`);
        }
        setModo("nav");
    };

    return (
        <Box width={columnas} height={filas} alignItems="stretch" flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo} paddingX={1}>
            <Box justifyContent="space-between">
                <Text bold>{ruta ? basename(ruta) : "(sin archivo)"}</Text>
                <Text dimColor>{rowAmount} filas · {columnAmount} columnas</Text>
            </Box>
            {error && (
                <Box paddingBottom={1}>
                    <Text color="red">{error}</Text>
                </Box>
            )}
            <Box paddingBottom={1}>
                <Text>
                    {modo === "edit" && "Editar valor"}
                    {modo === "save" && "Guardar como"}
                    {modo === "nav" && "Valor seleccionado"}
                    {modo === "open" && "Abrir archivo"}
                    {" "}<Text dimColor>&gt;</Text>{" "}
                </Text>
                {modo === "edit" && (
                    <TextInput
                        key={`${seleccionado.fila}-${seleccionado.columna}`}
                        defaultValue={String(data[seleccionado.fila][columns[seleccionado.columna]])}
                        onSubmit={confirmarEdicion}
                    />
                )}
                {modo === "save" && (
                    <TextInput
                        key="save"
                        defaultValue={ruta || ""}
                        onSubmit={confirmarGuardado}
                    />
                )}
                {modo === "nav" && (
                    <Text>
                        {hayDatos
                            ? String(data[seleccionado.fila][columns[seleccionado.columna]])
                            : "(sin datos, presione A para abrir un archivo)"}
                    </Text>
                )}
                {modo === "open" && (
                    <TextInput
                        key="open"
                        defaultValue={ruta || ""}
                        onSubmit={confirmarAbrir}
                    />
                )}
            </Box>
            {hayDatos && <Box flexGrow={1} paddingBottom={1}>
                <Tabla data={data} columns={columns} seleccionado={seleccionado} inicio={inicio} tablaFilas={tablaFilas} />
            </Box>}
            <Teclas modo={modo} dataBool={hayDatos} seleccionado={seleccionado} />
        </Box>
    );
}

function logError(message) {
    console.error(message);
    process.exit(1);
}

async function init() {
    const rutaArchivo = process.argv[2];
    let data = {parsedData: [], parsedColumns: []};
    let ruta = null;

    if (rutaArchivo) {
        try {
            data = await parseFile(rutaArchivo);
            ruta = rutaArchivo;
        } catch (error) {
            logError(`No se pudo leer "${rutaArchivo}": ${error.message}`);
        }
    }

    const app = render(<App
        ruta={ruta}
        data={data.parsedData}
        columns={data.parsedColumns}
    />);
    await app.waitUntilExit();
    console.clear();
}

init();