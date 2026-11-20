import { strict as assert } from 'node:assert'
import { spawn, type ChildProcess } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { request } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as esperar } from 'node:timers/promises'
import { after, before, test } from 'node:test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const puerto = 44000 + Math.floor(Math.random() * 10000)
const puertoMcp = 54000 + Math.floor(Math.random() * 10000)
const url = `http://127.0.0.1:${puerto}`
const urlMcp = `http://127.0.0.1:${puertoMcp}/mcp`
let carpeta: string
let jsonServer: ChildProcess
let servidorMcp: ChildProcess
let cliente: Client

// Invoca una herramienta y devuelve el resultado JSON o el error MCP.
async function llamar(nombre: string, argumentos: Record<string, unknown> = {}) {
  const respuesta = await cliente.callTool({ name: nombre, arguments: argumentos })
  const texto = (respuesta.content as Array<{ type: string; text: string }>)[0].text
  return {
    error: respuesta.isError === true,
    texto,
    datos: respuesta.isError ? null : JSON.parse(texto),
  }
}

before(async () => {
  carpeta = await mkdtemp(join(tmpdir(), 'trama-mcp-'))
  await writeFile(
    join(carpeta, 'db.json'),
    JSON.stringify({
      configuracion: {
        id: 'configuracion',
        estados: [
          { id: 'pendiente', nombre: 'Pendiente' },
          { id: 'desarrollo', nombre: 'Desarrollo' },
          { id: 'finalizada', nombre: 'Finalizada' },
        ],
      },
      proyectos: [{ id: 'p1', nombre: 'Proyecto', descripcion: '' }],
      responsables: [{ id: 'r1', nombre: 'Ana', apellido: 'Pérez', contacto: '' }],
      tareas: [
        {
          id: 'legacy',
          titulo: 'Sin responsable',
          descripcion: '',
          proyecto_id: 'p1',
          responsable_id: null,
          estado: 'finalizada',
        },
      ],
    }),
  )
  jsonServer = spawn(
    process.execPath,
    ['node_modules/json-server/lib/bin.js', join(carpeta, 'db.json'), '--port', String(puerto)],
    { stdio: 'ignore' },
  )
  let disponible = false
  for (let intento = 0; intento < 80; intento++) {
    try {
      disponible = (await fetch(`${url}/configuracion`)).ok
    } catch {
      /* Espera el inicio. */
    }
    if (disponible) break
    await esperar(100)
  }
  assert.ok(disponible, 'JSON Server no inició')
  servidorMcp = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'mcp/http.ts'], {
    env: { ...process.env, TRAMA_API_URL: url, TRAMA_MCP_PORT: String(puertoMcp) },
    stdio: 'ignore',
  })
  disponible = false
  for (let intento = 0; intento < 80; intento++) {
    try {
      disponible = (await fetch(urlMcp)).status === 406
    } catch {
      /* Espera el inicio. */
    }
    if (disponible) break
    await esperar(100)
  }
  assert.ok(disponible, 'El servidor MCP HTTP no inició')
  cliente = new Client({ name: 'trama-tests', version: '1.0.0' })
  await cliente.connect(new StreamableHTTPClientTransport(new URL(urlMcp)))
})

after(async () => {
  await cliente?.close()
  servidorMcp?.kill()
  jsonServer?.kill()
  if (carpeta) await rm(carpeta, { recursive: true, force: true })
})

test('HTTP limita los accesos a orígenes y hosts locales', async () => {
  const preflight = await fetch(urlMcp, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://127.0.0.1:5175',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type,mcp-protocol-version',
    },
  })
  assert.equal(preflight.status, 204)
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'http://127.0.0.1:5175')
  assert.equal(
    (await fetch(urlMcp, { headers: { Origin: 'https://ejemplo.invalid' } })).status,
    403,
  )
  const estadoHost = await new Promise<number | undefined>((resolve, reject) => {
    const solicitud = request(urlMcp, { headers: { Host: 'ejemplo.invalid' } }, (respuesta) => {
      respuesta.resume()
      resolve(respuesta.statusCode)
    })
    solicitud.on('error', reject)
    solicitud.end()
  })
  assert.equal(estadoHost, 403)
  assert.equal((await fetch(`http://127.0.0.1:${puertoMcp}/otra`)).status, 404)
})

