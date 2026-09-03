"use strict";

const {
    cargarContactos,
    filtrarContactos,
    guardarContactos,
    nombreCompleto,
    siguienteId
} = require("./agenda-datos");

const CAMPOS = [
    ["nombre", "Nombre"],
    ["apellido", "Apellido"],
    ["telefono", "Teléfono"],
    ["email", "Email"]
];

let React;
let Box;
let Spacer;
let Text;
let TextInput;
let render;
let useApp;
let useInput;
let useState;
let useWindowSize;

function Panel({ titulo, activo, ancho, alto, children }) {
    return (
        <Box
            flexDirection="column"
            borderStyle="round"
            borderColor={activo ? "cyan" : "gray"}
            paddingX={1}
            width={ancho}
            height={alto}
            overflow="hidden"
        >
            <Text bold>{titulo}</Text>
            <Box marginTop={1} flexDirection="column">
                {children}
            </Box>
        </Box>
    );
}

function Lista({ contactos, indice, alto, activa }) {
    const cantidad = Math.max(1, alto - 4);
    const inicio = Math.max(0, Math.min(indice, contactos.length - cantidad));

    return (
        <Panel
            titulo={`CONTACTOS · ${contactos.length}`}
            activo={activa}
            ancho="40%"
            alto={alto}
        >
            {contactos.length === 0 ? (
                <Text dimColor>Sin resultados</Text>
            ) : contactos.slice(inicio, inicio + cantidad).map((contacto, posicion) => {
                const seleccionado = inicio + posicion === indice;

                return (
                    <Text key={contacto.id} bold={seleccionado} color={seleccionado ? "cyan" : undefined}>
                        {seleccionado ? "› " : "  "}{nombreCompleto(contacto)}
                    </Text>
                );
            })}
        </Panel>
    );
}

function Detalle({ contacto, alto, activo }) {
    return (
        <Panel titulo="DETALLE" activo={activo} ancho="60%" alto={alto}>
            {contacto ? CAMPOS.map(([clave, etiqueta]) => (
                <Box key={clave} marginBottom={1}>
                    <Box width={11}><Text dimColor>{etiqueta}</Text></Box>
                    <Text>{contacto[clave] || "—"}</Text>
                </Box>
            )) : (
                <Text dimColor>No hay un contacto seleccionado.</Text>
            )}
        </Panel>
    );
}

function Editor({ contacto, alto, onGuardar, onCancelar }) {
    const [valores, setValores] = useState({
        nombre: contacto?.nombre ?? "",
        apellido: contacto?.apellido ?? "",
        telefono: contacto?.telefono ?? "",
        email: contacto?.email ?? ""
    });
    const [campo, setCampo] = useState(0);
    const [error, setError] = useState("");

    function guardar() {
        const datos = Object.fromEntries(
            Object.entries(valores).map(([clave, valor]) => [clave, valor.trim()])
        );

        if (!datos.nombre || !datos.apellido) {
            setError("Nombre y apellido son obligatorios");
            setCampo(datos.nombre ? 1 : 0);
            return;
        }

        onGuardar(datos);
    }

    useInput((entrada, tecla) => {
        if (tecla.escape) {
            onCancelar();
        } else if (tecla.upArrow || (tecla.tab && tecla.shift)) {
            setCampo(actual => (actual + CAMPOS.length - 1) % CAMPOS.length);
        } else if (tecla.return && campo === CAMPOS.length - 1) {
            guardar();
        } else if (tecla.return || tecla.tab || tecla.downArrow) {
            setCampo(actual => (actual + 1) % CAMPOS.length);
        }
    });

    return (
        <Panel
            titulo={contacto ? "EDITAR CONTACTO" : "NUEVO CONTACTO"}
            activo
            ancho="60%"
            alto={alto}
        >
            {CAMPOS.map(([clave, etiqueta], indice) => (
                <Box key={clave} marginBottom={1}>
                    <Box width={2}><Text color="cyan">{indice === campo ? "›" : " "}</Text></Box>
                    <Box width={11}><Text dimColor={indice !== campo}>{etiqueta}</Text></Box>
                    {indice === campo ? (
                        <TextInput
                            value={valores[clave]}
                            onChange={valor => {
                                setValores({ ...valores, [clave]: valor });
                                setError("");
                            }}
                        />
                    ) : (
                        <Text>{valores[clave] || "—"}</Text>
                    )}
                </Box>
            ))}
            {error && <Text color="red">{error}</Text>}
        </Panel>
    );
}

function ConfirmarBorrado({ contacto, alto, onConfirmar, onCancelar }) {
    useInput((entrada, tecla) => {
        if (tecla.escape) {
            onCancelar();
        } else if (tecla.return) {
            onConfirmar();
        }
    });

    return (
        <Panel titulo="BORRAR CONTACTO" activo ancho="60%" alto={alto}>
            <Text>¿Eliminar a {nombreCompleto(contacto)}?</Text>
            <Text color="red">Esta acción no se puede deshacer.</Text>
            <Box marginTop={1}>
                <Text>Enter confirma · Esc cancela</Text>
            </Box>
        </Panel>
    );
}

