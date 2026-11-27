// Servicio de archivos: el único lugar del proyecto que toca el disco.
// Las herramientas del agente llaman a estas funciones.

import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

// La carpeta de trabajo es "taller" o la que se pasa a pnpm agente como argumento.
const RAIZ = path.resolve(process.argv[2] ?? 'taller')
export const CARPETA = path.basename(RAIZ)

// Convierte una ruta relativa en una ruta real, sin dejarla salir de la carpeta de trabajo.
// "../../.ssh/id_rsa" o "/etc/passwd" se rechazan.
function ubicar(ruta) {
  const real = path.resolve(RAIZ, ruta)
  if (real !== RAIZ && !real.startsWith(RAIZ + path.sep)) throw new Error(`"${ruta}" está fuera de la carpeta de trabajo.`)
  return real
}

export async function listarArchivos(ruta) {
  const entradas = await readdir(ubicar(ruta), { withFileTypes: true })
  return entradas.map(e => (e.isDirectory() ? `${e.name}/` : e.name)).join('\n') || '(vacía)'
}

export async function leerArchivo(ruta) {
  return await readFile(ubicar(ruta), 'utf8')
}

export async function escribirArchivo(ruta, contenido) {
  const destino = ubicar(ruta)
  await mkdir(path.dirname(destino), { recursive: true }) // crea las carpetas que falten
  await writeFile(destino, contenido)
  return `Escribí ${ruta} (${contenido.length} caracteres).`
}

// Guarda los bytes de una imagen generada en un archivo nuevo.
export async function guardarImagen(base64) {
  const ruta = `imagen-${randomUUID()}.png`
  await writeFile(ubicar(ruta), Buffer.from(base64, 'base64'), { flag: 'wx' })
  return ruta
}
