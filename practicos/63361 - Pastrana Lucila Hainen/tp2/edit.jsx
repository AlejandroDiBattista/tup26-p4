#!/usr/bin/env -S node --import tsx

import React, {useState} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';
import { fail } from 'node:assert';

const COLUMNAS = process.stdout.columns || 80;
const FILAS    = process.stdout.rows || 24;
const FILAS_VISIBLES = FILAS - 5;
const archivoInicial = process.argv[2];

let filas = [];
if  (archivoInicial) {
    const datos = await readFile(archivoInicial, 'utf8');
    const lineas = datos.trim().split('\n');
    filas = lineas.map(linea => linea.split(',')); 

    
}
const COLORES = {
    fondo:     '#161310',
    borde:     '#726b61',
    titulo:    '#ede7db',
    secundario:'#ada79e',
    acento:    '#edbb64',

 
};

function Fila({numero, fila, columnaSeleccionada, filaSeleccionada}) {
    return (
        <Box flexDirection="row" gap={1}> 
            <Text width={4}>{numero}</Text>

            <Text width={13} inverse= {filaSeleccionada === numero -1 && columnaSeleccionada === 0}>
            {fila[0]}
            </Text>
            <Text width={15}inverse= {filaSeleccionada === numero -1 && columnaSeleccionada ===  1}>
            {fila[1]}
            </Text>
            <Text width={6}inverse= {filaSeleccionada === numero -1 && columnaSeleccionada === 2}>
            {fila[2]}
            </Text>
            <Text width={11}inverse= {filaSeleccionada === numero -1 && columnaSeleccionada === 3}>
            {fila[3]}
            </Text>
            <Text width={20}inverse= {filaSeleccionada === numero -1 && columnaSeleccionada === 4}>
            {fila[4]}
            </Text>
    
    </Box>
    );
}


