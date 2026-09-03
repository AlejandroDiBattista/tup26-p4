"use strict";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
    return `${contacto.apellido}, ${contacto.nombre}`.trim();
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
            `${contacto.legajo} ${nombreCompleto(contacto)} ${contacto.telefono} ${contacto.github}`
        );

        return palabras.every(palabra => texto.includes(palabra));
    });
}

function siguienteId(contactos) {
    return Math.max(0, ...contactos.map(contacto => contacto.id)) + 1;
}

export {
    cargarContactos,
    filtrarContactos,
    guardarContactos,
    nombreCompleto,
    siguienteId
};
