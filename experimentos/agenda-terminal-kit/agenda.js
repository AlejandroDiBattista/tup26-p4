#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const termkit = require("terminal-kit");

const term = termkit.terminal;
const { Button, ColumnMenu, Form, LabeledInput, Text, Window } = termkit;

const DB_FILE = path.join(__dirname, "agenda.json");
const APELLIDOS_POR_DEFECTO = ["Pérez", "Gómez", "López", "García", "Sosa"];
const TEMA = {
    titulo: { color: "brightCyan", bold: true },
    texto: { color: "white" },
    secundario: { color: "gray" },
    etiqueta: { color: "gray", bold: true },
    entrada: { color: "white", bgColor: "default" },
    entradaVacia: { color: "gray", bgColor: "default" },
    fila: { color: "white", bgColor: "default" },
    filaActiva: { color: "black", bgColor: "brightCyan", bold: true },
    boton: { color: "brightWhite", bgColor: "brightBlack" },
    botonActivo: { color: "black", bgColor: "brightCyan", bold: true },
    peligro: { color: "brightRed", bgColor: "default", bold: true },
    peligroActivo: { color: "white", bgColor: "red", bold: true },
    exito: { color: "brightGreen", bold: true },
    advertencia: { color: "brightYellow", bold: true }
};

let contactos = cargarContactos();
let siguienteId = contactos.length
    ? Math.max(...contactos.map(contacto => Number(contacto.id) || 0)) + 1
    : 1;
let consulta = "";
let resultados = [];
let contactoSeleccionadoId = contactos[0]?.id ?? null;
let mensajeEstado = "Listo para buscar";
let document;
let elementosPrincipales = [];
let entradaBusqueda;
let ventanaLista;
let menuContactos;
let textoDetalle;
let botonNuevo;
let botonEditar;
let botonBorrar;
let textoEstado;
let modalActivo = null;
let redimensionPendiente = false;

function completarContacto(contacto, indice) {
    const partes = String(contacto.nombre ?? "").trim().split(/\s+/).filter(Boolean);
    const nombre = partes.shift() || "Sin nombre";
    const apellido = String(contacto.apellido ?? "").trim()
        || partes.join(" ")
        || APELLIDOS_POR_DEFECTO[indice % APELLIDOS_POR_DEFECTO.length];

    return { ...contacto, nombre, apellido };
}

function cargarContactos() {
    if (!fs.existsSync(DB_FILE)) {
        return [
            {
                id: 1,
                nombre: "Ana",
                apellido: "Pérez",
                telefono: "3815551111",
                email: "ana@gmail.com"
            },
            {
                id: 2,
                nombre: "Carlos",
                apellido: "Gómez",
                telefono: "3814442222",
                email: "carlos@empresa.com"
            },
            {
                id: 3,
                nombre: "María",
                apellido: "López",
                telefono: "3814333333",
                email: "maria@hotmail.com"
            }
        ];
    }

    try {
        const datos = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
        return Array.isArray(datos) ? datos.map(completarContacto) : [];
    } catch {
        return [];
    }
}

function guardarContactos() {
    fs.writeFileSync(DB_FILE, JSON.stringify(contactos, null, 2), "utf8");
}

function nombreCompleto(contacto) {
    return `${contacto.nombre} ${contacto.apellido}`.trim();
}

