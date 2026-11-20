import { readFileSync } from 'node:fs';

// El repositorio concentra el acceso a los datos de alumnos.
const archivo = new URL('./alumnos.json', import.meta.url);

function leerAlumnos() {
  return JSON.parse(readFileSync(archivo, 'utf8'));
}

export function traer(id) {
  return leerAlumnos().find(alumno => String(alumno.id) === String(id)) ?? null;
}

export function listar(filtro = '') {
  const texto = filtro.toLowerCase();
  return leerAlumnos().filter(alumno =>
    Object.values(alumno).some(valor => String(valor).toLowerCase().includes(texto))
  );
}
