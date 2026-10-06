import React from 'react'
import {readFile} from 'node:fs/promises'
import {render, Box, useWindowSize} from 'ink'
import {ListaAlumnos} from './componentes/ListaAlumnos.jsx'
import {FichaAlumno} from './componentes/FichaAlumno.jsx'
import {useExploradorAlumnos} from './hooks/useExploradorAlumnos.js'

// Leemos los datos una vez, antes de mostrar la aplicación.
const contenido = await readFile(new URL('./alumnos.json', import.meta.url), 'utf8')
const alumnos = JSON.parse(contenido)

function App() {
    const {rows, columns} = useWindowSize()
    const {busqueda, seleccionado, inicio, mostrarFicha, resultados, visibles} =
        useExploradorAlumnos(alumnos, rows)

    return (
        <Box width={columns} alignItems="flex-start" gap={1}>
            <ListaAlumnos
                total={alumnos.length}
                cantidad={resultados.length}
                visibles={visibles}
                inicio={inicio}
                seleccionado={seleccionado}
                busqueda={busqueda}
                mostrarFicha={mostrarFicha}
            />
            {mostrarFicha && <FichaAlumno alumno={resultados[seleccionado]} />}
        </Box>
    )
}

render(<App />, {incrementalRendering: true})
