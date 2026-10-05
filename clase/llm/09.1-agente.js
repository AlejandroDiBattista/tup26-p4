import fs from "node:fs"
import readline from "node:readline/promises"
import { styleText } from "node:util";

function configurarApi() {
  const archivoEnv = new URL(".env", import.meta.url);
  if (fs.existsSync(archivoEnv)) process.loadEnvFile(archivoEnv);
  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new Error("Falta OPENAI_API_KEY. Definila en el entorno o en clase/llm/.env.");
  }
  return {
    url: "https://api.openai.com/v1/chat/completions",
    apiKey: process.env.OPENAI_API_KEY,
    modelo: process.env.OPENAI_MODEL?.trim() || "gpt-6-luna",
  };
}

const api = configurarApi();
const herramientas = [
  {
    type: "function",
    function: {
      name: "leerArchivo",
      description: "Lee un archivo de texto y devuelve su contenido",
      parameters: {
        type: "object",
        properties: {
          ruta: { type: "string", description: "Ruta del archivo" },
        },
        required: ["ruta"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "escribirArchivo",
      description: "Crea o reemplaza un archivo de texto con el contenido indicado",
      parameters: {
        type: "object",
        properties: {
          ruta:      { type: "string", description: "Ruta del archivo" },
          contenido: { type: "string", description: "Texto completo a guardar" },
        },
        required: ["ruta", "contenido"],
      },
    },
  },
];

function leerArchivo({ ruta }) {
  return fs.readFileSync(ruta, "utf8");
}

function escribirArchivo({ ruta, contenido }) {
  fs.writeFileSync(ruta, contenido);
  return "Archivo guardado";
}

const funciones = { leerArchivo, escribirArchivo };

function ejecutarHerramienta(llamada) {
  let resultado;
  try {
    const nombre = llamada.function.name;
    if (!Object.hasOwn(funciones, nombre)) {
      throw new Error(`Herramienta desconocida: ${nombre}`);
    }
    const argumentos = JSON.parse(llamada.function.arguments);
    console.log(styleText("gray", `  🔧 ${nombre}(${argumentos?.ruta})`));
    resultado = funciones[nombre](argumentos);
  } catch (error) {
    resultado = `Error: ${error.message}`;
  }
  return { role: "tool", tool_call_id: llamada.id, content: resultado };
}

async function llamarApi(mensajes) {
  const respuesta = await fetch(api.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${api.apiKey}`,
    },
    body: JSON.stringify({
      model: api.modelo,
      messages: mensajes,
      tools: herramientas,
      reasoning_effort: "none",
    }),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok || datos.error) {
    throw new Error(datos.error?.message || `La API respondió ${respuesta.status}`);
  }
  const mensaje = datos.choices?.[0]?.message;
  if (!mensaje) throw new Error("La API no devolvió un mensaje.");
  return mensaje;
}

async function responder(mensajes) {
  while (true) {
    const mensaje = await llamarApi(mensajes);
    mensajes.push(mensaje);
    if (!mensaje.tool_calls?.length) return mensaje.content ?? "";
    for (const llamada of mensaje.tool_calls) {
      mensajes.push(ejecutarHerramienta(llamada));
    }
  }
}

// Carga las instrucciones iniciales desde AGENTS.md, ubicado junto a este script.
// Así se puede editar el prompt sin modificar el código del agente.
const archivoPrompt = new URL("./AGENTS.md", import.meta.url);
if (!fs.existsSync(archivoPrompt)) {
  throw new Error(`No se encontró el archivo de instrucciones: ${archivoPrompt.pathname}`);
}
const promptInicial = fs.readFileSync(archivoPrompt, "utf8").trim();
if (!promptInicial) {
  throw new Error(`El archivo de instrucciones está vacío: ${archivoPrompt.pathname}`);
}
const mensajes = [
  {
    role: "system",
    content: promptInicial,
  },
];

const consola = readline.createInterface({ input: process.stdin, output: process.stdout })
consola.on("close", () => process.exit());
while (true) {
  const texto = (await consola.question(styleText(["bold", "green"], "\nVos: "))).trim();
  if (texto.toLowerCase() === "salir") break;
  if (!texto) continue;
  mensajes.push({ role: "user", content: texto });
  try {
    console.log(styleText("cyan", `\nAsistente: ${await responder(mensajes)}`));
  } catch (error) {
    console.error(styleText("red", `\nError: ${error.message}`));
  }
}
consola.close();
