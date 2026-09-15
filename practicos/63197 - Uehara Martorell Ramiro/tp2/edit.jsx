#!/usr/bin/env -S node --import tsx

import React, {useState} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile} from 'node:fs/promises';

const ANCHO = process.stdout.columns || 80;
const ALTO = process.stdout.rows || 24;


const COLORES = {
    fondo:      '#161310',
    borde:      '#726b61',
    titulo:     '#ede7db',
    secundario: '#ada79e',
    acento:     '#edbb64',
};



function leerCsv(texto) {

    const lineas = texto.split('\n').filter(linea => linea.trim() !== '');
    const cabecera = lineas[0].split(',');
    const filas = lineas.slice(1).map(linea => linea.split(','));
    return {cabecera, filas};

}


function esNumero(texto) {
    return texto.trim() !== '' && !isNaN(Number(texto));
}


function App({archivo, cabecera, filas}) {

    const {exit} = useApp();
    const [fila, setFila] = useState(0);        
    const [columna, setColumna] = useState(0);  
    const [inicio, setInicio] = useState(0);    

    const visibles = ALTO - 9;
    const numericas = cabecera.map((titulo, c) => filas.length > 0 && filas.every(f => esNumero(f[c])));

    function textoDeCelda(valor, c) {

        if (numericas[c] && esNumero(valor)) return Number(valor).toLocaleString('es-AR');
        return valor;

    }

    const anchos = cabecera.map((titulo, c) => {

        let ancho = titulo.length;
        for (const f of filas) {
            ancho = Math.max(ancho, textoDeCelda(f[c], c).length);

        }
        return ancho;
    });



    function alinear(texto, c) {

        if (numericas[c]) return texto.padStart(anchos[c]);
        return texto.padEnd(anchos[c]);

    }


    function mover(nuevaFila, nuevaColumna) {

        setFila(nuevaFila);
        setColumna(nuevaColumna);
        if (nuevaFila < inicio) setInicio(nuevaFila);
        if (nuevaFila >= inicio + visibles) setInicio(nuevaFila - visibles + 1);
    }


    useInput((tecla, key) => {

        if (key.escape) exit();
        if (key.upArrow) mover(Math.max(0, fila - 1), columna);
        if (key.downArrow) mover(Math.min(filas.length - 1, fila + 1), columna);
        if (key.leftArrow) mover(fila, Math.max(0, columna - 1));
        if (key.rightArrow) mover(fila, Math.min(cabecera.length - 1, columna + 1));
    });


    const valor = filas.length > 0 ? filas[fila][columna] : '';
    const visto = filas.slice(inicio, inicio + visibles);

    
    return (

        <Box width={ANCHO} height={ALTO} flexDirection="column" paddingX={1}
             borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>

            <Box>
                <Box flexGrow={1}>
                    <Text bold color={COLORES.titulo}>{archivo}</Text>
                </Box>
                <Text color={COLORES.secundario}>{filas.length} filas · {cabecera.length} columnas</Text>
            </Box>

            <Text> </Text>

            <Box>
                <Text color={COLORES.secundario}>Valor › <Text color={COLORES.titulo}>{valor}</Text></Text>
            </Box>

            <Text> </Text>

            <Box>
                <Text bold color={COLORES.secundario}>{'   #'}</Text>
                {cabecera.map((titulo, c) => (
                    <Text key={c} bold
                          color={c === columna ? COLORES.acento : COLORES.secundario}>
                        {'  ' + alinear(titulo.toUpperCase(), c)}
                    </Text>
                ))}
            </Box>

            {visto.map((f, i) => {
                const numeroDeFila = inicio + i;
                return (
                    <Box key={numeroDeFila}>
                        <Text color={numeroDeFila === fila ? COLORES.acento : COLORES.secundario}>
                            {String(numeroDeFila + 1).padStart(4)}
                        </Text>
                        {f.map((celda, c) => (
                            <Text key={c}
                                  color={numeroDeFila === fila && c === columna ? COLORES.fondo : COLORES.titulo}
                                  backgroundColor={numeroDeFila === fila && c === columna ? COLORES.titulo : undefined}>
                                {'  ' + alinear(textoDeCelda(celda, c), c)}
                            </Text>
                        ))}
                    </Box>
                );
            })}

            <Box flexGrow={1} />
            <Box>
                <Box flexGrow={1}>
                    <Text wrap="truncate-end" color={COLORES.secundario}>
                        <Text bold color={COLORES.acento}>Esc</Text> salir
                    </Text>
                </Box>
                <Text wrap="truncate-end" color={COLORES.secundario}>
                    Fila {fila + 1} · Columna {columna + 1}
                </Text>
            </Box>
        </Box>
    );

}

const nombre = process.argv[2];
const texto = await readFile(nombre, 'utf8');
const datos = leerCsv(texto);
const app = render(<App archivo={nombre} cabecera={datos.cabecera} filas={datos.filas} />);
await app.waitUntilExit();

console.clear();

