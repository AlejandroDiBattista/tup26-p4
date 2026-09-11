#!/usr/bin/env -S node --import tsx
import fs from 'fs';
import React from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';


const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};
const ANCHOS_COLUMNAS =[10,20,10,12,18]
//funcion que lee el archivo de datos
function readArchivo(filePath) {
    try {
        const texto = fs.readFileSync(filePath, 'utf-8');
        return {exito:true, datos:texto};
    } catch (error) {
        console.error(`error al leer el archivo: ${error.message}`);
        return {exito:false, datos:null};
    }
     }

     /// transformamos el texto en header y rows
function parseArchivo(texto) {
    const lineas = texto.replace(/\r\n/g, "\n").split("\n").filter(l => l !== "");
    const filas = lineas.map(linea => linea.split(','));
    const header = filas[0];
    const rows = filas.slice(1);
    return{header, rows};
}

// estados y abajo las teclas de manejo de la app
function App({archivo}) {
    const [datos, setDatos] = React.useState({header: [], rows: []});
    const [nombreArchivo, setNombreArchivo] = React.useState(archivo ?? null);
    const [error, setError] = React.useState(null);
    const [filaSeleccionada,setFilaSeleccionada] = React.useState(0);
    const [columnaSeleccionada,setColumnaSeleccionada] = React.useState(0);

const [cargado, setCargado] = React.useState(false);
if (!cargado&&archivo) {
    
    const resultado = readArchivo(archivo);
    if (resultado.exito) {
        setDatos(parseArchivo(resultado.datos));
        setError(null)

    }else{
        setError(`No se pudo leer el archivo`);
    }
setCargado(true);
}
    const {exit} = useApp();
    
    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
        if (key.upArrow)    setFilaSeleccionada(f => Math.max(0, f - 1));
        if(key.downArrow)  setFilaSeleccionada(f => Math.min(datos.rows.length - 1, f + 1));
        if (key.leftArrow)  setColumnaSeleccionada(c => Math.max(0, c - 1));
        if (key.rightArrow) setColumnaSeleccionada(c => Math.min(datos.header.length - 1, c + 1));
    })

    const valorSeleccionado = datos.rows[filaSeleccionada]?.[columnaSeleccionada] ?? "";

    return (
        <Box width={COLUMNAS} height={undefined} flexDirection="column" padding={1} borderStyle="single" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
            <Box justifyContent="space-between">
                <Text bold color={COLORES.titulo}>{nombreArchivo ?? "(ninguno)"}</Text>
                <Text bold color={COLORES.secundario}>
                    {datos.rows.length} filas · {datos.header.length} columnas
                </Text>
            </Box>
            <Box marginTop={1}>
                <Text color={COLORES.secundario}>Valor › </Text>
                <Text color={COLORES.titulo}>{valorSeleccionado}</Text>
            </Box>

            {error && (
                <Box marginTop={1}>
                    <Text color="red">{error}</Text>
                </Box>
            )}

            <Box marginTop={1} flexDirection="column">
                <Box>
                    <Box width={4}>
                        <Text color={COLORES.secundario}>#</Text>
                    </Box>
                    {datos.header.map((columna, i) => (
                        <Box key={i} width={ANCHOS_COLUMNAS[i] || 15}>
                            <Text
                                bold
                                backgroundColor={i === columnaSeleccionada ? "black" : undefined}
                                color={i === columnaSeleccionada ? COLORES.acento : COLORES.secundario}
                            >
                                {columna.toUpperCase()}
                            </Text>
                        </Box>
                    ))}
                </Box>
                {datos.rows.map((fila, f) => (
                    <Box key={f}>
                        <Box width={4}>
                            <Text
                                backgroundColor={f === filaSeleccionada ? "black" : undefined}
                                color={f === filaSeleccionada ? COLORES.acento : COLORES.secundario}
                            >
                                {f + 1}
                            </Text>
                        </Box>
                        {fila.map((valor, c) => {
                            const esSeleccionada = f === filaSeleccionada && c === columnaSeleccionada;
                            return (
                                <Box key={c} width={ANCHOS_COLUMNAS[c] || 15}>
                                    <Text
                                        backgroundColor={esSeleccionada ? "white" : undefined}
                                        color={esSeleccionada ? "black" : COLORES.titulo}
                                    >
                                        {valor}
                                    </Text>
                                </Box>
                            );
                        })}
                    </Box>
                ))}
            </Box>
            <Box marginTop={1} justifyContent="space-between">
                <Text color={COLORES.secundario}>
                    <Text bold color={COLORES.acento}>A</Text> abrir ·{" "}
                    <Text bold color={COLORES.acento}>G</Text> guardar ·{" "}
                    <Text bold color={COLORES.acento}>Enter</Text> editar ·{" "}
                    <Text bold color={COLORES.acento}>&lt;</Text> ascendente ·{" "}
                    <Text bold color={COLORES.acento}>&gt;</Text> descendente ·{" "}
                    <Text bold color={COLORES.acento}>Esc</Text> salir
                </Text>
                <Text color={COLORES.secundario}>
                    Fila {filaSeleccionada + 1} · Columna {columnaSeleccionada + 1}
                </Text>
            </Box>
            
        
        </Box>
    );
}





const app = render(<App archivo="empleados.csv" />);
await app.waitUntilExit();
console.clear();