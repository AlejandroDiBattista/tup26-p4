import React from 'react'
import {Box, Text} from 'ink'
import {colores} from '../tema.js'

export const Buscar = ({busqueda, mostrarFicha}) => (
    <Box flexDirection="column" paddingX={1} marginBottom={1}>
        <Box>
            <Text bold color={colores.azul}>Buscar: </Text>
            <Box flexGrow={1} minWidth={0}>
                <Text color={busqueda ? colores.texto : colores.secundario} wrap="truncate-start">
                    {busqueda || 'Escribí…'}{!mostrarFicha && <Text inverse> </Text>}
                </Text>
            </Box>
        </Box>
    </Box>
)
