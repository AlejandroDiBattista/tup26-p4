// Convierte la tabla de alumnos.md en un arreglo de objetos y lo guarda en alumnos.json.
// Uso: node parse-alumnos.js
const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const directorio = __dirname;
  const markdown = await fs.readFile(path.join(directorio, 'alumnos.md'), 'utf8');
  const alumnos = [];
  let comision = null;
  let dentroDeTabla = false;

  for (const linea of markdown.split(/\r?\n/)) {
    const encabezado = linea.match(/^##\s+(C\d+)\s*$/i);
    if (encabezado) {
      comision = encabezado[1].toUpperCase();
      dentroDeTabla = false;
      continue;
    }

    if (linea.trim() === '```text') {
      dentroDeTabla = true;
      continue;
    }
    if (linea.trim() === '```') {
      dentroDeTabla = false;
      continue;
    }
    if (!dentroDeTabla || !comision || !/^\s*\d+\s/.test(linea)) continue;

    // Las columnas están separadas por dos o más espacios; los nombres pueden contener espacios.
    const columnas = linea.trim().split(/\s{2,}/);
    if (columnas.length !== 6) {
      throw new Error(`Fila inválida en ${comision}: ${linea}`);
    }

    const [legajo, nombre, telefono, github, asistencia, practicos] = columnas;
    alumnos.push({
      comision,
      legajo: Number(legajo),
      nombre,
      telefono,
      github,
      asistencia: Number(asistencia),
      practicos,
    });
  }

  await fs.writeFile(
    path.join(directorio, 'alumnos.json'),
    JSON.stringify(alumnos, null, 2) + '\n',
    'utf8',
  );
  console.log(`Se guardaron ${alumnos.length} alumnos en alumnos.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
