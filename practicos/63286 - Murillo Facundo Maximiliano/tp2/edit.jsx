#!/usr/bin/env -S node --import tsx

import React, { use, useState } from 'react';
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

const leerEmpleados = await readFile(process.argv[2], "utf-8")
const separarEmpleados = leerEmpleados.split("\n")
// console.log(leerEmpleados);
// console.log(separarEmpleados);

const resultados = separarEmpleados.map(texto => texto.trim())
// console.log(resultados)
const limpias = resultados.filter(linea => linea !== "");
const separarFilas = limpias.map(resultados => resultados.split(","))
console.log(separarFilas[0]);

function mostrarDatos(){

    const nombreArchivo = "empleados.csv"
    const filas = resultados.length 
    const columnas = separarFilas[0].length

    return `Nombre de fila es : ${nombreArchivo} , filas: ${filas} y columnas: ${columnas}`

}

function App() {
    const {exit} = useApp();

    const [filaSeleccionada, setFilaSeleccionada] = useState(0)
    const [colSeleccionada, setColSeleccionada] = useState(0)
    const [inicioVisible, setInicioVisibile] = useState(0)
    const cantidadVisible = 9
    const [datos, setDatos] = useState(separarFilas)
    const filasVisibles = datos.slice(inicioVisible, inicioVisible + cantidadVisible);

    const [editando, setEditando] = useState(false);
    const [valorEdicion, setValorEdicion] = useState("");


    useInput((tecla, key) => {
        if (key.escape) {
             if (editando) {
                setEditando(false);
            } else {
                exit();
            }
        }
        if (key.downArrow) {
                setFilaSeleccionada(anterior =>
                    anterior < separarFilas.length - 1
                        ? anterior + 1
                        : anterior
                );

                if (filaSeleccionada >= inicioVisible + cantidadVisible - 1) {
                    setInicioVisibile(anterior => anterior + 1);
                }
        }
        if(key.upArrow){
             setFilaSeleccionada(anterior =>
                    anterior > 0 ? anterior - 1 : anterior
                );

                if (filaSeleccionada <= inicioVisible && inicioVisible > 0) {
                    setInicioVisibile(anterior => anterior - 1);
                }
        }
        if(key.rightArrow){
            setColSeleccionada(columna => columna < separarFilas[0].length - 1 ? columna + 1 : columna )
        }
        if(key.leftArrow){
            setColSeleccionada(columna => columna > 0 ? columna - 1 : columna  )
        }
       if (key.return) {
            if(!editando){
                setEditando(true);
                setValorEdicion(datos[filaSeleccionada][colSeleccionada])
            } else {
                const datosEdicion = datos.map(fila => [...fila]);
                datosEdicion[filaSeleccionada][colSeleccionada] = valorEdicion;
                setDatos(datosEdicion) 
                setEditando(false);
            }
        }
        if (tecla === "<") {
            const cabecera = datos[0];
            const filasOrdenadas = datos.slice(1);
            filasOrdenadas.sort((a, b) =>
                {if(colSeleccionada === 2 || colSeleccionada === 3){
                  return Number(a[colSeleccionada]) - Number(b[colSeleccionada]);
                } else{
                    return a[colSeleccionada].localeCompare(b[colSeleccionada])
                }}
            )
            setDatos([cabecera, ...filasOrdenadas])
        }

        if (tecla === ">") {
             const cabecera = datos[0];
            const filasOrdenadas = datos.slice(1);
            filasOrdenadas.sort((a, b) =>
                {if(colSeleccionada === 2 || colSeleccionada === 3){
                  return Number(b[colSeleccionada]) - Number(a[colSeleccionada]);
                } else{
                    return b[colSeleccionada].localeCompare(a[colSeleccionada])
                }}
            )
            setDatos([cabecera, ...filasOrdenadas])
        }
    })
    

    return (
        
        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
            <Box flexDirection='column' padding={10}>
                <Text bold color={COLORES.acento}>Fila seleccionada: {filaSeleccionada}</Text>
                <Text bold color={COLORES.acento}>Columna seleccionada: {colSeleccionada}</Text>

                <Text bold color={COLORES.acento}>
                Fila: {filaSeleccionada} | Columna: {colSeleccionada} | {separarFilas[0][colSeleccionada]}:  
                 {separarFilas[filaSeleccionada][colSeleccionada]}
                </Text>
                <Text bold color={COLORES.acento}>Valor edición: {valorEdicion}</Text>
                {editando && (
                    <TextInput
                    value={valorEdicion}
                    onChange={setValorEdicion}
                    />
                )}
            </Box>
            <Box flexDirection="column" borderStyle="round">
                 <Box>
                     <Text bold
                        color={COLORES.acento}>#</Text>
                    {separarFilas[0].map((titulo, indice) => (
                        <Text
                        key={indice}
                        bold
                        color={COLORES.acento}
                        >
                        {titulo.padStart(20)}
                        </Text>
                    ))}
                </Box>
                {filasVisibles.map((fila, indiceFila) => {

                const indiceReal = inicioVisible + indiceFila;
                return(
                    <Box key={indiceReal}>
                        <Text bold>{indiceReal}</Text>
                        {fila.map((col, indiceCol) => (
                            <Text key={indiceCol}
                            inverse={indiceReal === filaSeleccionada && indiceCol === colSeleccionada}
                            bold={indiceReal === filaSeleccionada && indiceCol === colSeleccionada}
                            >
                                {col.padStart(20)}
                            </Text>
                        )
                    )}
                    </Box>
                )
            }
            )}
            
            </Box> 
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear(); 