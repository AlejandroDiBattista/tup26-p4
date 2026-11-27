// Asistente conversacional que llama a la API REST de OpenAI con fetch.
// Para ejecutarlo: pnpm asistente

import { iniciar } from './interfaz.jsx'

try { process.loadEnvFile() } catch {}
const MODELO = process.env.OPENAI_MODEL ?? 'gpt-6.2-sol'
const INSTRUCCIONES = 'Sos un asistente conversacional. Respondé en español y en pocas líneas.'

const historial = [] // Se conserva mientras el programa está abierto.

async function alEnviar(mensaje, ui) {
  const mensaje = { role: 'user', content: pedido }

  const respuesta = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: MODELO,
      instructions: INSTRUCCIONES,
      input: [...historial, mensaje]
    })
  })
  const datos = await respuesta.json()
  if (!respuesta.ok) throw new Error(datos.error?.message ?? `Error HTTP ${respuesta.status}.`)

  const texto = datos.output
    .filter(item => item.type === 'message')
    .flatMap(item => item.content)
    .map(parte => parte.text ?? parte.refusal ?? '')
    .join('')
  if (!texto) throw new Error('El modelo no devolvió texto.')

  historial.push(mensaje, { role: 'assistant', content: texto })
  ui.texto(texto)
  ui.tokens(datos.usage?.total_tokens ?? 0)
}

iniciar({ titulo: 'Asistente · API REST de OpenAI', detalle: MODELO, alEnviar })
