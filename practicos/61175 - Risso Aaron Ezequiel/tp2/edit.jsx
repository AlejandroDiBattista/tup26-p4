#!/usr/bin/env -S node --import tsx

import React, {useState, useEffect} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;
const ruta = process.argv[2];
const NombreArc = process.argv[2] ? basename(ruta) : "No existe Archivo";



const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',   
};

function parseDelimited (data,delimiter = ',') {
 const texto = data.replace(/\r\n/g, "\n");
 const lineas = texto.split("\n").filter(linea => linea !== "");
 const filas = lineas.map(linea => linea.split(delimiter));

 const header = filas[0];
 const rows = filas.slice(1);
 return {header,rows};}

 function maximaLongitud(array) {
    let longitudes = array.map((valor) => {
        return valor.length;
    });

    return Math.max(...longitudes);
}

function anchoColumna(titulo,palabras){
    if(maximaLongitud(palabras) > titulo.length){
        return maximaLongitud(palabras)
    }
    else{
        return titulo.length;
    }
}

function calcularAnchos(header,rows){
    let anchos = [];
    for (let i = 0; i < header.length; i++) {

    let columna = rows.map((row) => {
        return row[i];
    });

    let ancho = anchoColumna(header[i], columna);

    anchos.push(ancho);
}
 return anchos;
}


function App() {
    const {exit} = useApp();
    const [contenido, setContenido] = useState({header: [], rows: []});
    const anchos = calcularAnchos(contenido.header,contenido.rows);
    const [posicionC, setPosicionC] = useState(0);
    const [posicionF, setPosicionF] = useState(0);

    useEffect(() => {
        async function leerArchivo() {
            const data = await readFile(ruta, 'utf-8');
            setContenido(parseDelimited(data));
        }
        if (ruta != null) {
            leerArchivo();
        }
        else {
            setContenido("No se encontro un archivo a editar");
        }
            
    }, []);
    
    useInput((tecla, key) => {
        if (key.escape) {
            exit();
        }

        if (key.upArrow){
            setPosicionF(Math.max(0, posicionF -1));
        }

         if (key.downArrow){
            setPosicionF(Math.min(contenido.rows.length -1, posicionF +1));
        }

         if (key.leftArrow){
            setPosicionC(Math.max(0, posicionC -1));
        }

         if (key.rightArrow){
            setPosicionC(Math.min(contenido.header.length -1, posicionC +1));
        }
    })

    return (
        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
            <Box width={70} /* height={16} */ flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
             <Box flexDirection="column">
                <Box  flexDirection="row" justifyContent="space-between">
                 <Text color={COLORES.secundario}>
                 Filas: {contenido.rows.length} · Columnas: {contenido.header.length}
                </Text>
                 <Text color={COLORES.secundario}>
                    filas {posicionF + 1} · columnas {posicionC + 1}
                    </Text>
                </Box>
                 <Box width="auto">
                    <Box width={4} marginRight={1}>
                            <Text> # </Text>
                    </Box>
                    {contenido.header.map((campoH,indiceH)=>( 
                    <Box key={indiceH} width={anchos[indiceH]} marginRight={1}>
                    <Text color={COLORES.secundario}>{campoH.toUpperCase()}</Text>
                    </Box>
                    ))}
                 </Box>
                 {contenido.rows.slice(0,13).map((fila, indiceF) => (
                   <Box key={indiceF}>
                    <Box width={4} marginRight={1}>
                        <Text> {indiceF + 1} </Text>
                    </Box>
                    {fila.map((campo, indiceC) => (
                     <Box key={indiceC} width={anchos[indiceC]} marginRight={1}>
                        <Text>{campo}</Text>
                     </Box>))}
                   </Box>
                 ))}
             </Box>
                <Box flexDirection="row" justifyContent="space-between">
                 <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>
                 <Text bold color={COLORES.secundario}>Archivo: {NombreArc}</Text>
                </Box>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();