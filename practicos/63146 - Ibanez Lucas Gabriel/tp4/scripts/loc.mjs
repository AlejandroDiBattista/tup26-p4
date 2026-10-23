// Cuenta las líneas de código netas (sin líneas en blanco ni comentarios) del proyecto.
// Backend: src/**/*.ts. Frontend: public/MiniCRM.html separado en HTML, CSS y JSX.
// No cuenta node_modules, dist, data, archivos JSON ni configuraciones de build.
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = fileURLToPath(new URL("..", import.meta.url));

/** Líneas que no están vacías ni son solo comentario (//, /* ... *\/, <!-- -->). */
function netas(lineas) {
  let enBloque = false;
  let total = 0;
  for (const cruda of lineas) {
    const l = cruda.trim();
    if (enBloque) {
      if (l.includes("*/")) {
        enBloque = false;
        if (l.slice(l.indexOf("*/") + 2).trim()) total++;
      }
      continue;
    }
    if (l === "" || l.startsWith("//") || (l.startsWith("<!--") && l.endsWith("-->"))) continue;
    if (l.startsWith("/*")) {
      if (!l.includes("*/")) enBloque = true;
      else if (l.slice(l.indexOf("*/") + 2).trim()) total++;
      continue;
    }
    total++;
  }
  return total;
}

function archivosTs(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = join(dir, e.name);
    if (e.isDirectory()) return archivosTs(ruta);
    return e.name.endsWith(".ts") ? [ruta] : [];
  });
}

// --- Backend ---------------------------------------------------------------
const backend = archivosTs(join(raiz, "src"))
  .map((ruta) => ({
    archivo: relative(raiz, ruta).replaceAll("\\", "/"),
    lineas: netas(readFileSync(ruta, "utf8").split(/\r?\n/)),
  }))
  .sort((a, b) => a.archivo.localeCompare(b.archivo));

// --- Frontend: separa <style>, <script type="text/babel"> y el resto ------
const html = readFileSync(join(raiz, "public/MiniCRM.html"), "utf8").split(/\r?\n/);
const partes = { HTML: [], CSS: [], "React (JSX)": [] };
let actual = "HTML";
for (const linea of html) {
  const l = linea.trim();
  if (l.startsWith("<style")) { partes.HTML.push(linea); actual = "CSS"; continue; }
  if (l.startsWith("<script") && l.includes("text/babel")) { partes.HTML.push(linea); actual = "React (JSX)"; continue; }
  if (l.startsWith("</style>") || l.startsWith("</script>")) { partes.HTML.push(linea); actual = "HTML"; continue; }
  partes[actual].push(linea);
}
const frontend = Object.entries(partes).map(([parte, lineas]) => ({ parte, lineas: netas(lineas) }));

// --- Reporte ----------------------------------------------------------------
const suma = (lista) => lista.reduce((t, x) => t + x.lineas, 0);
const totalBackend = suma(backend);
const totalFrontend = suma(frontend);

console.log("Backend (TypeScript)");
for (const { archivo, lineas } of backend) console.log(`  ${archivo.padEnd(40)} ${String(lineas).padStart(5)}`);
console.log(`  ${"Subtotal".padEnd(40)} ${String(totalBackend).padStart(5)}\n`);

console.log("Frontend (public/MiniCRM.html)");
for (const { parte, lineas } of frontend) console.log(`  ${parte.padEnd(40)} ${String(lineas).padStart(5)}`);
console.log(`  ${"Subtotal".padEnd(40)} ${String(totalFrontend).padStart(5)}\n`);

console.log(`${"TOTAL".padEnd(42)} ${String(totalBackend + totalFrontend).padStart(5)}`);
