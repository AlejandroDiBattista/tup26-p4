#!/usr/bin/env -S node --import tsx

import React from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';


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

try {

    const lectura = await readFile(process.argv[2], "utf-8");   

    //console.log(lectura);  

    const lineas = lectura.split("\r\n").filter(linea => linea !== "");

    //console.log(lineas[0]);

    cabecera = lineas[0].split(",");

    filas = lineas.slice(1).map(linea => linea.split(","));

    //console.log(filas);

} catch (error) {

    //console.log("No se pudo leer el archivo");

}

function App() {

    const {exit} = useApp();

    useInput((tecla, key) => {

        if (key.escape) {

            exit();

        }

    })

    return (

        <Box width={COLUMNAS} height={FILAS} justifyContent="center" alignItems="center">

            <Box width={97} height={18} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>

                <Box justifyContent="center" alignItems="center">

                    <Text bold color={COLORES.titulo}>Editor CSV</Text>

                </Box>

                <Box>

                    <Text color={COLORES.secundario}>Archivo: {basename(process.argv[2])}</Text>

                </Box>

                <Box>

                    <Text color={COLORES.secundario}>Filas: {filas.length} Columnas: {cabecera.length}</Text>

                </Box>

                <Box marginTop={1}>

                    <Box width={5}>

                        <Text bold color={COLORES.acento}>#</Text>

                    </Box>

                    {cabecera.map((dato, indice) => (

                        <Box width={18} key={indice}>

                            <Text bold color={COLORES.acento}>{dato}</Text>

                        </Box>

                    ))}

                </Box>


                {filas.slice(0,5).map((fila, indice) => (

                    <Box key={indice}>

                        <Box width={5}>

                            <Text color={COLORES.secundario}>{indice + 1}</Text>

                        </Box>

                        {fila.map((dato, posicion) => (

                            <Box width={18} key={posicion}>

                                <Text color={COLORES.titulo}>{dato}</Text>

                            </Box>

                        ))}

                    </Box>

                ))}

                <Box flexGrow={1}></Box>

                <Text color={COLORES.secundario}><Text bold color={COLORES.acento}> Esc</Text> salir</Text>

            </Box>

        </Box>

    );

}

const app = render(<App />);

await app.waitUntilExit();

console.clear();