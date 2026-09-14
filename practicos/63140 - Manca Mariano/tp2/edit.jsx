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


        
            function Empleados({datos, filaSeleccionada, columnaSeleccionada}) {
                return (
                    
                    <Box flexDirection="column">
                        <Box><Text>Empleados.csv</Text></Box>
                {datos.map((dato, datoindex) => {
                    const Encabezado = datoindex === 0;
                

                    return    <Box key={datoindex} flexDirection="row">
                        <Box width={5} borderStyle="single">
                            <Text>{datoindex === 0 ? "#" : datoindex}</Text>
                        </Box>

                    {dato.map((d, index) => {
                        const Seleccionado = (datoindex===filaSeleccionada && index === columnaSeleccionada)
                        return        <Box key={index} width={18} borderStyle="single"
                         borderColor={Seleccionado ? COLORES.acento : undefined}
                         backgroundColor={Seleccionado ? COLORES.acento : undefined}>
                            
                            <Text 
                            color = {Encabezado ? COLORES.titulo : COLORES.secundario}
                            bold = {Encabezado}>
                                {d}</Text>
                            </Box>
                        })}
                    </Box>
                })
                
            }
            
             <Box flexDirection="row">
    <Text color={COLORES.acento}>A </Text><Text>abrir . </Text>
    <Text color={COLORES.acento}>G </Text><Text>guardar . </Text>
    <Text color={COLORES.acento}>Enter </Text><Text>editar . </Text>
    <Text color={COLORES.acento}>← </Text><Text>ascendente . </Text>
    <Text color={COLORES.acento}>→ </Text><Text>descendente . </Text>
    <Text color={COLORES.acento}>↑ </Text><Text>arriba . </Text>
    <Text color={COLORES.acento}>↓ </Text><Text>abajo . </Text>
    <Text color={COLORES.acento}>Esc </Text><Text>salir </Text>
</Box>
<Box>
    <Text color={COLORES.acento}> fila {datos.length} . Columna {datos[0]?.length} </Text>
</Box>
            </Box>
            )
    }
    
    function App() {
        
        const [datos, setDatos] = useState([["Cargando de datos..."]]);
        const [filaSeleccionada, setFilaSeleccionada] = useState(1);
        const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);
         useEffect(() => {
          async function cargarDatos(){

              const contenido = await readFile("empleados.csv", "utf-8")
              const contenidoLimpio = contenido.replace(/\r/g, "").trim();
                setDatos(contenidoLimpio.split("\n").map(linea => linea.split(",")));
            }
          cargarDatos()}, []);
        
        
                const {exit} = useApp();
                useInput((tecla, key) => {
                    if (key.escape) {
                        exit();
                    }

                    if (key.upArrow && filaSeleccionada > 1) {
                        setFilaSeleccionada(filaSeleccionada -1);
                    }
                    if (key.downArrow && filaSeleccionada < datos.length - 1) {
                        setFilaSeleccionada(filaSeleccionada +1);
                    }
                    if (key.leftArrow && columnaSeleccionada > 0) {
                        setColumnaSeleccionada(columnaSeleccionada -1);
                    }
                    if (key.rightArrow && columnaSeleccionada < datos[0].length - 1) {
                        setColumnaSeleccionada(columnaSeleccionada +1);
                    }
                })

         
                return (
                    <Box flexDirection="column" paddingX={1} paddingY={1}>
                        <Empleados 
                            datos={datos} 
                            filaSeleccionada={filaSeleccionada} 
                            columnaSeleccionada={columnaSeleccionada} 
                        />
                    </Box>
                )
    }

    const app = render(<App />);
    await app.waitUntilExit();
    console.clear();
    //comenzando 