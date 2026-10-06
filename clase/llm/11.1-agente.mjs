// Ejecutar con Node.js 22.13+: node app.mjs
import { loadEnvFile } from "node:process";
import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { styleText } from "node:util";

async function leerArchivo({ ruta }) {
  return await readFile(ruta, "utf8");
}

async function escribirArchivo({ ruta, contenido }) {
  await writeFile(ruta, contenido, "utf8");
  return "Archivo guardado.";
}

function configurarOpenAI() {
  loadEnvFile(".env");
  return {
    url: "https://api.openai.com/v1/chat/completions",
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-6-luna",
  };
}

// Estas definiciones describen las herramientas al modelo; no las ejecutan.
const herramientas = [
  {
    type: "function",
    function: {
      name: "leerArchivo",
      description: "Lee el contenido de un archivo de texto existente.",
      parameters: {
        type: "object",
        properties: {
          ruta: { type: "string", description: "Ruta del archivo." },
        },
        required: ["ruta"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "escribirArchivo",
      description: "Crea o reemplaza un archivo de texto. La carpeta debe existir.",
      parameters: {
        type: "object",
        properties: {
          ruta: { type: "string", description: "Ruta del archivo." },
          contenido: { type: "string", description: "Texto completo a guardar." },
        },
        required: ["ruta", "contenido"],
      },
    },
  },
];

async function invocarOpenAI(configuracion, mensajes) {
  const respuesta = await fetch(configuracion.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${configuracion.apiKey}`,
    },
    body: JSON.stringify({
      model: configuracion.model,
      // GPT-6 Luna admite herramientas en Chat Completions con este valor.
      reasoning_effort: "none",
      messages: mensajes,
      tools: herramientas,
    }),
  });

  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error.message);
  return datos.choices[0].message;
}

async function ejecutarHerramienta(llamada) {
  const funciones = { leerArchivo, escribirArchivo };
  const argumentos = JSON.parse(llamada.function.arguments);
  console.log(styleText("yellow", `  → ${llamada.function.name} · ${argumentos.ruta}`));
  const resultado = await funciones[llamada.function.name](argumentos);
  console.log(styleText(["bold", "green"], "  ✓ Herramienta completada"));
  return resultado;
}

const configuracion = configurarOpenAI();
const consola = createInterface({ input: process.stdin, output: process.stdout });
const mensajes = [
  {
    role: "system",
    content: "Sos un asistente de programación. Respondé en español. Usá las herramientas para leer y escribir archivos cuando sea necesario. Las rutas relativas parten de la carpeta donde se ejecuta la app.",
  },
];

console.log(styleText(["bold", "cyan"], "\n  ◆ ASISTENTE DE PROGRAMACIÓN"));
console.log(styleText("gray", "  ──────────────────────────────────────"));
console.log(`  Modelo: ${styleText(["bold", "green"], configuracion.model)}`);
console.log(styleText("gray", "  Leé y escribí archivos. Escribí 'salir' para terminar.\n"));

try {
  while (true) {
    const texto = await consola.question(styleText(["bold", "magenta"], "Vos: "));
    if (texto === "salir") break;
    mensajes.push({ role: "user", content: texto });

    // Un mensaje del usuario puede requerir varias rondas de herramientas.
    while (true) {
      console.log(styleText("gray", "  … Consultando al modelo"));
      const mensaje = await invocarOpenAI(configuracion, mensajes);
      mensajes.push(mensaje);

      if (!mensaje.tool_calls?.length) {
        console.log(`\n${styleText(["bold", "green"], "Asistente: ")}${mensaje.content}\n`);
        break;
      }

      for (const llamada of mensaje.tool_calls) {
        const resultado = await ejecutarHerramienta(llamada);
        mensajes.push({
          role: "tool",
          tool_call_id: llamada.id,
          content: resultado,
        });
      }
    }
  }
} finally {
  consola.close();
  console.log(styleText("gray", "\n  Sesión finalizada.\n"));
}
