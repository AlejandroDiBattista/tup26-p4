#!/usr/bin/env -S node --import tsx

import React, {useState, useEffect} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};

function App() {
    const {exit} = useApp();
    const [empleados, setEmpleados] = useState([]);
    const [modo, setModo] = useState('normal');
    const [fila, setFila] = useState(0);
    const [columna, setColumna] = useState(0);
    const [texto, setTexto] = useState('');
    const [archivo, setArchivo] = useState('');
    const [error, setError] = useState('');
    const [encabezado, setEncabezado] = useState([]);

    useEffect(() => {
    async function cargar(){
    const contenido = await readFile(process.argv[2], 'utf-8');
    const lineas = contenido.split('\r\n');
    const lineaEncabezado = lineas[0];
    const datos = lineas.slice(1);
    const columnas = lineaEncabezado.split(',');
    let filas = []
    for (const dato of datos) {
        if (dato.trim() === '') continue;
        filas.push(dato.split(','));
    }
    setEncabezado(columnas);
    setEmpleados(filas);
    setArchivo(process.argv[2]);
    }
    cargar();
    }, []);

    useInput((tecla, key) => {
    if (key.escape && modo === 'normal') {    
        exit();
    }
    else if (key.escape && modo !== 'editar') {
        setModo('normal');
    }

    if (key.upArrow && fila > 0 && modo === 'normal') {
    setFila(fila - 1);
}
if (key.downArrow && fila < empleados.length - 1 && modo === 'normal') {
    setFila(fila + 1);
}
if (key.leftArrow && columna > 0 && modo === 'normal') {
    setColumna(columna - 1);
}
if (key.rightArrow && columna < encabezado.length - 1 && modo === 'normal') {
    setColumna(columna + 1);
}
if (tecla === '<' && modo === 'normal') {
    const copia = [...empleados];
    copia.sort((a, b) => a[columna].localeCompare(b[columna]));
    setEmpleados(copia);
}
if (tecla === '>'&& modo === 'normal') {
    const copia = [...empleados];
    copia.sort((a, b) => b[columna].localeCompare(a[columna]));
    setEmpleados(copia);
}
if (key.return && modo === 'normal') {
    setTexto(empleados[fila][columna]);
    setModo('editar');
}
if (tecla === 'g' && modo === 'normal') {
    setTexto(archivo);
    setModo('guardando');
}

});


if (empleados.length === 0) {
    return <Text>Cargando...</Text>;
}



return (
    <Box width={COLUMNAS} justifyContent="center" alignItems="center">
        <Box width={COLUMNAS} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
            <Box justifyContent="space-between">
                <Text bold color={COLORES.titulo}>{archivo}</Text>
                <Text color={COLORES.secundario}>{empleados.length} filas · {encabezado.length} columnas</Text>
            </Box>
            {modo === 'normal' && (
    <Text color={COLORES.secundario}>Valor {'>'} {empleados[fila][columna]}</Text>
)}
{modo === 'editar' && (
    <TextInput
        defaultValue={texto}
        onChange={setTexto}
        onSubmit={(valor) => {
            const nuevosEmpleados = empleados.map((empleado, i) => {
                if (i === fila) {
                    const nuevaFila = [...empleado];
                    nuevaFila[columna] = valor;
                    return nuevaFila;
                }
                return empleado;
            });
            setEmpleados(nuevosEmpleados);
            setModo('normal');
        }}
    />
)}
{modo === 'guardando' && (
    <Box>
        <Text color={COLORES.secundario}>Guardar {'>'} </Text>
        <TextInput
            defaultValue={texto}
            onChange={setTexto}
            onSubmit={async (valor) => {
                let unir = encabezado.join(',')
                for (const empleado of empleados) {
                    unir += '\r\n' + empleado.join(',');  
                }
                 await writeFile(valor, unir, 'utf-8');
                    setArchivo(valor);
                    setModo('normal');
}}
        />
    </Box>
)}
            <Box flexDirection="row">
                {encabezado.map((columna) => (
                    <Box key={columna} marginRight={2}>
                        <Text>{columna}</Text>
                    </Box>
                ))}
            </Box>
            {empleados.map((empleado, indice) => (
                <Box key={empleado[0]} flexDirection="row">
                    <Box marginRight={2}><Text>{indice + 1}</Text></Box>
                    {empleado.map((dato, columnaIndice) => {
                        const seleccionada = indice === fila && columnaIndice === columna;
                        return (
                            <Box key={columnaIndice} marginRight={2}>
                                <Text
                                    backgroundColor={seleccionada ? COLORES.acento : undefined}
                                    color={seleccionada ? COLORES.fondo : undefined}
                                >
                                    {dato}
                                </Text>
                            </Box>
                        );
                    })}
                </Box>
            ))}
            <Text color={COLORES.secundario}>Fila {fila + 1} · Columna {columna + 1}</Text>
        </Box>
    </Box>
);

}

const app = render(<App />);
await app.waitUntilExit();
console.clear();
