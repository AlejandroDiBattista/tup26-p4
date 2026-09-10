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


function App({archivo}) {
    const [datos, setDatos] = React.useState({header: [], rows: []});
    const [nombreArchivo, setNombreArchivo] = React.useState(archivo ?? null);
    const [error, setError] = React.useState(null);

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
    })

    return (
        <Box width={COLUMNAS} height={FILAS} flexDirection="column" padding={1}>
            <Text bold color={COLORES.titulo}>Editor CSV</Text>
            <Text color={COLORES.secundario}>
                Archivo: {nombreArchivo ?? "(ninguno)"} — {datos.rows.length} filas, {datos.header.length} columnas
            </Text>
            {error && <Text color="red">Error: {error}</Text>}
            <Box marginTop={1} flexDirection="column">
                <Text bold>{datos.header.join(" | ")}</Text>
                {datos.rows.map((fila, i) => (
                    <Text key={i}>{fila.join(" | ")}</Text>
                ))}
            </Box>
            <Box marginTop={1}>
                <Text color={COLORES.secundario}><Text bold color={COLORES.acento}>Esc</Text> salir</Text>
            </Box>
        </Box>
    );
}





const app = render(<App archivo="empleados.csv" />);
await app.waitUntilExit();
console.clear();