test('MCP aplica las reglas compartidas y administra el espacio', async () => {
  const herramientas = await cliente.listTools()
  assert.equal(herramientas.tools.length, 19)
  assert.ok((await llamar('obtener_espacio')).datos.proyectos.length > 0)
  const creada = await llamar('crear_tarea', { titulo: 'Nueva', proyecto_id: 'p1' })
  assert.equal(creada.error, false)
  const tarea = creada.datos
  assert.equal(tarea.estado, 'pendiente')
  assert.equal(tarea.responsable_id, null)
  const sinAsignar = await llamar('editar_tarea', { id: tarea.id, estado: 'desarrollo' })
  assert.equal(sinAsignar.error, true)
  assert.match(sinAsignar.texto, /responsable/i)
  assert.equal((await llamar('editar_tarea', { id: 'legacy', titulo: 'No permitido' })).error, true)
  assert.equal(
    (await llamar('editar_tarea', { id: tarea.id, responsable_id: 'r1', estado: 'desarrollo' }))
      .error,
    false,
  )
  assert.equal((await llamar('editar_tarea', { id: tarea.id, responsable_id: null })).error, true)
  assert.equal((await llamar('editar_tarea', { id: tarea.id, estado: 'finalizada' })).error, false)
  assert.equal((await llamar('editar_tarea', { id: tarea.id, estado: 'pendiente' })).error, true)
  assert.equal((await llamar('editar_tarea', { id: 'legacy', estado: 'pendiente' })).error, false)
  assert.equal((await llamar('eliminar_responsable', { id: 'r1' })).error, true)
  assert.equal((await llamar('eliminar_estado', { id: 'finalizada' })).error, true)
  assert.equal(
    (await llamar('reordenar_estados', { ids: ['desarrollo', 'pendiente', 'finalizada'] })).error,
    true,
  )
  const extra = await llamar('crear_estado', { nombre: 'Revisión' })
  assert.equal(extra.error, false)
  assert.equal(
    (await llamar('renombrar_estado', { id: extra.datos.at(-1).id, nombre: 'Revisión final' }))
      .error,
    false,
  )
  assert.equal((await llamar('eliminar_estado', { id: extra.datos.at(-1).id })).error, false)
  const simultaneos = await Promise.all([
    llamar('crear_estado', { nombre: 'Estado concurrente A' }),
    llamar('crear_estado', { nombre: 'Estado concurrente B' }),
  ])
  assert.ok(simultaneos.every((resultado) => !resultado.error))
  const estadosActuales = (await llamar('listar_estados')).datos as Array<{
    id: string
    nombre: string
  }>
  const agregados = estadosActuales.filter((estado) =>
    estado.nombre.startsWith('Estado concurrente'),
  )
  assert.equal(agregados.length, 2)
  for (const estado of agregados) {
    assert.equal((await llamar('eliminar_estado', { id: estado.id })).error, false)
  }
  const filtro = await llamar('listar_tareas', { proyecto_id: 'p1', busqueda: 'NUEVA' })
  assert.equal(filtro.datos.length, 1)
  const proyecto = (await llamar('listar_proyectos')).datos[0]
  assert.equal(proyecto.total_tareas, 2)
  assert.equal(proyecto.finalizadas, 1)
  assert.equal(proyecto.avance_porcentaje, 50)
  assert.equal((await llamar('eliminar_tarea', { id: tarea.id })).error, false)
  const responsable = await llamar('crear_responsable', { nombre: 'Luis', apellido: 'Pérez' })
  assert.equal(responsable.error, false)
  assert.equal(
    (await llamar('editar_responsable', { id: responsable.datos.id, nombre: 'Lucía' })).datos
      .nombre,
    'Lucía',
  )
  assert.equal((await llamar('eliminar_responsable', { id: responsable.datos.id })).error, false)
  const nuevoProyecto = await llamar('crear_proyecto', { nombre: 'Nuevo proyecto' })
  assert.equal(nuevoProyecto.error, false)
  assert.equal(
    (await llamar('editar_proyecto', { id: nuevoProyecto.datos.id, nombre: 'Actualizado' })).datos
      .nombre,
    'Actualizado',
  )
  assert.equal((await llamar('eliminar_proyecto', { id: nuevoProyecto.datos.id })).error, false)
})