function Agenda() {
    const { exit } = useApp();
    const { rows } = useWindowSize();
    const [contactos, setContactos] = useState(cargarContactos);
    const [consulta, setConsulta] = useState("");
    const [indice, setIndice] = useState(0);
    const [foco, setFoco] = useState("buscar");
    const [edicion, setEdicion] = useState(null);
    const [borrando, setBorrando] = useState(null);
    const [mensaje, setMensaje] = useState("");

    const resultados = filtrarContactos(contactos, consulta);
    const seleccionado = resultados[indice] ?? null;
    const alto = Math.max(12, rows - 9);
    const ocupado = edicion !== null || borrando !== null;

    function mover(cantidad) {
        setIndice(Math.max(0, Math.min(resultados.length - 1, indice + cantidad)));
    }

    function persistir(nuevos, texto) {
        try {
            guardarContactos(nuevos);
            setContactos(nuevos);
            setMensaje(texto);
            return true;
        } catch {
            setMensaje("No se pudo guardar agenda.json");
            return false;
        }
    }

    function guardar(datos) {
        const esNuevo = edicion.id === undefined;
        const contacto = esNuevo
            ? { id: siguienteId(contactos), ...datos }
            : { ...edicion, ...datos };
        const nuevos = esNuevo
            ? [...contactos, contacto]
            : contactos.map(actual => actual.id === contacto.id ? contacto : actual);

        if (!persistir(nuevos, esNuevo ? "Contacto creado" : "Contacto actualizado")) {
            return;
        }

        setConsulta("");
        setIndice(nuevos.findIndex(actual => actual.id === contacto.id));
        setEdicion(null);
        setFoco("lista");
    }

    function borrar() {
        const nuevos = contactos.filter(contacto => contacto.id !== borrando.id);

        if (!persistir(nuevos, "Contacto eliminado")) {
            return;
        }

        setIndice(0);
        setBorrando(null);
    }

    useInput((entrada, tecla) => {
        if (tecla.ctrl && entrada.toLowerCase() === "q") {
            exit();
        }
    });

    useInput((entrada, tecla) => {
        if (foco === "buscar") {
            if (tecla.return || tecla.tab) {
                setFoco("lista");
            } else if (tecla.escape) {
                setConsulta("");
                setIndice(0);
            }
            return;
        }

        if (tecla.escape || tecla.tab) {
            setFoco("buscar");
        } else if (tecla.upArrow) {
            mover(-1);
        } else if (tecla.downArrow) {
            mover(1);
        } else if (tecla.return || entrada.toLowerCase() === "e") {
            if (seleccionado) {
                setEdicion(seleccionado);
            }
        } else if (entrada.toLowerCase() === "n") {
            setEdicion({});
        } else if ((entrada.toLowerCase() === "d" || tecla.delete) && seleccionado) {
            setBorrando(seleccionado);
        } else if (entrada.toLowerCase() === "q") {
            exit();
        }
    }, { isActive: !ocupado });

    const detalle = borrando ? (
        <ConfirmarBorrado
            contacto={borrando}
            alto={alto}
            onConfirmar={borrar}
            onCancelar={() => setBorrando(null)}
        />
    ) : edicion ? (
        <Editor
            key={edicion.id ?? "nuevo"}
            contacto={edicion.id === undefined ? null : edicion}
            alto={alto}
            onGuardar={guardar}
            onCancelar={() => {
                setEdicion(null);
                setMensaje("Edición cancelada");
            }}
        />
    ) : (
        <Detalle contacto={seleccionado} alto={alto} activo={foco === "lista"} />
    );

    const ayuda = edicion
        ? "Enter/Tab siguiente · Esc cancelar"
        : borrando
            ? "Enter borrar · Esc cancelar"
            : foco === "buscar"
                ? "Escribí para buscar · Enter abre la lista"
                : "↑↓ elegir · Enter editar · N nuevo · D borrar · Esc buscar";

    return (
        <Box flexDirection="column" paddingX={1}>
            <Box marginBottom={1}>
                <Text bold color="cyan">AGENDA</Text>
                <Spacer />
                <Text dimColor>{contactos.length} contactos</Text>
            </Box>

            <Box
                borderStyle="round"
                borderColor={foco === "buscar" && !ocupado ? "cyan" : "gray"}
                paddingX={1}
                marginBottom={1}
            >
                <Text bold>Buscar: </Text>
                <TextInput
                    value={consulta}
                    focus={foco === "buscar" && !ocupado}
                    placeholder="nombre, teléfono o email"
                    onChange={valor => {
                        setConsulta(valor);
                        setIndice(0);
                    }}
                />
            </Box>

            <Box gap={1}>
                <Lista
                    contactos={resultados}
                    indice={indice}
                    alto={alto}
                    activa={foco === "lista" && !ocupado}
                />
                {detalle}
            </Box>

            <Box marginTop={1}>
                <Text>{mensaje}</Text>
                <Spacer />
                <Text dimColor>{ayuda}</Text>
            </Box>
        </Box>
    );
}

async function iniciar() {
    React = (await import("react")).default;
    const Ink = await import("ink");

    ({ Box, Spacer, Text, render, useApp, useInput, useWindowSize } = Ink);
    ({ useState } = React);
    TextInput = (await import("ink-text-input")).default;

    render(<Agenda />, { alternateScreen: true, exitOnCtrlC: false });
}

iniciar().catch(console.error);
