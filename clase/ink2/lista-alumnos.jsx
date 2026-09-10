import React, { useState } from "react";
import { readFile } from "node:fs/promises";
import { render, Text, Box, useInput, useWindowSize } from "ink";

const colores = {
    fondo: "#14243D",
    superficie: "#1D3554",
    texto: "#E8F1FF",
    azul: "#64B5FF",
    amarillo: "#FFD43B",
    textoSeleccion: "#14243D",
};

const FilaAlumno = ({ nombre, apellido, legajo, actual }) => (
    <Box backgroundColor={actual ? colores.amarillo : undefined} flexShrink={0}>
        <Text bold={actual} wrap="truncate" color={actual ? colores.textoSeleccion : colores.texto}>
            {actual ? " › " : "   "}{legajo} · {apellido}, {nombre}
        </Text>
    </Box>
);

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


const alumnos = JSON.parse( await readFile("./alumnos.json", "utf8") );

const Panel = ({ columnas = 1, color, children }) => {
    return (
        <Box borderColor={color} flexGrow={columnas} flexBasis={0} minWidth={0} height="100%" flexDirection="column" borderStyle="round">
            {children}
        </Box>
    );
};

const FichaAlumno = ({ alumno }) => {
    if (!alumno) return (
        <Box paddingX={2} paddingY={1} flexDirection="column">
            <Text bold color={colores.texto}>No hay alumnos para mostrar.</Text>
            <Text color={colores.azul}>Agregá alumnos a alumnos.json y reiniciá la aplicación.</Text>
        </Box>
    );

    return (
        <Box borderStyle="round" borderColor={colores.azul} backgroundColor={colores.superficie} paddingX={2} paddingY={1} flexDirection="column">
            <Cabecera>ALUMNO SELECCIONADO</Cabecera>
            <Text bold color={colores.texto}>{alumno.apellido}</Text>
            <Text color={colores.texto}>{alumno.nombre}</Text>
            <Box marginTop={1} flexDirection="column">
                <CampoAlumno etiqueta="Legajo" valor={alumno.legajo} />
                <CampoAlumno etiqueta="Comisión" valor={alumno.comision} />
            </Box>
            <Box marginTop={1} flexDirection="column">
                <Text bold color={colores.amarillo}>CONTACTO Y GITHUB</Text>
                <CampoAlumno etiqueta="Teléfono" valor={alumno.telefono} />
                <CampoAlumno etiqueta="Usuario GitHub" valor={alumno.github} />
                <CampoAlumno etiqueta="Estado GitHub" valor={alumno.estadoGithub} />
            </Box>
        </Box>
    );
};

function App({alumnos}) {
    const { columns, rows } = useWindowSize();

    const [seleccionado, setSeleccionado] = useState(0);
    const [inicio, setInicio] = useState(0);
    const alto = Math.max(3, rows - 4);
    const visibles = Math.max(1, alto - 4);

    // Si se achica la terminal, mantener visible al seleccionado.
    if (seleccionado >= inicio + visibles) {
        setInicio(seleccionado - visibles + 1);
    }

    useInput((input, key) => {
        let siguiente = seleccionado;
        if (key.upArrow && seleccionado > 0) siguiente--;
        if (key.downArrow && seleccionado < alumnos.length - 1) siguiente++;
        setSeleccionado(siguiente);

        if (siguiente < inicio) setInicio(siguiente);
        if (siguiente >= inicio + visibles) setInicio(siguiente - visibles + 1);
    });

    return (
        <Box width={columns} flexDirection="column" backgroundColor={colores.fondo}>
            <Box backgroundColor={colores.amarillo} paddingX={1} marginBottom={1} justifyContent="space-between">
                <Text bold color={colores.fondo}>ALUMNOS / TUP</Text>
                <Text bold color={colores.fondo}>{alumnos.length} {alumnos.length === 1 ? "alumno" : "alumnos"}</Text>
            </Box>
            <Box height={alto}>
                <Panel columnas={1} color={colores.azul}>
                    <Cabecera>LISTA DE ALUMNOS</Cabecera>
                    <Box flexGrow={1} flexDirection="column">
                        {alumnos.slice(inicio, inicio + visibles).map((alumno, index) => (
                            <FilaAlumno key={alumno.legajo} {...alumno} actual={inicio + index === seleccionado} />
                        ))}
                    </Box>
                    <Text dimColor color={colores.azul}> {alumnos.length ? `Alumno ${seleccionado + 1} de ${alumnos.length}` : "Lista vacía"}</Text>
                </Panel>
                <Box flexGrow={2} flexBasis={0} minWidth={0} paddingLeft={1} flexDirection="column">
                    <FichaAlumno alumno={alumnos[seleccionado]} />
                </Box>
            </Box>
            <Text color={colores.azul}> ↑/↓ <Text dimColor color={colores.texto}>Cambiar alumno y ver su ficha</Text>   Ctrl+C <Text dimColor color={colores.texto}>Salir</Text></Text>
        </Box>
    );
}

render(<App alumnos={alumnos}/>);

// .js -> .jsx