function App() {
    const {exit} = useApp();

    const [filaSeleccionada, setFilaSeleccionada] = useState(0);
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);
    const [inicio, setInicio] = useState(0);
    const [filasActuales, setFilasActuales] = useState(filas);
    const [editando, setEditando] = useState(false);
    const [valorEditado, setValorEditado] = useState (''); 
    const [nombreArchivo, setNombreArchivo] = useState(archivoInicial || '');
    const [abriendo, setAbriendo] = useState(false);
    const [archivoAbrir, setArchivoAbrir] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [archivoAGuardar, setArchivoAGuardar] = useState('');
    const [mensajeError, setMensajeError] = useState('');
    
    useInput(async (tecla, key) => {
        if (editando) {
            if (key.return) {
                const nuevasFilas = [...filasActuales];
                nuevasFilas[filaSeleccionada + 1][columnaSeleccionada] = valorEditado;
                setFilasActuales(nuevasFilas);
                setEditando(false);

            }

            if (key.escape) {
                setEditando(false);
            }

            return;
        }

        if (abriendo) {
            if (key.return) {

                if (archivoAbrir === '') {
                    setMensajeError('Ingrese un nombre de archivo');
                     return;                   
                }

                try {
                 const datos = await readFile(archivoAbrir, 'utf8');
                 const lineas = datos.trim().split('\n');
                 const nuevasFilas = lineas.map(linea => linea.split(','));

                 setFilasActuales(nuevasFilas);
                 setNombreArchivo(archivoAbrir);
                 setFilaSeleccionada(0);
                 setColumnaSeleccionada(0);
                 setInicio(0);
                 setAbriendo(false);
                 setArchivoAbrir('');
                 setMensajeError('');
            } catch {
                setMensajeError('Error al abrir el archivo');
            }

            return;
            
            }

            if (key.escape) {
                setAbriendo(false);
                setArchivoAbrir('')
            }

            if (key.backspace) {
                setArchivoAbrir(archivoAbrir.slice(0, -1));
                return;

            } else if (tecla) {
                setArchivoAbrir(archivoAbrir + tecla);
            }

            return;
        }

        if (guardando) {
            if (key.return) {
                const datos = filasActuales.map(fila => fila.join(',')).join('\n');
                await writeFile(archivoAGuardar, datos, 'utf8');

                setNombreArchivo(archivoAGuardar);
                setGuardando(false);
                setArchivoAGuardar('');
                return;
            }

            if (key.escape) {
            setGuardando(false);
            setArchivoAGuardar('');
            return;
            }

            if (key.backspace) {
            setArchivoAGuardar(archivoAGuardar.slice(0, -1));
            } else if (tecla) {
            setArchivoAGuardar(archivoAGuardar + tecla);
            }

            return;
        }


        if (tecla === 'a' || tecla === 'A') {
            setAbriendo(true);
            setArchivoAbrir('');
            return;
        }

        if (tecla === 'g' || tecla === 'G') {
            setGuardando(true);
            setArchivoAGuardar('');
            return;
        }
        


        if (tecla === '<') {
            const filasOrdenadas = filasActuales.slice(1);

            filasOrdenadas.sort((a, b) => {

                if (columnaSeleccionada === 2 ||  columnaSeleccionada === 3) {
                    return Number (a[columnaSeleccionada]) - Number(b[columnaSeleccionada]);
                } else {
                    return a[columnaSeleccionada]. localeCompare(b[columnaSeleccionada]);
                }

            }); 
        
            setFilasActuales([filasActuales[0], ... filasOrdenadas]);

            
    }

    if (tecla === '>') {
        const filasOrdenadas = filasActuales.slice(1);

        filasOrdenadas.sort((a,b) => {
            if (columnaSeleccionada === 2 || columnaSeleccionada === 3) {
                return Number(b[columnaSeleccionada]) - Number(a[columnaSeleccionada]);
            } else {
                return b[columnaSeleccionada].localeCompare (a[columnaSeleccionada]);
            }
        });

        setFilasActuales([filasActuales[0], ... filasOrdenadas]);

    }


        if (key.escape) {
            exit();
        }

        if(key.return) {
            setValorEditado(filasActuales [filaSeleccionada + 1][columnaSeleccionada]);
            setEditando(true);
        }

        if (key.leftArrow) {
            setColumnaSeleccionada(Math.max(columnaSeleccionada - 1, 0))
        }

        if (key.rightArrow) {
            setColumnaSeleccionada(Math.min(columnaSeleccionada + 1, 4));
        }

        if (key.upArrow) {
            const nuevaFila = Math.max(filaSeleccionada -1, 0);

            setFilaSeleccionada(nuevaFila);

            if (nuevaFila < inicio) {
                setInicio (inicio - 1);
            }
        }

        if (key.downArrow) {
            const nuevaFila = Math.min(filaSeleccionada + 1, filasActuales.length - 2);
            setFilaSeleccionada(nuevaFila);

            if (nuevaFila >= inicio + FILAS_VISIBLES) {
                setInicio(inicio + 1);
            }
        }


    }); 


    return (
        <Box 
          width={COLUMNAS} 
          height={FILAS} 
          flexDirection="column" 
        >

         
            <Text bold color={COLORES.titulo}>
                {basename(nombreArchivo)}
            </Text>

            <Text>
                { filasActuales.length > 0
              ? `${filasActuales.length - 1} filas, ${filasActuales[0].length} columnas`
              : 'No hay archivo abierto'} 
            </Text>


            <Box flexDirection="row" gap={1}>
                <Text bold width={4}>N°</Text>
                <Text bold width={13}>nombre</Text>
                <Text bold width={15}>apellido</Text>
                <Text bold width={6}>edad</Text>
                <Text bold width={11}>salario</Text>
                <Text bold width={20}>departamento</Text>
            </Box>
                  


            {filasActuales.slice(inicio + 1, inicio + FILAS_VISIBLES + 1).map((fila, indice) => (
              <Fila
                  key={indice}
                  numero={inicio + indice + 1}
                  fila={fila}
                  columnaSeleccionada={columnaSeleccionada}
                  filaSeleccionada={filaSeleccionada}
              />
            ))}

            {editando && (
                <TextInput
                    value={valorEditado}
                    onChange={setValorEditado}
                />
            
            )}

            {abriendo && (
                 <Text>
                   Archivo: {archivoAbrir}
                </Text>
            )}

            {guardando && (
                 <Text>
                   Archivo: {archivoAGuardar}
                 </Text>
            )}

            {mensajeError && (
                <Text color="red">
                    {mensajeError}
                </Text>
                
            )}
                  
                <Text color={COLORES.secundario}>
                    <Text bold color={COLORES.acento}> Esc</Text> salir</Text>
            </Box>
        
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();
