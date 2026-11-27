// Agente de programación con el AI SDK de Vercel.
// ToolLoopAgent coordina el modelo, las herramientas locales y las de OpenAI.

import { ToolLoopAgent, tool, isStepCount } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { iniciar } from './interfaz.jsx'
import { listarArchivos, leerArchivo, escribirArchivo, guardarImagen, CARPETA } from './archivos.js'

try { process.loadEnvFile() } catch {}
const MODELO = process.env.OPENAI_MODEL ?? 'gpt-6.2-sol'
const ESFUERZO = 'medium' // cuánto razona el modelo antes de contestar: low, medium o high

// Al comenzar leemos AGENTS.md, si la carpeta de trabajo tiene uno. Son las reglas del
// proyecto, escritas por las personas, y se suman al prompt de sistema.
const reglas = await leerArchivo('AGENTS.md').catch(() => '')

const INSTRUCCIONES = `Sos un asistente de programación. Trabajás sobre los archivos de una carpeta.
- Antes de cambiar un archivo, leelo.
- escribir_archivo reemplaza el archivo entero: mandá siempre el contenido completo.
- Si te piden generar una imagen, usá image_generation. El programa guarda el PNG y muestra su ruta.
- Usá web_search como apoyo interno cuando necesites consultar internet. En la respuesta, mostrá solo el resultado pedido, sin citas ni listas de fuentes de la búsqueda.
- Respondé en español y en pocas líneas. Si modificaste archivos, indicá cuáles.
- En las consultas de solo lectura, respondé lo que te pidieron y omití el resumen de cambios.

Reglas del proyecto (AGENTS.md):
${reglas || '(no hay)'}`

// ── Herramientas ────────────────────────────────────────────────────────────
// Si execute() lanza un error, el SDK se lo devuelve al modelo. No hace falta try/catch.
// escribir_archivo usa la interfaz de este pedido para pedir permiso.
const herramientasPara = (ui) => ({
  listar_archivos: tool({
    description: 'Lista los archivos y carpetas de una carpeta.',
    inputSchema: z.object({ ruta: z.string().describe('Carpeta relativa. "." es la carpeta de trabajo.') }),
    execute: ({ ruta }) => listarArchivos(ruta)
  }),

  leer_archivo: tool({
    description: 'Lee un archivo de texto de la carpeta de trabajo.',
    inputSchema: z.object({ ruta: z.string().describe('Ruta relativa, por ejemplo "calculadora.js".') }),
    execute: ({ ruta }) => leerArchivo(ruta)
  }),

  escribir_archivo: tool({
    description: 'Crea un archivo o lo reemplaza entero. Crea las carpetas que falten.',
    inputSchema: z.object({
      ruta: z.string().describe('Ruta relativa del archivo.'),
      contenido: z.string().describe('Contenido completo del archivo.')
    }),
    execute: async (entrada) => {
      if (!await ui.permitir('escribir_archivo', entrada)) return 'La persona no lo permitió. Preguntale qué prefiere antes de seguir.'
      return escribirArchivo(entrada.ruta, entrada.contenido)
    }
  }),

  image_generation: openai.tools.imageGeneration({
    model: 'gpt-image-2.5-flare',
    outputFormat: 'png',
    partialImages: 0
  }),

  web_search: openai.tools.webSearch()
})

const historial = []

async function alEnviar(mensaje, ui) {
  historial.push({ role: 'user', content: mensaje })

  // El SDK ejecuta las herramientas locales cuando las pide el modelo.
  const agente = new ToolLoopAgent({
    model: openai.responses(MODELO),
    providerOptions: { openai: { reasoningEffort: ESFUERZO } },
    instructions: INSTRUCCIONES,
    tools: herramientasPara(ui),
    stopWhen: isStepCount(20)
  })

  // stream() en vez de generate(): el texto llega de a pedacitos, mientras el modelo lo escribe.
  const resultado = await agente.stream({ messages: historial })

  let texto = ''
  const fijar = () => { if (texto.trim()) ui.texto(texto.trim()); texto = '' }

  for await (const parte of resultado.stream) {
    if (parte.type === 'text-delta')  { texto += parte.text; ui.parcial(texto) }
    if (parte.type === 'tool-call' && parte.toolName !== 'web_search') {
      fijar()
      ui.herramienta(parte.toolName, parte.input)
    }
    if (parte.type === 'tool-result' && parte.toolName === 'image_generation') {
      const base64 = parte.output.result
      if (base64) {
        fijar()
        const ruta = await guardarImagen(base64)
        ui.texto(`Imagen guardada en \`${ruta}\`.`)
      }
    }
    if (parte.type === 'finish-step') 
      ui.tokens(parte.usage.totalTokens) // una vez por cada llamada al modelo
    if (parte.type === 'error')       
        throw parte.error
  }
  fijar()

  // El SDK nos da los mensajes nuevos (texto, llamadas y resultados) para sumar al historial.
  historial.push(...await resultado.responseMessages)
}

iniciar({
  titulo: 'Agente · AI SDK de Vercel',
  detalle: `${MODELO} · carpeta ${CARPETA} · ${reglas ? 'con AGENTS.md' : 'sin AGENTS.md'}`,
  alEnviar
})
