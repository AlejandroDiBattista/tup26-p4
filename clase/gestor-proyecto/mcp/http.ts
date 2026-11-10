import { createServer } from 'node:http'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { crearServidor } from './server'

const puerto = Number(process.env.TRAMA_MCP_PORT ?? '43182')
if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
  throw new Error('TRAMA_MCP_PORT debe ser un puerto válido entre 1 y 65535.')
}
const hostsPermitidos = [`127.0.0.1:${puerto}`, `localhost:${puerto}`]
const origenesPermitidos = [
  `http://127.0.0.1:${puerto}`,
  `http://localhost:${puerto}`,
  ...(
    process.env.TRAMA_WEB_ORIGINS ??
    'http://127.0.0.1:5175,http://localhost:5175,http://127.0.0.1:5173,http://localhost:5173'
  )
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean),
]

// Atiende solicitudes MCP en localhost sin conservar sesiones entre pedidos.
const servidorHttp = createServer(async (solicitud, respuesta) => {
  if (solicitud.url !== '/mcp') {
    respuesta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    respuesta.end('Ruta no encontrada.')
    return
  }

  const origen = solicitud.headers.origin
  if (
    !hostsPermitidos.includes(solicitud.headers.host ?? '') ||
    (origen && !origenesPermitidos.includes(origen))
  ) {
    respuesta.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' })
    respuesta.end('Origen o destino no permitido.')
    return
  }
  if (origen) {
    respuesta.setHeader('Access-Control-Allow-Origin', origen)
    respuesta.setHeader('Vary', 'Origin')
    respuesta.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id, Mcp-Protocol-Version')
  }
  if (solicitud.method === 'OPTIONS') {
    respuesta.writeHead(204, {
      'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id, Last-Event-ID',
      'Access-Control-Max-Age': '600',
    })
    respuesta.end()
    return
  }

  const servidor = crearServidor()
  const transporte = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
    enableDnsRebindingProtection: true,
    allowedHosts: hostsPermitidos,
    allowedOrigins: origenesPermitidos,
  })
  respuesta.on('close', () => {
    void servidor.close()
  })

  try {
    await servidor.connect(transporte)
    await transporte.handleRequest(solicitud, respuesta)
  } catch (error) {
    console.error('No se pudo atender la solicitud MCP:', error)
    if (!respuesta.headersSent) {
      respuesta.writeHead(500, { 'Content-Type': 'application/json' })
      respuesta.end(
        JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Error interno.' },
          id: null,
        }),
      )
    } else {
      respuesta.end()
    }
  }
})

servidorHttp.listen(puerto, '127.0.0.1', () => {
  console.log(`Servidor MCP disponible en http://127.0.0.1:${puerto}/mcp`)
})
