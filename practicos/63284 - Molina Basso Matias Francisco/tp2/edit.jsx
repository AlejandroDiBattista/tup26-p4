#!/usr/bin/env -S node --import tsx

import React from 'react';

import {render, Box, Text, useInput, useApp} from 'ink';

import {readFile, writeFile} from 'node:fs/promises';

import {TextInput} from '@inkjs/ui';

import {basename} from 'node:path';
import { error } from 'node:console';



// Desarrollar una aplicación de terminal con JavaScript, React e Ink que permita abrir, visualizar, editar, ordenar y guardar archivos CSV, tomando como referencia las siguientes pantallas:

//**Visualización:** mostrar los datos del archivo en una tabla y permitir navegar entre sus celdas.

//![Pantalla de visualización de los datos del CSV](mostrar.png)

//**Guardado:** al presionar **G**, solicitar el nombre del archivo donde se guardarán los datos.

//![Pantalla de guardado del archivo CSV](guardar.png)

//- Mostrar los datos en una tabla con cabecera y filas numeradas, el nombre del archivo y la cantidad de filas y columnas.

//- Si se ejecuta el comando con el nombre de un archivo CSV como argumento, abrirlo y mostrar sus datos directamente, sin volver a solicitar el nombre del archivo.

//- Navegar entre celdas con las flechas, resaltar la celda seleccionada y mostrar su valor y posición. Desplazar la vista cuando sea necesario.

//- Ordenar las filas por la columna seleccionada usando `<` para orden ascendente y `>` para orden descendente.

//- Implementar las acciones indicadas: **A** para abrir un archivo, **G** para guardar, **Enter** para editar la celda y **Esc** para cancelar una acción o salir.

//- Al usar **A** para abrir o **G** para guardar, pedir al usuario el nombre del archivo. Mostrar un mensaje si ocurre un error.

//Usaremos el **formato más simple posible de CSV**: primera línea con cabecera, campos separados por coma y un registro por línea, con igual cantidad de campos en todas las filas. Los campos no contendrán caracteres especiales: comas, comillas ni saltos de línea internos; no será necesario implementar escapes ni campos entrecomillados.

//> Nota:

// Para configurar el proyecto y poder ejecutarlo:

//```bash

//npm install

//npm install --global tsx

//npm link

//```

//Luego se puede ejecutar el editor como comando con:

//```bash

//edit empleados.csv

//```

//console.log(process.argv);

const COLUMNAS = process.stdout.columns || 80;

const FILAS = process.stdout.rows || 24;

const COLORES = {

    fondo: '#161310',

    borde: '#726b61',

    titulo: '#ede7db',

    secundario:'#ada79e',

    acento: '#edbb64',

};


let cabecera = [];

let filas = [];

let errorInicial = "";

if (process.argv[2]) {
    try {

        const lectura = await readFile(process.argv[2], "utf-8");   
        const lineas = lectura.split("\r\n").filter(linea => linea !== "");
        cabecera = lineas[0].split(",");
        filas = lineas.slice(1).map(linea => linea.split(","));
    } catch (error) {
        errorInicial = "No se pudo abrir el archivo";
    }
}


