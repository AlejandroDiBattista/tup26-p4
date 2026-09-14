#!/usr/bin/env -S node --import tsx

import React, { useState, useEffect } from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises'; 
import {TextInput} from '@inkjs/ui'; 

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};

function Empleados({datos, filaSeleccionada, columnaSeleccionada,modo, onInputSubmit, onEditSubmit}) {
    return (
        <Box flexDirection="column">
          
            
            {datos.map((dato, datoindex) => {
                const Encabezado = datoindex === 0;
                const esVisible = Encabezado || (datoindex >= filaSeleccionada - 1 && datoindex <= filaSeleccionada + 2);
                if (!esVisible) return null;

                return (
                    <Box key={datoindex} flexDirection="row">
                        <Box width={5} borderStyle="single">
                            <Text>{datoindex === 0 ? "#" : datoindex}</Text>
                        </Box>

                        {dato.map((d, index) => {
                            const Seleccionado = (datoindex === filaSeleccionada && index === columnaSeleccionada);
                            const Editando = (Seleccionado && modo === "editar");
                            return (
                                <Box 
                                    key={index} 
                                    width={14} 
                                    borderStyle="single"
                                    borderColor={Seleccionado ? COLORES.acento : undefined}
                                    backgroundColor={Seleccionado && !Editando ? COLORES.acento : undefined}
                                >
                                 {Editando ? (
                                     
                                        <TextInput defaultValue={d} onSubmit={onEditSubmit} />
                                    ) : (
                                   
                                        <Text 
                                            color={Encabezado ? COLORES.titulo : (Seleccionado ? COLORES.fondo : COLORES.secundario)}
                                            bold={Encabezado}
                                        >
                                            {d}
                                        </Text>
                                    )}
                                </Box>
                            )
                        })}
                    </Box>
                )
            })}

         {modo === "navegar" ? (
                <Box flexDirection="column" marginTop={1}>
                    <Box flexDirection="row">
                        <Text color={COLORES.acento}>A </Text><Text>abrir . </Text>
                        <Text color={COLORES.acento}>G </Text><Text>guardar . </Text>
                        <Text color={COLORES.acento}>Enter </Text><Text>editar . </Text>
                        <Text color={COLORES.acento}>Esc </Text><Text>salir .</Text>
                      <Text color={COLORES.acento}>{'<'} </Text><Text>ascendente . </Text>
                        <Text color={COLORES.acento}>{'>'} </Text><Text>descendente . </Text>
                    </Box>
                    <Box flexDirection="row">
                        <Text color={COLORES.acento}>← </Text><Text>izquierda . </Text>
                        <Text color={COLORES.acento}>→ </Text><Text>derecha . </Text>
                        <Text color={COLORES.acento}>↑ </Text><Text>arriba . </Text>
                        <Text color={COLORES.acento}>↓ </Text><Text>abajo . </Text>
                    </Box>
                    <Box>
                        <Text color={COLORES.acento}> fila: {filaSeleccionada} de {datos.length - 1} . Columna: {columnaSeleccionada + 1} de {datos[0]?.length} </Text>
                    </Box>
                </Box>
            ) : modo === "abrir" || modo === "guardar" ? (
                <Box flexDirection="row" marginTop={1}>
                    <Text color={COLORES.acento}>{modo === "abrir" ? "Abrir archivo: " : "Guardar archivo como: "}</Text>
                    <TextInput onSubmit={onInputSubmit} />
                </Box>
            ) : modo === "editar" ? (
                <Box marginTop={1}>
                    <Text color={COLORES.acento}>Editando celda... (Escribe y presiona Enter para confirmar, Esc para cancelar)</Text>
                </Box>
            ) : null}
        </Box>
    )
}

