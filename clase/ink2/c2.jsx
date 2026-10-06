import React, { useState } from "react";
import { readFile } from 'node:fs/promises'

import {render, Box, Text, useInput, useWindowSize, useApp} from "ink"

const colores = {
    fondo: "#14243D",
    texto: "#E8F1FF",
    azul: "#64B5FF",
    amarillo: "#FFD43B",
};

const Cabecera = ({ children }) => (
    <Box backgroundColor={colores.azul} paddingX={1} flexShrink={0}>
        <Text bold color={colores.fondo}>{children}</Text>
    </Box>
);

const CampoAlumno = ({ etiqueta, valor, anchoEtiqueta = 12 }) => (
    <Box>
        <Box width={anchoEtiqueta} flexShrink={0}>
            <Text dimColor color={colores.azul}>{etiqueta}:</Text>
        </Box>
        <Box flexGrow={1} flexBasis={0} minWidth={0}>
            <Text color={colores.texto}>{valor ?? "Sin datos"}</Text>
        </Box>
    </Box>
);

const Panel = ({ titulo, children }) => (
    <Box borderStyle="round" borderColor={colores.azul} width={50} maxWidth="100%" flexShrink={0} flexDirection="column" backgroundColor={colores.fondo} gap={1}>
        <Cabecera>{titulo.toUpperCase()}</Cabecera>
        <Box flexDirection="column">{children}</Box>
    </Box>
)

const alumnos = JSON.parse(await readFile(new URL("./alumnos.json", import.meta.url), "utf-8"))
const cantidad = 10

const ListaAlumnos = ({ inicio, seleccionado, mostrarFicha }) => (
    <Panel titulo="Alumnos">
        {alumnos.length === 0 && <Text color={colores.texto}> No hay alumnos para mostrar.</Text>}
        {alumnos.slice(inicio, inicio + cantidad).map((alumno, index) => (
            <FilaAlumno {...alumno} key={alumno.legajo} actual={inicio + index === seleccionado} />
        ))}
        <Box flexDirection="column" marginTop={1} gap={1}>
            {mostrarFicha ? (
                <Text color={colores.azul}> Esc <Text color={colores.texto}>Volver a navegar</Text></Text>
            ) : (
                <Text color={colores.azul}> ↑/↓ <Text color={colores.texto}>Seleccionar</Text>   Enter <Text color={colores.texto}>Ver ficha</Text></Text>
            )}
            <Text color={colores.azul}> {mostrarFicha ? "Ctrl+C" : "Esc / Ctrl+C"} <Text color={colores.texto}>Salir</Text></Text>
        </Box>
    </Panel>
)

const FilaAlumno = ({legajo, nombre, apellido, actual = false}) => (
    <Box width="100%" backgroundColor={actual ? colores.amarillo : colores.fondo} flexShrink={0}>
        <Box width={3} flexShrink={0}>
            <Text color={actual ? colores.fondo : colores.texto}>{actual ? " › " : "   "}</Text>
        </Box>
        <Box width={8} flexShrink={0}>
            <Text color={actual ? colores.fondo : colores.azul}>{legajo}</Text>
        </Box>
        <Box flexGrow={1} flexBasis={0} minWidth={0}>
            <Text bold={actual} color={actual ? colores.fondo : colores.texto} wrap="truncate">
                {nombre} {apellido}
            </Text>
        </Box>
    </Box>
)

const campos = [
    ["legajo", "Legajo"],
    ["nombre", "Nombre"],
    ["apellido", "Apellido"],
    ["comision", "Comisión"],
    ["telefono", "Teléfono"],
    ["github", "GitHub"],
    ["estadoGithub", "Estado GH"],
]

const FichaAlumno = ({ alumno }) => (
    <Panel titulo="Ficha del alumno">
        {campos.map(([campo, etiqueta]) => (
            <CampoAlumno key={campo} etiqueta={etiqueta} valor={alumno[campo]} />
        ))}
    </Panel>
)

const App = () => {
    const { exit } = useApp()
    const { columns } = useWindowSize()
    const [inicio, setInicio] = useState(0)
    const [seleccionado, setSeleccionado] = useState(0)
    const [mostrarFicha, setMostrarFicha] = useState(false)

    useInput( (input, key) => {
        if (mostrarFicha) {
            if (key.escape) setMostrarFicha(false)
            return
        }
        if (key.escape) {
            exit()
            return
        }
        if (key.return) {
            setMostrarFicha(alumnos.length > 0)
            return
        }
        if (!key.upArrow && !key.downArrow) return

        const cambio = key.downArrow ? 1 : -1
        const actual = Math.max(0, Math.min(alumnos.length - 1, seleccionado + cambio))
        setSeleccionado(actual)
        if (actual < inicio) setInicio(actual)
        if (actual >= inicio + cantidad) setInicio(actual - cantidad + 1)
    })

    return (
        <Box width={columns} flexDirection={columns >= 101 ? "row" : "column"} alignItems="flex-start" gap={1}>
            <ListaAlumnos inicio={inicio} seleccionado={seleccionado} mostrarFicha={mostrarFicha} />
            {mostrarFicha && <FichaAlumno alumno={alumnos[seleccionado]} />}
        </Box>
    )
}

render(<App />)
