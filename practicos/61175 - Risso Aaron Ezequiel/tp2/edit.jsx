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

function ordenarFilas (row,indiceC,desc){
    const valor = row.map(fila => fila[indiceC]);
    const tipodato = valor.every(valor => !isNaN(Number(valor)));

    return row.slice().sort((a,b)=>{
        const valorA = a[indiceC];
        const valorB = b[indiceC];
        let compara;

        if(tipodato){
            compara = Number(valorA) - Number(valorB);
        }
        else{
            compara = valorA.localeCompare(valorB);
        }

        return desc ? -compara : compara;
    });

    
}

function serialize(header, rows, delimiter) {
    const tablaff = header !== null ? [header, ...rows] : rows;
    return tablaff.map(row => row.join(delimiter)).join("\n");
}

function App() {
    const {exit} = useApp();
    const [contenido, setContenido] = useState({header: [], rows: []});
    const anchos = calcularAnchos(contenido.header,contenido.rows);
    const [posicionC, setPosicionC] = useState(0);
    const [posicionF, setPosicionF] = useState(0);
    const [estado, setEstado] = useState("tabla");
    const [editar, setEditar] = useState("");
    const [guardar, setGuardar] = useState("");
    const [nombre, setNombre] = useState("");
    const asc = "<";
    const des = ">";

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

    const VentanaLimite = 13;
    const valorInicial = Math.max(0, Math.min(posicionF -VentanaLimite +1, contenido.rows.length - VentanaLimite));
    const posicionVer = contenido.rows.slice(valorInicial,valorInicial+VentanaLimite);
    
    useInput((tecla, key) => {
        if (estado === "tabla") {
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
        if (tecla === "<" || tecla === "*"){
            setContenido({...contenido, rows: ordenarFilas(contenido.rows, posicionC, false)});
        }
        if (tecla === ">" || tecla === "¿"){
            setContenido({...contenido, rows: ordenarFilas(contenido.rows, posicionC, true)});
        } 
        if(tecla === "a" || tecla === "A"){
            setEstado("abrir");
        }
        else if(estado === "abrir"){
            if(key.escape){
                setEstado("tabla");
            }
        }    
        if (key.return) {
            setEditar(contenido.rows[posicionF][posicionC]);
            setEstado("editar")
        }
        }
        else if(estado === "editar"){
            if(key.escape){
            setEstado("tabla");
            }

            if (key.backspace){
                setEditar(editar.slice(0,-1));
            }

            else if(key.return){
                const confirmar = contenido.rows.map((fila, indiceF) => {
                if(indiceF !== posicionF){
                    return fila;
                }
                return fila.map((campo, indiceC) =>{
                    if(indiceC === posicionC){
                        return editar;
                    }
                    return campo;
                });
              });
              setContenido({...contenido, rows:confirmar});
              setEstado("tabla");
            }
            else if (tecla){
                setEditar(editar + tecla);
            }
            }
            if(tecla === "g" || tecla === "G"){
            setEstado("guardar")
            }
            else if(estado === "guardar"){
                if(key.escape){
                setEstado("tabla");
            }
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
                 {posicionVer.map((fila, indiceF) => (
                   <Box key={indiceF}>
                    <Box width={4} marginRight={1}>
                        <Text> {valorInicial + indiceF + 1} </Text>
                    </Box>
                    {fila.map((campo, indiceC) => {
                        const posicionA = indiceC === posicionC && valorInicial + indiceF === posicionF;
                        return (
                     <Box backgroundColor={indiceC === posicionC && valorInicial + indiceF === posicionF ? "white": undefined} 
                     key={indiceC} width={anchos[indiceC]} marginRight={1}>
                        <Text>{posicionA && estado === "editar" ? editar : campo}</Text>
                     </Box>)})}
                   </Box>
                 ))}
             </Box>
                <Box flexDirection="row" justifyContent="space-between">
                    {estado === "guardar" ? (
                      <Box>
                       <Text color={COLORES.acento}>Guardar como: </Text>
                       <TextInput value={guardar} onChange={setGuardar} 
                        onSubmit={async (valor) => {
                        const datos = serialize(contenido.header, contenido.rows, ",");
                        await writeFile(valor, datos, "utf-8");
                        setEstado("tabla");}}></TextInput>
                      </Box>
                    ) : estado === "abrir" ? (
                      <Box>
                        <Text color={COLORES.acento}>Abrir archivo: </Text>
                        <TextInput value={nombre} onChange={setNombre} 
                        onSubmit={async (valor) => {
                        const datos = await readFile(valor, "utf-8");
                        setContenido(parseDelimited(datos));
                        setEstado("tabla");}}></TextInput>
                      </Box>   
                    ) : (
                       <>
                        <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>
                        <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> A</Text> Abrir</Text>
                        <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> G</Text> Guardar</Text>
                        <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> {asc}</Text> asc</Text>
                        <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> {des}</Text> desc</Text>
                        <Text bold color={COLORES.secundario}>{NombreArc}</Text>
                       </>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();