function App() {
    const [nombreArchivo, setNombreArchivo] = useState(process.argv[2] || "empleados.csv");

    const [modo, setModo] = useState("navegar")

    const [datos, setDatos] = useState([["Cargando de datos..."]]);
    const [filaSeleccionada, setFilaSeleccionada] = useState(1);
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);
    
    useEffect(() => {
        async function cargarDatos(){
            try{

                const contenido = await readFile(nombreArchivo, "utf-8")
                const contenidoLimpio = contenido.replace(/\r/g, "").trim();
                setDatos(contenidoLimpio.split("\n").map(linea => linea.split(",")));
                
                setFilaSeleccionada(1);
                setColumnaSeleccionada(0);
            } catch (error) {
                setDatos([["Error", "Archivo no encontrado"]]);
            }
        }
        cargarDatos();
    }, [nombreArchivo]);

    const {exit} = useApp();
    
    useInput((tecla, key) => {

        if(modo !== "navegar"){
            if(key.escape){
                setModo("navegar")
            }
            return
        }

        if (key.escape) {
            exit();
        }

        if (key.upArrow) {
            setFilaSeleccionada(actual => Math.max(1, actual - 1));
        }
        if (key.downArrow) {
            setFilaSeleccionada(actual => Math.min(datos.length - 1, actual + 1));
        }
        if (key.leftArrow) {
            setColumnaSeleccionada(actual => Math.max(0, actual - 1));
        }
        if (key.rightArrow) {
            setColumnaSeleccionada(actual => Math.min((datos[0]?.length || 1) - 1, actual + 1));
        }

        if (tecla === "a" || tecla === "A") {
            setModo("abrir");
        }       
        if (tecla === "g" || tecla === "G") {
            setModo("guardar");
        }
        if(key.return) {
            setModo("editar");
        }

        if (tecla === "<") ordenarDatos('asc');
        if (tecla === ">") ordenarDatos('desc');
    })

    async function abrirCerrarArchivo(texto) {
        if(!texto){
            setModo("navegar");
            return;
        } 
        if (modo === "abrir") {
            setNombreArchivo(texto); 

    }else if (modo === "guardar") {
            const csvTexto = datos.map(fila => fila.join(",")).join("\n");
            await writeFile(texto, csvTexto, "utf-8"); // Guarda en el disco duro
            setNombreArchivo(texto);
        }
        setModo("navegar");
    }

  
    function actualizarCelda(nuevoTexto) {
        const nuevosDatos = [...datos]; 
        nuevosDatos[filaSeleccionada] = [...nuevosDatos[filaSeleccionada]]; 
        nuevosDatos[filaSeleccionada][columnaSeleccionada] = nuevoTexto;
        
        setDatos(nuevosDatos); 
        setModo("navegar");
    }


    function ordenarDatos(orden) {
        if (datos.length <= 1) return; 

        const nuevosDatos = [...datos];
        const cabecera = nuevosDatos.shift();

        nuevosDatos.sort((a, b) => {
            const valA = a[columnaSeleccionada] || "";
            const valB = b[columnaSeleccionada] || "";
            
            const numA = parseFloat(valA);
            const numB = parseFloat(valB);
            
            if (!isNaN(numA) && !isNaN(numB)) {
                return orden === 'asc' ? numA - numB : numB - numA;
            }
            
            if (valA < valB) return orden === 'asc' ? -1 : 1;
            if (valA > valB) return orden === 'asc' ? 1 : -1;
            return 0;
        });
        
        setDatos([cabecera, ...nuevosDatos]); 
    }

    return (
        <Box flexDirection="column" >
            <Box><Text color={COLORES.titulo}>--- {nombreArchivo} ---</Text></Box>
            <Empleados 
                datos={datos} 
                filaSeleccionada={filaSeleccionada} 
                columnaSeleccionada={columnaSeleccionada} 
                modo={modo}
                onInputSubmit={abrirCerrarArchivo}
                onEditSubmit={actualizarCelda}
                nombreArchivo={nombreArchivo}
            />
            <Box paddingY={1}>
                <Text color={COLORES.acento}>ESTADO ACTUAL: {modo.toUpperCase()} </Text>
            </Box>
        </Box>
    )
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();