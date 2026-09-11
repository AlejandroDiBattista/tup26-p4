#!/usr/bin/env -S node --import tsx

  import React, { useState, useEffect } from 'react';
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

    const Personas = [
        ["nombre","apellido","edad","salario","departamento"],
        ["Mariano","Domínguez",44,81500,"Diseño"],
        ["Rocío","Herrera",29,65050,"Marketing"]
    ];


    function personas() {
        return (

            <Box flexDirection="column">

                {Personas.map((persona, personaindex) => {
                    const Encabezado = personaindex === 0;
                    return    <Box key={personaindex} flexDirection="row">
                    {persona.map((dato, datoindex) => {
                        return        <Box key={datoindex} width={15} borderStyle="single" >
                            <Text 
                            color = {Encabezado ? COLORES.titulo : COLORES.secundario}
                            bold = {Encabezado}>
                                {dato}</Text>
                            </Box>
                        })}
                    </Box>
                })
                
            }
            </Box>
        )
            }
        
            function Empleados({datos}) {
                return (
                    
                    <Box flexDirection="column">

                {datos.map((dato, datoindex) => {
                    const Encabezado = datoindex === 0;
                    return    <Box key={datoindex} flexDirection="row">
                    {dato.map((d, index) => {
                        return        <Box key={index} width={15} borderStyle="single" >
                            <Text 
                            color = {Encabezado ? COLORES.titulo : COLORES.secundario}
                            bold = {Encabezado}>
                                {d}</Text>
                            </Box>
                        })}
                    </Box>
                })
                
            }
            </Box>
        )
    }
    
    function App() {
        
        const [datos, setDatos] = useState([["Cargando de datos..."]]);
         useEffect(() => {
          async function cargarDatos(){

              const contenido = await readFile("empleados.csv", "utf-8")
                setDatos(contenido.split("\n").map(linea => linea.split(",")));
            }
          cargarDatos()}, []);
        
        
                const {exit} = useApp();
                useInput((tecla, key) => {
                    if (key.escape) {
                        exit();
                    }
                })

                return (
                    
                    
                    <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
                <Box width={"100%"} height={"100%"} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
                    <Box flexGrow={1} justifyContent="center" alignItems="center">
                  
                        <Empleados datos={datos}/>
                    </Box>
                    <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>
                </Box>
        </Box>
    )
    }

    const app = render(<App />);
    await app.waitUntilExit();
    console.clear();
    //comenzando 