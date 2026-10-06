import React from 'react'
import {Box, Text} from 'ink'
import {colores} from '../tema.js'

import {Buscar} from './Buscar.jsx'
import {FilaAlumno} from './FilaAlumno.jsx'

const PieLista = ({cantidad, seleccionado, mostrarFicha}) => (
    <Box flexDirection="column" marginTop={1} paddingX={1}>
        {!mostrarFicha && (
            <Text color={colores.acento}>
                {cantidad > 0 ? '↑↓ mover · Enter ficha · Ctrl+U limpiar' : 'Ctrl+U limpiar'}
            </Text>
        )}
        <Box justifyContent="space-between">
            <Text color={colores.secundario}>
                {cantidad === 0 ? '0 resultados' : `${seleccionado + 1} de ${cantidad}`}
            </Text>
            <Text color={colores.acento}>{mostrarFicha ? 'Ctrl+C salir' : 'Esc salir'}</Text>
        </Box>
    </Box>
)

export const ListaAlumnos = ({
    total,
    cantidad,
    visibles,
    inicio,
    seleccionado,
    busqueda,
    mostrarFicha
}) => (
    <Box
        flexDirection="column"
        width={50}
        flexShrink={0}
        borderStyle="round"
        borderColor={mostrarFicha ? colores.borde : colores.azul}
        backgroundColor={colores.fondo}
    >
        <Box marginBottom={1} paddingX={1} justifyContent="space-between">
            <Text bold color={colores.azul}>Alumnos</Text>
            <Text color={colores.secundario}>{total} {total === 1 ? 'alumno' : 'alumnos'}</Text>
        </Box>
        <Buscar busqueda={busqueda} mostrarFicha={mostrarFicha} />
        {visibles.map((alumno, indice) => (
            <FilaAlumno
                key={alumno.legajo}
                alumno={alumno}
                activo={inicio + indice === seleccionado}
            />
        ))}
        {total > 0 && cantidad === 0 && (
            <Box flexDirection="column" paddingX={1}>
                <Text color={colores.texto}>No hay coincidencias.</Text>
            </Box>
        )}
        {total === 0 && (
            <Box flexDirection="column" paddingX={1}>
                <Text color={colores.texto}>Todavía no hay alumnos.</Text>
                <Text color={colores.secundario}>Agregá alumnos a alumnos.json y reiniciá.</Text>
            </Box>
        )}
        <PieLista cantidad={cantidad} seleccionado={seleccionado} mostrarFicha={mostrarFicha} />
    </Box>
)
