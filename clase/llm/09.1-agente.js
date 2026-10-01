// Asistente de programación mínimo usando la API de OpenAI (chat completions).
// Ejecutar con: node asistente.js   (escribir "salir" para terminar)

import fs from "node:fs";
import readline from "node:readline/promises";
import { styleText } from "node:util";

// ---------- Configuración ----------

function configurarApi() {
  process.loadEnvFile(new URL(".env", import.meta.url));
  return {
    url: "https://api.openai.com/v1/chat/completions",
    apiKey: process.env.OPENAI_API_KEY,
    modelo: process.env.OPENAI_MODEL,
  };
}

const api = configurarApi();

// ---------- Herramientas ----------

// Lo que el modelo "ve": nombre, descripción y parámetros de cada herramienta.
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
          ruta: { type: "string", description: "Ruta del archivo" },
          contenido: { type: "string", description: "Texto completo a guardar" },
        },
        required: ["ruta", "contenido"],
      },
    },
  },
];

// Lo que realmente se ejecuta cuando el modelo pide una herramienta.
function leerArchivo({ ruta }) {
  return fs.readFileSync(ruta, "utf8");
}

function escribirArchivo({ ruta, contenido }) {
  fs.writeFileSync(ruta, contenido);
  return "Archivo guardado";
}

const funciones = { leerArchivo, escribirArchivo };

function ejecutarHerramienta(llamada) {
  const nombre = llamada.function.name;
  const argumentos = JSON.parse(llamada.function.arguments);
  console.log(styleText("gray", `  🔧 ${nombre}(${argumentos.ruta})`));

  const resultado = funciones[nombre](argumentos);
  return { role: "tool", tool_call_id: llamada.id, content: resultado };
}

// ---------- API ----------

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
      reasoning_effort: "none", // requerido para usar herramientas en chat completions
    }),
  });
  const datos = await respuesta.json();
  if (datos.error) throw new Error(datos.error.message);
  return datos.choices[0].message;
}

// Consulta al modelo hasta que deje de pedir herramientas y devuelva texto.
async function responder(mensajes) {
  while (true) {
    const mensaje = await llamarApi(mensajes);
    mensajes.push(mensaje);

    if (!mensaje.tool_calls) return mensaje.content;

    for (const llamada of mensaje.tool_calls) {
      mensajes.push(ejecutarHerramienta(llamada));
    }
  }
}

// ---------- Bucle principal ----------

const mensajes = [
  {
    role: "system",
    content: "Sos un asistente de programación. Podés leer y escribir archivos con las herramientas disponibles. Respondé en español y en forma breve.",
  },
];

const consola = readline.createInterface({ input: process.stdin, output: process.stdout });
consola.on("close", () => process.exit()); // Ctrl+C o Ctrl+D también terminan

while (true) {
  const texto = await consola.question(styleText(["bold", "green"], "\nVos: "));
  if (texto === "salir") break;

  mensajes.push({ role: "user", content: texto });
  console.log(styleText("cyan", `\nAsistente: ${await responder(mensajes)}`));
}

consola.close();
