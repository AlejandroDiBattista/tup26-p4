"use strict";

const fs = require("fs");
const path = require("path");

const ARCHIVO = path.join(__dirname, "agenda.json");

function cargarContactos() {
    try {
        return JSON.parse(fs.readFileSync(ARCHIVO, "utf8"));
    } catch {
        return [];
    }
}

function guardarContactos(contactos) {
    fs.writeFileSync(ARCHIVO, `${JSON.stringify(contactos, null, 2)}\n`);
}

function nombreCompleto(contacto) {
    return `${contacto.nombre} ${contacto.apellido}`.trim();
}

function filtrarContactos(contactos, consulta) {
    const normalizar = texto => String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
    const palabras = normalizar(consulta).trim().split(/\s+/);

    if (!palabras[0]) {
        return contactos;
    }

    return contactos.filter(contacto => {
        const texto = normalizar(
            `${nombreCompleto(contacto)} ${contacto.telefono} ${contacto.email}`
        );

        return palabras.every(palabra => texto.includes(palabra));
    });
}

function siguienteId(contactos) {
    return Math.max(0, ...contactos.map(contacto => contacto.id)) + 1;
}

module.exports = {
    cargarContactos,
    filtrarContactos,
    guardarContactos,
    nombreCompleto,
    siguienteId
};