function App() {

    const [indiceFila, setIndiceFila] = React.useState(0);
    const [indiceColumna, setIndiceColumna] = React.useState(0);
    const [primeraFilaVisible, setPrimeraFilaVisible] = React.useState(0);
    const [estaEditando, setEstaEditando] = React.useState(false)
    const [textoEdicion, setTextoEdicion] = React.useState("");
    const [registros, setRegistros] = React.useState(filas)
    const [cabeceraActual, setCabeceraActual] = React.useState(cabecera)
    const [accion, setAccion] = React.useState("")
    const [error, setError] = React.useState(errorInicial)
    const [archivoActual, setArchivoActual] = React.useState(process.argv[2] || "")
    
    const {exit} = useApp();

    useInput((tecla, key) => {

        if (key.escape) {
            if (estaEditando) {
                setEstaEditando(false);
            }
            else if (accion !== "") {
                setAccion("")
                setError("")
            }
            else {
                 exit();
            }
        }
        else if (key.rightArrow && !estaEditando && accion === "") {
            setIndiceColumna(Math.min(indiceColumna + 1, cabeceraActual.length - 1));
        }
        else if (key.leftArrow && !estaEditando && accion === "") {
            setIndiceColumna(Math.max(indiceColumna - 1, 0));
        }
        else if (key.downArrow && !estaEditando && accion === "") {
            setIndiceFila(Math.min(indiceFila + 1, registros.length - 1));
            if (Math.min(indiceFila + 1, registros.length - 1) >=primeraFilaVisible + 5) {
                setPrimeraFilaVisible(primeraFilaVisible + 1)
            }
        }
        else if (key.upArrow && !estaEditando && accion === "") {
            setIndiceFila(Math.max(indiceFila - 1, 0));
         if (Math.max(indiceFila - 1, 0) < primeraFilaVisible) {
            setPrimeraFilaVisible(primeraFilaVisible- 1)
        }    
    }
    else if (tecla === "<" && !estaEditando && accion === "") {
    const copiaRegistros = [...registros]
    copiaRegistros.sort((a, b) => {
        if (a[indiceColumna] === "" && b[indiceColumna] !== "") {
            return 1
        }
        if (a[indiceColumna] !== "" && b[indiceColumna] === "") {
            return -1
        }
        if (a[indiceColumna] === "" && b[indiceColumna] === "") {
            return 0
        }
        if (!isNaN(Number(a[indiceColumna])) && !isNaN(Number(b[indiceColumna]))) {
            return Number(a[indiceColumna]) - Number(b[indiceColumna])
        } else {
            return a[indiceColumna].localeCompare(b[indiceColumna])
        }
    })
    setRegistros(copiaRegistros)
}
else if (tecla === ">" && !estaEditando && accion === "") {
    const copiaRegistros = [...registros]
    copiaRegistros.sort((a, b) => {
        if (a[indiceColumna] === "" && b[indiceColumna] !== "") {
            return 1
        }
        if (a[indiceColumna] !== "" && b[indiceColumna] === "") {
            return -1
        }
        if (a[indiceColumna] === "" && b[indiceColumna] === "") {
            return 0
        }
        if (!isNaN(Number(a[indiceColumna])) && !isNaN(Number(b[indiceColumna]))) {
            return Number(b[indiceColumna]) - Number(a[indiceColumna])
        } else {
            return b[indiceColumna].localeCompare(a[indiceColumna])
        }
    })
    setRegistros(copiaRegistros)
}
        else if ((tecla === "a" || tecla === "A") && !estaEditando && accion === "") {
            setAccion("abrir")
            setError("")
        }
        else if ((tecla === "g" || tecla === "G") && !estaEditando && accion === "") {
            setAccion("guardar")
            setError("")
        }
        else if (key.return && !estaEditando && accion === "") {
            if (registros.length > 0) {
            setEstaEditando(true)
            setTextoEdicion(registros[indiceFila][indiceColumna]);
        }
     }
    });

    return (
        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">
            <Box width={97} height={18} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
                <Box justifyContent="center" alignItems="center">
                    <Text bold color={COLORES.titulo}>Editor CSV</Text>
                </Box>
                <Box>
                    <Text color={COLORES.secundario}>Archivo: {archivoActual !== "" ? basename(archivoActual) : "Sin archivo"}</Text>
                </Box>
                <Box>
                    <Text color={COLORES.secundario}>Filas: {registros.length} Columnas: {cabeceraActual.length}</Text>
                </Box>
                <Box marginTop={1}>
                    <Box width={5}>
                        <Text bold color={COLORES.acento}>#</Text>
                    </Box>
                    {cabeceraActual.map((dato, indice) => (
                        <Box width={18} key={indice}>
                            <Text bold color={COLORES.acento}>{dato}</Text>
                        </Box>
                    ))}
                </Box>
                {registros.slice(primeraFilaVisible, primeraFilaVisible + 5).map((fila, indice) => (
                    <Box key={indice}>
                        <Box width={5}>
                            <Text color={COLORES.secundario}>{indice + 1 + primeraFilaVisible}</Text>
                        </Box>
                        {fila.map((dato, posicion) => (
                            <Box width={18} key={posicion}>
                                <Text color={indice + primeraFilaVisible === indiceFila && posicion === indiceColumna ? COLORES.acento : COLORES.titulo}>{dato}</Text>
                            </Box>
                        ))}
                    </Box>
                ))}
                <Box flexGrow={1}></Box>
         {registros.length > 0 && (

    <Text> Fila: {indiceFila + 1} Columna: {indiceColumna + 1} Valor: {registros[indiceFila][indiceColumna]}</Text>

)}
        {estaEditando && (
            <TextInput 
            defaultValue={textoEdicion} 
            onChange={setTextoEdicion} 
            onSubmit={(valor) => {
                const copiaRegistros = [...registros]
                const copiaFila = [...registros[indiceFila]]
                copiaFila[indiceColumna] = valor
                copiaRegistros[indiceFila] = copiaFila
                setRegistros(copiaRegistros)
                setEstaEditando(false)
            } }/>
        )}
        {accion === "abrir" && (
            <Box>
                <Text>Abrir: </Text>
                <TextInput
                    placeholder="Nombre del archivo"
                    onSubmit={async (valor) => {
                        try {
                            const lectura = await readFile(valor, "utf-8")
                            const lineas = lectura.split(/\r?\n/).filter(linea => linea !== "")
                            setCabeceraActual(lineas[0].split(","))
                            const nuevasFilas = lineas.slice(1).map(linea => linea.split(","))
                            setRegistros(nuevasFilas)
                            setIndiceFila(0)
                            setIndiceColumna(0)
                            setPrimeraFilaVisible(0)
                            setArchivoActual(valor)
                            setAccion("")
                            setError("")
                        }
                        catch (error) {
                            setError("No se pudo abrir el archivo")
                        }
                    }}
                />
            </Box>
        )}
        {accion === "guardar" && (
            <Box>
                <Text>Guardar: </Text>
                <TextInput
                    placeholder="Nombre del archivo"
                    onSubmit={async (valor) => {
                        try {
                            const contenido = [
                                cabeceraActual.join(","),
                                ...registros.map(fila => fila.join(","))
                            ].join("\r\n")
                            await writeFile(valor, contenido, "utf-8")
                            setArchivoActual(valor)
                            setAccion("")
                            setError("")
                        }
                        catch (error) {
                            setError("No se pudo guardar el archivo")
                        }
                    }}
                />
            </Box>
        )}
        {error !== "" && (
            <Text color="red">{error}</Text>
        )}
                <Text color={COLORES.secundario}>
                    <Text bold color={COLORES.acento}> A</Text> abrir
                    <Text bold color={COLORES.acento}> G</Text> guardar
                    <Text bold color={COLORES.acento}> Esc</Text> salir
                </Text>
            </Box>
        </Box>
    );
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();