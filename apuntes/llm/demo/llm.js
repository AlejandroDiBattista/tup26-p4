import OpenAI from 'openai'
import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'

// Las rutas parten de este archivo: funcionan desde cualquier carpeta de la terminal.
// El entorno ya definido tiene prioridad; después se leen los .env, del más cercano al general.
for (const ruta of ['./.env', '../.env', '../../../.env']) {
  const archivo = new URL(ruta, import.meta.url)
  if (existsSync(archivo)) loadEnvFile(fileURLToPath(archivo))
}

const cliente = new OpenAI({
  baseURL: process.env.LLM_URL || 'https://api.openai.com/v1',
  apiKey: process.env.LLM_KEY || process.env.OPENAI_API_KEY,
  timeout: 60_000,
})

export async function pedir(instruccion, datos = '', opciones = {}) {
  const respuesta = await cliente.chat.completions.create({
    model: process.env.LLM_MODEL || process.env.OPENAI_MODEL || 'gpt-6-luna',
    messages: [
      { role: 'system', content: instruccion },
      { role: 'user', content: datos },
    ],
    ...opciones,
  })

  const texto = respuesta.choices[0]?.message.content

  if (respuesta.choices[0]?.finish_reason === 'length') {
    throw new Error('La respuesta se cortó antes de terminar. Aumentá el límite de tokens del proveedor.')
  }
  if (!texto?.trim()) {
    throw new Error('El modelo no devolvió un resultado de texto.')
  }

  return texto
}
