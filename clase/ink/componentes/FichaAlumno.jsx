import React from 'react'
import {Box, Text} from 'ink'
import {colores} from '../tema.js'

const Campo = ({etiqueta, valor}) => (
    <Box>
        <Box width={15} marginRight={1} flexShrink={0}>
            <Text color={colores.secundario}>{etiqueta}:</Text>
        </Box>
        <Box flexGrow={1} minWidth={0}>
            <Text color={colores.texto}>{valor || 'No informado'}</Text>
        </Box>
    </Box>
)

export const FichaAlumno = ({alumno}) => (
    <Box
        flexDirection="column"
        width={50}
        flexShrink={0}
        borderStyle="round"
        borderColor={colores.azul}
        backgroundColor={colores.fondo}
        paddingX={1}
    >
        <Box marginBottom={1}>
            <Text bold color={colores.azul}>Ficha del alumno</Text>
        </Box>
        <Campo etiqueta="Legajo" valor={alumno.legajo} />
        <Campo etiqueta="Apellido" valor={alumno.apellido} />
        <Campo etiqueta="Nombre" valor={alumno.nombre} />
        <Campo etiqueta="Comisión" valor={alumno.comision} />
        <Box flexDirection="column" marginTop={1}>
            <Campo etiqueta="Teléfono" valor={alumno.telefono} />
            <Campo etiqueta="Usuario GitHub" valor={alumno.github} />
            <Campo etiqueta="Estado GitHub" valor={alumno.estadoGithub} />
        </Box>
        <Box marginTop={1}>
            <Text color={colores.secundario}><Text bold color={colores.acento}>Enter / Esc</Text> volver</Text>
        </Box>
    </Box>
)

