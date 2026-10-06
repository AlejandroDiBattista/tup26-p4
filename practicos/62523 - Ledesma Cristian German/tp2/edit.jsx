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
function convertirMatrizAtexto(matriz){
    const lineas =[];
    for (let i = 0; i < matriz.length; i++) {
        const filaUnida = matriz[i].join(',');
        lineas.push(filaUnida);
    }
    return lineas.join('\n');
}

function App() {

    const [nombreArchivo,setNombreArchivo] = React.useState(archivoInicial);
    const [datos,setDatos] = React.useState([]);
    const [filaSelec,setFilaselec] = React.useState(0);
    const [columnselect,SetColumnSelect] = React.useState(0);
    const [editando,setEditando] = React.useState(false);
    const [valorEditado,setValorEditado] = React.useState("");
    const [guardando, setGuardando] = React.useState(false);
    const [nombreGuardar, setNombreGuardar ] = React.useState("");
    const [abriendo,setAbriendo] = React.useState(false);
    const [nombreAbrir, setNombreAbrir] = React.useState("");
    const [mensajeError, setMensajeError] = React.useState("");

    React.useEffect(()=> {
        async function cargarArchivo() {
            if (nombreArchivo !== null) {
                try{
                const texto = await readFile(nombreArchivo,'utf-8' );
                const matrizConvertida = procesarTxtCrudo(texto);
                
                setDatos(matrizConvertida);
                }catch (error) {
                    setDatos([]);
                    setMensajeError("Error: el archivo inicial no existe o esta corrupto");}
            }
        } cargarArchivo();
    },[nombreArchivo]);


    const {exit} = useApp();
    
    useInput((tecla, key) => {
        if (key.escape) {
            if (editando) {
                setEditando(false);
            }else if (guardando) {
                setGuardando(false);
            }else if (abriendo) {
                setAbriendo(false);
            }else{
                exit();
            }
        }
        if(!editando){
        if (key.downArrow) {
            setMensajeError("");
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
        if (key.return) {
            setValorEditado(datos[filaSelec]?.[columnselect] || "");
            setEditando(true);
        }
        if (tecla === '<') {
            if (datos.length >1) {
                const encabezado = datos[0];
                const filasParaOrdenar = datos.slice(1);
                filasParaOrdenar.sort((filaA,filaB) => {
                    const valorA = filaA[columnselect] || "";
                    const valorB = filaB[columnselect] || "";
                    if (!isNaN(valorA) && !isNaN(valorB) && valorA.trim() !== ""&& valorB.trim() !== "") {
                        return Number(valorA) - Number(valorB);
                    }
                    return valorA.localeCompare(valorB,'es',{sensitivity: 'accent'});
                });
                setDatos([encabezado, ...filasParaOrdenar]);
            }
        }
        if (tecla === '>') {
            if (datos.length >1) {
                const encabezado = datos[0];
                const filasParaOrdenar = datos.slice(1);
                filasParaOrdenar.sort((filaA,filaB) => {
                    const valorA = filaA[columnselect] || "";
                    const valorB = filaB[columnselect] || "";
                    if (!isNaN(valorA) && !isNaN(valorB) && valorA.trim() !== ""&& valorB.trim() !== "") {
                        return Number(valorB) - Number(valorA);
                    }
                    return valorB.localeCompare(valorA,'es',{sensitivity: 'accent'});
                });
                setDatos([encabezado, ...filasParaOrdenar]);
            }
        }
        if (tecla === 'g' || tecla === 'G') {
            setMensajeError("");
            setGuardando(true);
        }
        if (tecla === 'a' || tecla === 'A') {
            if (!guardando) {
                setMensajeError("");
                setNombreAbrir("");
                setAbriendo(true);
            }
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
                    {mensajeError ? (
                        <Text color="red" bold>{mensajeError}</Text>
                    ) : abriendo ? (
                        <> 
                        <Text color={COLORES.acento}>Abrir › </Text>
                        <TextInput
                        value ={nombreAbrir}
                        onChange={setNombreAbrir}
                        onSubmit={async (nuevoArchivo) => {
                            if (nuevoArchivo.trim() !== "") {
                                try{
                                const texto = await readFile(nuevoArchivo, 'utf-8');
                                const matrizConvertida = procesarTxtCrudo(texto);
                                setDatos(matrizConvertida);
                                setNombreArchivo(nuevoArchivo);
                                setFilaselec(0);
                                SetColumnSelect(0);
                                }catch(error){
                                    setMensajeError(`Error: no se pudo abrir "${nuevoArchivo}" verifica la ruta`)
                                }
                            }
                            setAbriendo(false);
                        }}
                        />
                        </>
                    ) : guardando ? (
                        <>
                        <Text color={COLORES.acento}>Guardar › </Text>
                        <TextInput
                        defaultValue={nombreArchivo || ""}
                        value ={nombreGuardar}
                        onChange={setNombreGuardar}
                        onSubmit={async (nombreFinal)=>{
                            if (nombreFinal.trim() !== "") {
                                try{
                                    const csvTexto = convertirMatrizAtexto(datos);
                                    await writeFile(nombreFinal, csvTexto, 'utf-8');
                                    setNombreArchivo(nombreFinal);
                                }catch(error){
                                setMensajeError("Error: no se pudo guardar el archivo. permiso denegado");
                                }
                            }
                            setGuardando(false);
                                }}
                            />
                        </> 
                    ) : ( 
                        <>
                    <Text color={COLORES.secundario}>Valor ›</Text>
                    {editando ? (
                        <TextInput
                        defaultValue={datos[filaSelec]?.[columnselect] || ""}
                        value = {valorEditado}
                        onChange={setValorEditado}
                        onSubmit={(nuevoValor) => {
                        const copiaDatos = [...datos];
                        copiaDatos[filaSelec][columnselect] = nuevoValor;
                        setDatos(copiaDatos);
                        setEditando(false);
                        }}
                        />
                    ):(
                    <Text bold color={COLORES.titulo}>{datos[filaSelec]?.[columnselect] || ""}</Text>
                                )}
                        </>
                    )}
                </Box>
                <Box flexGrow={1} padding={1} flexDirection="column"> 
                {(() => {
                        let inicio = 0;
                        if (filaSelec >= 10) {
                        inicio = filaSelec - 9;
                }
                let fin = inicio + 10;
                        const filasVisibles = datos.slice(inicio, fin);
                    return filasVisibles.map((fila, indexFila) => {
                        const numeroFilaReal = indexFila + inicio + 1;
                        return (
                        <Box key={indexFila} flexDirection='row'>
                            <Box width={4} justifyContent="flex-end" paddingRight={1}>
                                <Text color={COLORES.secundario}>
                                    {indexFila + inicio === 0 ? "#" : numeroFilaReal -1}
                                    </Text>
                            </Box>
                            {fila.map((celda, indexColumna) => {
                        const posicionRealFila = indexFila + inicio;
                        const esSeleccionada = (posicionRealFila === filaSelec && indexColumna === columnselect);
                    return (
                        <Box key={indexColumna} width={18} paddingX={1} backgroundColor={esSeleccionada ? COLORES.acento : undefined}>
                        <Text color={esSeleccionada ? "black" : COLORES.titulo}>
                            {celda}
                        </Text>
                        </Box>
                );
                })}
        </Box>
        );
        });
        })()}</Box>
                <Box justifyContent="space-between" width="100%" paddingX={1} height={1} marginTop={1}>
                    <Box>
                        {editando ? (
                            <Text color={COLORES.secundario}>
                            <Text bold color={COLORES.acento}>Enter</Text> confirmar ·
                            <Text bold color={COLORES.acento}> Esc</Text>  cancelar
                            </Text>
                            ) : guardando ? (
                            <Text color={COLORES.secundario}>
                            <Text bold color={COLORES.acento}>Enter</Text> guardar ·
                            <Text bold color={COLORES.acento}> Esc</Text> cancelar
                        </Text> ):(
                        <Text color={COLORES.secundario}>
                            <Text bold color={COLORES.acento}>A</Text> abrir  ·  
                            <Text bold color={COLORES.acento}>  G</Text> guardar  ·  
                            <Text bold color={COLORES.acento}> Enter</Text> editar  ·  
                            <Text bold color={COLORES.acento}> &lt;</Text> ascendente  ·  
                            <Text bold color={COLORES.acento}> &gt;</Text> descendente  ·  
                            <Text bold color={COLORES.acento}> Esc</Text> salir  ·  
                        </Text>
                        )}
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