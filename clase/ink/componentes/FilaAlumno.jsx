import React from 'react'
import {Box, Text} from 'ink'
import {colores} from '../tema.js'

export const FilaAlumno = ({alumno, activo}) => (
    <Box width="100%" paddingRight={1} backgroundColor={activo ? colores.azul : colores.fondo}>
        <Box width={2} flexShrink={0}>
            <Text color={activo ? colores.fondo : colores.texto}>{activo ? '›' : ' '}</Text>
        </Box>
        <Box width={7} flexShrink={0}>
            <Text color={activo ? colores.fondo : colores.secundario}>{alumno.legajo}</Text>
        </Box>
        <Box flexGrow={1} minWidth={0}>
            <Text bold={activo} color={activo ? colores.fondo : colores.texto} wrap="truncate-end">
                {alumno.apellido}, {alumno.nombre}
            </Text>
        </Box>
        <Box width={4} flexShrink={0} justifyContent="flex-end">
            <Text color={activo ? colores.fondo : colores.secundario}>{alumno.comision}</Text>
        </Box>
    </Box>
)