function normalizar(texto) {
    return String(texto ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}

function buscarContactos(textoBusqueda) {
    const palabras = normalizar(textoBusqueda).trim().split(/\s+/).filter(Boolean);

    if (!palabras.length) {
        return contactos;
    }

    return contactos.filter(contacto => {
        const texto = normalizar(
            `${nombreCompleto(contacto)} ${contacto.telefono} ${contacto.email}`
        );

        return palabras.every(palabra => texto.includes(palabra));
    });
}

function recortar(texto, ancho) {
    const valor = String(texto ?? "");

    if (ancho <= 0) {
        return "";
    }

    if (valor.length <= ancho) {
        return valor;
    }

    return ancho === 1 ? "…" : `${valor.slice(0, ancho - 1)}…`;
}

function completarAncho(texto, ancho) {
    return recortar(texto, ancho).padEnd(Math.max(0, ancho));
}

function obtenerContactoSeleccionado() {
    return resultados.find(contacto => contacto.id === contactoSeleccionadoId) ?? null;
}

function obtenerLayout() {
    const ancho = term.width || 80;
    const alto = term.height || 24;
    const anchoDisponible = ancho - 2;
    const anchoLista = Math.max(26, Math.floor((anchoDisponible - 1) * 0.4));
    const anchoDetalle = anchoDisponible - anchoLista - 1;
    const yPaneles = 5;
    const altoPaneles = Math.max(11, alto - yPaneles - 3);

    return {
        ancho,
        alto,
        busqueda: { x: 1, y: 2, ancho: anchoDisponible, alto: 3 },
        lista: { x: 1, y: yPaneles, ancho: anchoLista, alto: altoPaneles },
        detalle: {
            x: 1 + anchoLista + 1,
            y: yPaneles,
            ancho: anchoDetalle,
            alto: altoPaneles
        },
        estadoY: alto - 3,
        ayudaY: alto - 2
    };
}

function crearTexto(opciones) {
    return new Text({
        parent: opciones.parent ?? document,
        x: opciones.x,
        y: opciones.y,
        width: opciones.width,
        height: opciones.height ?? 1,
        content: opciones.content ?? "",
        attr: opciones.attr ?? TEMA.texto
    });
}

function crearBoton(opciones) {
    return new Button({
        parent: opciones.parent,
        x: opciones.x,
        y: opciones.y,
        content: ` ${opciones.texto} `,
        value: opciones.valor,
        blurAttr: opciones.peligro ? TEMA.peligro : TEMA.boton,
        focusAttr: opciones.peligro ? TEMA.peligroActivo : TEMA.botonActivo,
        disabledAttr: TEMA.secundario
    });
}

function destruirElementosPrincipales() {
    for (const elemento of elementosPrincipales) {
        if (elemento && !elemento.destroyed) {
            elemento.destroyNoRedraw();
        }
    }

    elementosPrincipales = [];
}

function construirInterfaz() {
    destruirElementosPrincipales();

    const layout = obtenerLayout();

    if (layout.ancho < 68 || layout.alto < 20) {
        const aviso = new Window({
            parent: document,
            x: 1,
            y: 1,
            width: Math.max(20, layout.ancho - 2),
            height: 7,
            title: "AGENDA",
            frameChars: "lightRounded",
            movable: false
        });

        crearTexto({
            parent: aviso,
            x: 1,
            y: 1,
            width: Math.max(16, layout.ancho - 6),
            height: 3,
            content: [
                "La terminal es demasiado pequeña.",
                "Usá al menos 68 columnas por 20 filas.",
                "Q: salir"
            ],
            attr: TEMA.advertencia
        });
        elementosPrincipales.push(aviso);
        document.draw();
        return;
    }

    const encabezado = crearTexto({
        x: 2,
        y: 0,
        width: layout.ancho - 4,
        content: "AGENDA  ·  contactos",
        attr: TEMA.titulo
    });
    const ventanaBusqueda = new Window({
        parent: document,
        x: layout.busqueda.x,
        y: layout.busqueda.y,
        width: layout.busqueda.ancho,
        height: layout.busqueda.alto,
        title: "BÚSQUEDA",
        frameChars: "lightRounded",
        movable: false,
        disabled: true
    });

    entradaBusqueda = new LabeledInput({
        parent: ventanaBusqueda,
        x: 1,
        y: 0,
        width: layout.busqueda.ancho - 4,
        label: "Buscar: ",
        content: consulta,
        labelFocusAttr: TEMA.titulo,
        labelBlurAttr: TEMA.etiqueta,
        textAttr: TEMA.entrada,
        voidAttr: TEMA.entradaVacia
    });
    ventanaLista = new Window({
        parent: document,
        x: layout.lista.x,
        y: layout.lista.y,
        width: layout.lista.ancho,
        height: layout.lista.alto,
        title: "CONTACTOS",
        frameChars: "lightRounded",
        movable: false,
        disabled: true
    });

    const ventanaDetalle = new Window({
        parent: document,
        x: layout.detalle.x,
        y: layout.detalle.y,
        width: layout.detalle.ancho,
        height: layout.detalle.alto,
        title: "DETALLE DEL CONTACTO",
        frameChars: "lightRounded",
        movable: false,
        disabled: true
    });

    textoDetalle = crearTexto({
        parent: ventanaDetalle,
        x: 2,
        y: 1,
        width: layout.detalle.ancho - 6,
        height: 7,
        attr: TEMA.texto
    });

    const yBotones = Math.max(8, layout.detalle.alto - 5);
    botonNuevo = crearBoton({
        parent: ventanaDetalle,
        x: 2,
        y: yBotones,
        texto: "Nuevo",
        valor: "nuevo"
    });
    botonEditar = crearBoton({
        parent: ventanaDetalle,
        x: 12,
        y: yBotones,
        texto: "Editar",
        valor: "editar"
    });
    botonBorrar = crearBoton({
        parent: ventanaDetalle,
        x: 23,
        y: yBotones,
        texto: "Borrar",
        valor: "borrar",
        peligro: true
    });

    textoEstado = crearTexto({
        x: 2,
        y: layout.estadoY,
        width: layout.ancho - 4,
        content: mensajeEstado,
        attr: TEMA.exito
    });
    const ayuda = crearTexto({
        x: 2,
        y: layout.ayudaY,
        width: layout.ancho - 4,
        content: "Ratón o Tab para moverse  ·  Enter para elegir  ·  Ctrl+Q para salir",
        attr: TEMA.secundario
    });

    elementosPrincipales.push(
        encabezado,
        ventanaBusqueda,
        ventanaLista,
        ventanaDetalle,
        textoEstado,
        ayuda
    );

    entradaBusqueda.input.on("change", actualizarBusqueda);
    entradaBusqueda.on("focus", devolverFocoAlModal);
    botonNuevo.on("blinked", () => {
        if (!modalActivo) {
            abrirFormulario();
        }
    });
    botonEditar.on("blinked", () => {
        const contacto = obtenerContactoSeleccionado();

        if (!modalActivo && contacto) {
            abrirFormulario(contacto);
        }
    });
    botonBorrar.on("blinked", () => {
        const contacto = obtenerContactoSeleccionado();

        if (!modalActivo && contacto) {
            abrirConfirmacionBorrado(contacto);
        }
    });

    actualizarBusqueda();
    document.draw();
}

function devolverFocoAlModal(tieneFoco) {
    if (tieneFoco && modalActivo) {
        process.nextTick(enfocarModal);
    }
}

function actualizarBusqueda() {
    if (!entradaBusqueda || entradaBusqueda.destroyed) {
        return;
    }

    consulta = entradaBusqueda.getValue();
    resultados = buscarContactos(consulta);

    if (!resultados.some(contacto => contacto.id === contactoSeleccionadoId)) {
        contactoSeleccionadoId = resultados[0]?.id ?? null;
    }

    mensajeEstado = resultados.length === 1
        ? "1 contacto encontrado"
        : `${resultados.length} contactos encontrados`;
    reconstruirMenuContactos();
    actualizarDetalle();
    actualizarEstado();
}

function reconstruirMenuContactos() {
    if (menuContactos && !menuContactos.destroyed) {
        menuContactos.destroyNoRedraw();
    }

    const ancho = Math.max(12, ventanaLista.inputWidth - 2);
    const alto = Math.max(1, ventanaLista.inputHeight - 2);
    const items = resultados.length
        ? resultados.map(contacto => ({
            content: crearFilaContacto(contacto, ancho),
            value: contacto.id
        }))
        : [{
            content: completarAncho("Sin resultados", ancho),
            value: null,
            disabled: true
        }];

    ventanaLista.setContent(`CONTACTOS · ${resultados.length}`, false, true);
    menuContactos = new ColumnMenu({
        parent: ventanaLista,
        x: 1,
        y: 1,
        width: ancho,
        maxHeight: alto,
        items,
        buttonBlurAttr: TEMA.fila,
        buttonEvenBlurAttr: TEMA.fila,
        buttonFocusAttr: TEMA.filaActiva,
        buttonDisabledAttr: TEMA.secundario,
        leftPadding: "",
        rightPadding: ""
    });
    menuContactos.disabled = true;

    menuContactos.on("itemFocus", (id, tieneFoco) => {
        if (modalActivo) {
            devolverFocoAlModal(tieneFoco);
            return;
        }

        if (tieneFoco && id !== null) {
            contactoSeleccionadoId = id;
            actualizarDetalle();
        }
    });
    menuContactos.on("submit", id => {
        if (!modalActivo && id !== null) {
            contactoSeleccionadoId = id;
            actualizarDetalle();
        }
    });
}

function crearFilaContacto(contacto, ancho) {
    if (ancho < 24) {
        return completarAncho(nombreCompleto(contacto), ancho);
    }

    const anchoTelefono = Math.min(12, String(contacto.telefono ?? "").length);
    const anchoNombre = Math.max(8, ancho - anchoTelefono - 1);
    const nombre = completarAncho(nombreCompleto(contacto), anchoNombre);
    const telefono = completarAncho(contacto.telefono, anchoTelefono);

    return `${nombre} ${telefono}`;
}

function actualizarDetalle() {
    if (!textoDetalle || textoDetalle.destroyed) {
        return;
    }

    const contacto = obtenerContactoSeleccionado();

    if (!contacto) {
        textoDetalle.setContent([
            "No hay un contacto seleccionado.",
            "",
            "Podés crear uno con el botón Nuevo."
        ]);
    } else {
        textoDetalle.setContent([
            `ID:        ${contacto.id}`,
            "",
            `Nombre:    ${contacto.nombre}`,
            `Apellido:  ${contacto.apellido}`,
            `Teléfono:  ${contacto.telefono}`,
            `Email:     ${contacto.email}`
        ]);
    }

    const deshabilitado = !contacto || Boolean(modalActivo);
    establecerBotonDeshabilitado(botonEditar, deshabilitado);
    establecerBotonDeshabilitado(botonBorrar, deshabilitado);
}

function actualizarEstado(atributo = TEMA.exito) {
    if (!textoEstado || textoEstado.destroyed) {
        return;
    }

    textoEstado.attr = atributo;
    textoEstado.setContent(mensajeEstado);
}

function establecerBotonDeshabilitado(boton, deshabilitado) {
    if (!boton || boton.destroyed || boton.disabled === deshabilitado) {
        return;
    }

    boton.disabled = deshabilitado;
    boton.updateStatus();
    boton.draw();
}

function cambiarEstadoPrincipal(deshabilitado) {
    establecerBotonDeshabilitado(botonNuevo, deshabilitado);
    establecerBotonDeshabilitado(botonEditar, deshabilitado || !obtenerContactoSeleccionado());
    establecerBotonDeshabilitado(botonBorrar, deshabilitado || !obtenerContactoSeleccionado());

    if (entradaBusqueda) {
        entradaBusqueda.disabled = deshabilitado;
        entradaBusqueda.input.disabled = deshabilitado;
    }

    if (menuContactos) {
        for (const boton of menuContactos.buttons) {
            boton.disabled = deshabilitado || boton.value === null;
            boton.updateStatus();
            boton.draw();
        }
    }
}

function abrirFormulario(contacto = null) {
    if (modalActivo) {
        return;
    }

    const ancho = Math.min(64, term.width - 6);
    const alto = 12;
    const x = Math.floor((term.width - ancho) / 2);
    const y = Math.max(2, Math.floor((term.height - alto) / 2));
    const focoAnterior = document.focusElement;
    const ventana = new Window({
        parent: document,
        x,
        y,
        width: ancho,
        height: alto,
        title: contacto ? "EDITAR CONTACTO" : "NUEVO CONTACTO",
        frameChars: "double",
        backgroundAttr: { bgColor: "default" },
        movable: false,
        zIndex: 1000
    });
    const formulario = new Form({
        parent: ventana,
        x: 1,
        y: 1,
        width: ancho - 4,
        inputs: [
            { type: "text", key: "nombre", label: "Nombre:", content: contacto?.nombre ?? "" },
            { type: "text", key: "apellido", label: "Apellido:", content: contacto?.apellido ?? "" },
            { type: "text", key: "telefono", label: "Teléfono:", content: contacto?.telefono ?? "" },
            { type: "text", key: "email", label: "Email:", content: contacto?.email ?? "" }
        ],
        buttons: [
            { content: " Guardar ", value: "guardar" },
            { content: " Cancelar ", value: "cancelar" }
        ],
        textAttr: TEMA.entrada,
        voidAttr: TEMA.entradaVacia,
        labelFocusAttr: TEMA.titulo,
        labelBlurAttr: TEMA.etiqueta,
        buttonFocusAttr: TEMA.botonActivo,
        buttonBlurAttr: TEMA.boton,
        keyBindings: {
            ...Form.prototype.keyBindings,
            TAB: "next",
            SHIFT_TAB: "previous"
        }
    });
    const error = crearTexto({
        parent: ventana,
        x: 2,
        y: 8,
        width: ancho - 6,
        content: "Tab/Enter: siguiente campo  ·  Esc: cancelar",
        attr: TEMA.secundario
    });

    modalActivo = {
        ventana,
        formulario,
        focoAnterior,
        focoInicial: formulario.labeledInputs[0]
    };
    cambiarEstadoPrincipal(true);
    ventana.topZ();

    formulario.on("submit", (valor, accion, form, boton) => {
        boton.once("blinked", () => {
            procesarFormulario(valor, contacto, formulario, error);
        });
    });
    ventana.on("key", tecla => {
        if (tecla === "ESCAPE") {
            cerrarModal(contacto ? "Edición cancelada" : "Alta cancelada");
            return true;
        }
    });

    document.giveFocusTo(formulario.labeledInputs[0]);
    document.draw();
}

function procesarFormulario(valor, contacto, formulario, error) {
    if (valor.submit === "cancelar") {
        cerrarModal(contacto ? "Edición cancelada" : "Alta cancelada");
        return;
    }

    const datos = Object.fromEntries(
        Object.entries(valor.fields).map(([clave, contenido]) => [clave, contenido.trim()])
    );

    if (!datos.nombre || !datos.apellido) {
        error.attr = TEMA.advertencia;
        error.setContent("Nombre y apellido son obligatorios.");
        document.giveFocusTo(
            !datos.nombre ? formulario.labeledInputs[0] : formulario.labeledInputs[1]
        );
        return;
    }

    if (contacto) {
        Object.assign(contacto, datos);
        mensajeEstado = `Contacto actualizado: ${nombreCompleto(contacto)}`;
        contactoSeleccionadoId = contacto.id;
    } else {
        const nuevoContacto = { id: siguienteId++, ...datos };
        contactos.push(nuevoContacto);
        contactoSeleccionadoId = nuevoContacto.id;
        consulta = "";
        mensajeEstado = `Contacto creado: ${nombreCompleto(nuevoContacto)}`;
    }

    guardarContactos();
    cerrarModal(null, true);
}

function abrirConfirmacionBorrado(contacto) {
    if (modalActivo) {
        return;
    }

    const ancho = Math.min(56, term.width - 8);
    const alto = 8;
    const x = Math.floor((term.width - ancho) / 2);
    const y = Math.max(2, Math.floor((term.height - alto) / 2));
    const focoAnterior = document.focusElement;
    const ventana = new Window({
        parent: document,
        x,
        y,
        width: ancho,
        height: alto,
        title: "CONFIRMAR BORRADO",
        frameChars: "double",
        backgroundAttr: { bgColor: "default" },
        movable: false,
        zIndex: 1000
    });

    crearTexto({
        parent: ventana,
        x: 2,
        y: 1,
        width: ancho - 6,
        height: 2,
        content: [
            `¿Eliminar a ${recortar(nombreCompleto(contacto), ancho - 20)}?`,
            "Esta acción no se puede deshacer."
        ],
        attr: TEMA.texto
    });

    const botonConfirmar = crearBoton({
        parent: ventana,
        x: 4,
        y: 4,
        texto: "Sí, eliminar",
        valor: true,
        peligro: true
    });
    const botonCancelar = crearBoton({
        parent: ventana,
        x: ancho - 16,
        y: 4,
        texto: "Cancelar",
        valor: false
    });

    modalActivo = {
        ventana,
        focoAnterior,
        focoInicial: botonCancelar
    };
    cambiarEstadoPrincipal(true);
    ventana.topZ();

    botonConfirmar.on("blinked", () => {
        contactos = contactos.filter(item => item.id !== contacto.id);
        guardarContactos();
        mensajeEstado = `Contacto eliminado: ${nombreCompleto(contacto)}`;
        contactoSeleccionadoId = null;
        cerrarModal(null, true);
    });
    botonCancelar.on("blinked", () => cerrarModal("Borrado cancelado"));
    ventana.on("key", tecla => {
        if (tecla === "ESCAPE") {
            cerrarModal("Borrado cancelado");
            return true;
        }
    });

    document.giveFocusTo(botonCancelar);
    document.draw();
}

function enfocarModal() {
    if (modalActivo && !modalActivo.ventana.destroyed) {
        document.giveFocusTo(modalActivo.focoInicial);
    }
}

function cerrarModal(mensaje = null, actualizar = false) {
    if (!modalActivo) {
        return;
    }

    const { ventana, focoAnterior } = modalActivo;
    modalActivo = null;
    ventana.destroy();

    if (mensaje) {
        mensajeEstado = mensaje;
    }

    if (redimensionPendiente) {
        redimensionPendiente = false;
        construirInterfaz();
        document.giveFocusTo(entradaBusqueda);
        return;
    }

    cambiarEstadoPrincipal(false);

    if (actualizar) {
        if (entradaBusqueda.getValue() !== consulta) {
            entradaBusqueda.setValue(consulta);
        }
        actualizarBusqueda();
    } else {
        actualizarDetalle();
        actualizarEstado(TEMA.secundario);
    }

    if (focoAnterior && !focoAnterior.destroyed) {
        document.giveFocusTo(focoAnterior);
    } else {
        document.giveFocusTo(entradaBusqueda);
    }
}

function manejarRedimension() {
    if (modalActivo) {
        redimensionPendiente = true;
        return;
    }

    setImmediate(() => {
        construirInterfaz();

        if (entradaBusqueda) {
            document.giveFocusTo(entradaBusqueda);
        }
    });
}

function manejarTeclaGlobal(tecla) {
    if (["CTRL_Q", "CTRL_C"].includes(tecla)) {
        salir();
    }

    if (!modalActivo && ["q", "Q"].includes(tecla)) {
        salir();
    }
}

function salir() {
    if (document && !document.destroyed) {
        document.destroyNoRedraw();
    }

    term.grabInput(false);
    term.hideCursor(false);
    term.styleReset();
    term.fullscreen(false);
    process.exit(0);
}

function principal() {
    term.fullscreen(true);
    document = term.createDocument();
    document.on("key", manejarTeclaGlobal);
    term.on("resize", manejarRedimension);
    construirInterfaz();

    if (entradaBusqueda) {
        document.giveFocusTo(entradaBusqueda);
    }
}

process.on("SIGINT", salir);
process.on("uncaughtException", error => {
    term.grabInput(false);
    term.hideCursor(false);
    term.fullscreen(false);
    console.error(error);
    process.exit(1);
});

principal();
