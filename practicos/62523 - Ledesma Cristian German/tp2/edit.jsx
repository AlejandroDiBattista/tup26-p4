#!/usr/bin/env -S node --import tsx

import React from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';
import { text } from 'node:stream/consumers';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;

const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',
};
    const archivoInicial = process.argv[2] || null;

function procesarTxtCrudo(txtCrudo){

    if(!txtCrudo || txtCrudo.trim() === ""){
    return[];
    } 
    const lineas = txtCrudo.split(/\r??\n/);
    const matriz = [];

    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i];
        if(i === lineas.length -1 && linea === "")continue;
        
        const columnas = linea.split(',');
        matriz.push(columnas);
    }
    return matriz;
}

function App() {

    const [nombreArchivo,setNombreArchivo] = React.useState(archivoInicial);
    const [datos,setDatos] = React.useState([]);
    const [filaSelec,setFilaselec] = React.useState(0);
    const [columnselect,SetColumnSelect] = React.useState(0);

    React.useEffect(()=> {
        async function cargarArchivo() {
            if (nombreArchivo !== null) {
                try{
                const texto = await readFile(nombreArchivo,'utf-8' );
                const matrizConvertida = procesarTxtCrudo(texto);
                
                setDatos(matrizConvertida);
                }catch (error) {}
            }
        } cargarArchivo();
    },[nombreArchivo]);


    const {exit} = useApp();
    
    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }
        if (key.downArrow) {
            if (filaSelec < datos.length -1) {
                setFilaselec(filaSelec +1);
            }
        }
        if (key.upArrow) {
            if (filaSelec > 0 ) {
                setFilaselec(filaSelec -1)
            }
        }
        if (key.rightArrow) {
            if (datos.length > 0 && columnselect < datos[0].length -1) {
                SetColumnSelect(columnselect +1);
            }
        }
        if (key.leftArrow) {
            if (columnselect > 0) {
                SetColumnSelect(columnselect -1);
            }
        }
    } 
)

    return (
        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center" backgroundColor={COLORES.fondo}>
            <Box width={COLUMNAS} height={FILAS} flexDirection="column" borderStyle="round" borderColor={COLORES.fondo} backgroundColor={COLORES.fondo}>
                <Box justifyContent="space-between" width="100%" paddingX={1} height={1} >
                    <Text bold color={COLORES.titulo}>{nombreArchivo || "sin_nombre.cvs" }</Text>
                    <Text bold color={COLORES.secundario}>{datos.length} filas · {datos[0]?.length || 0} columnas</Text>
                </Box>
                <Box paddingX={1} height={1} marginBottom={1}>
                    <Text color={COLORES.secundario}>Valor ›</Text>
                    <Text bold color={COLORES.titulo}>{datos[filaSelec]?.[columnselect] || ""}</Text>
                </Box>
                <Box flexGrow={1} padding={1} flexDirection="column"> 
                {(() => {
                        let inicio = 0;
                        if (filaSelec >= 10) {
                        inicio = filaSelec - 9;
                }
                let fin = inicio + 10;
                const filasVisibles = datos.slice(inicio, fin);
                        return filasVisibles.map((fila, indexFila) => (
                        <Box key={indexFila} flexDirection='row'>
                        {fila.map((celda, indexColumna) => {
                        const posicionRealFila = indexFila + inicio;
                        const esSeleccionada = (posicionRealFila === filaSelec && indexColumna === columnselect);
                        return (
                    <Box key={indexColumna} width={18} paddingX={1} backgroundColor={esSeleccionada ? COLORES.acento : undefined}>
                        <Text color={esSeleccionada ? '#000000' : COLORES.titulo}>
                            {celda}
                        </Text>
                    </Box>
                );
                })}
        </Box>
        ));
        })()}</Box>
                <Box justifyContent="space-between" width="100%" paddingX={1} height={1} marginTop={1}>
                    <Box>
                        <Text color={COLORES.secundario}>
                            <Text bold color={COLORES.acento}>A</Text> abrir  ·  
                            <Text bold color={COLORES.acento}>  G</Text> guardar  ·  
                            <Text bold color={COLORES.acento}> Enter</Text> editar  ·  
                            <Text bold color={COLORES.acento}> &lt;</Text> ascendente  ·  
                            <Text bold color={COLORES.acento}> &gt;</Text> descendente  ·  
                            <Text bold color={COLORES.acento}> Esc</Text> salir  ·  
                        </Text>
                    </Box>
                    <Box>
                        <Text color={COLORES.secundario}>
                            Fila {filaSelec +1}  ·  Columna {columnselect +1}
                        </Text>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();