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
        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
            <Box width={COLUMNAS -2} height={FILAS -2} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
                <Box height={1} paddingX={1} >
                    <Text bold color={COLORES.titulo}>
                        Archivo: {nombreArchivo || "ninguno"}
                    </Text>
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
                    <Box 
                        key={indexColumna} 
                        width={15} 
                        paddingX={1}
                        backgroundColor={esSeleccionada ? COLORES.acento : undefined}
                    >
                        <Text color={esSeleccionada ? '#000000' : COLORES.titulo}>
                            {celda}
                        </Text>
                    </Box>
                );
                })}
        </Box>
        ));
        })()}</Box>
                <Box height={1} paddingX={1} borderStyle="single" borderTop borderColor={COLORES.borde}>
                    <Text color={COLORES.secundario}>
                        <Text bold color={COLORES.acento}>Esc </Text> Salir
                    </Text>
                </Box>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();