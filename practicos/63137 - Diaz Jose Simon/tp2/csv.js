import {readFile} from 'node:fs/promises';

const SEPARADOR_DE_CAMPOS = ',';
const SEPARADOR_DE_LINEAS = /\r?\n/;
const CODIFICACION = 'utf8';

export function parsearCsv(contenido) {
    const lineas = contenido
        .split(SEPARADOR_DE_LINEAS)
        .filter(linea => linea.trim() !== '');

    if (lineas.length === 0) {
        throw new Error('el archivo está vacío');
    }

    const [lineaDeCabecera, ...lineasDeDatos] = lineas;

    return {
        cabecera: lineaDeCabecera.split(SEPARADOR_DE_CAMPOS),
        filas: lineasDeDatos.map(linea => linea.split(SEPARADOR_DE_CAMPOS)),
    };
}

export async function leerCsv(rutaArchivo) {
    const contenido = await readFile(rutaArchivo, CODIFICACION);
    return parsearCsv(contenido);
}
