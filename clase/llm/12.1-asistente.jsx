// Desde clase/llm: node --env-file-if-exists=.env --import tsx 12.1-asistente.jsx
import React, {useState} from 'react'
import {render, Box, Static, Text} from 'ink'
import {Spinner, TextInput} from '@inkjs/ui'
import {readFile, writeFile, mkdir} from 'node:fs/promises'
import {resolve, dirname} from 'node:path'

if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new Error("Falta OPENAI_API_KEY. Definila en el entorno o en clase/llm/.env.")
}

const URL_API = 'https://api.openai.com/v1/chat/completions'
const MODELO = 'gpt-6-sol'

const directorioTrabajo = process.cwd()

// AGENTS.md es opcional y define el comportamiento para el directorio actual.

function describirHerramienta([name, {descripcion, campos}]) {
    const properties = Object.fromEntries(
        Object.entries(campos).map(([campo, descripcion]) => [campo, {type: 'string', description: descripcion}])
    )
    return {
        type: 'function',
        function: {
            name,
            description: descripcion,
            parameters: {type: 'object', properties, required: Object.keys(campos), additionalProperties: false}
        }
    }
}

const instrucciones = await leerArchivo({path: 'AGENTS.md'})
const instruccionesSistema = `
    Sos un asistente. Respondé en el idioma del usuario.
    ${instrucciones ? `Seguí estas instrucciones del archivo AGENTS.md:
    <instrucciones_agentes>
    ${instrucciones}
    </instrucciones_agentes>` : ''}

    Podés usar herramientas para leer y escribir archivos del directorio de trabajo: ${directorioTrabajo}.
    Usá las herramientas solo si el pedido requiere trabajar con archivos; para preguntas generales, respondé directamente.
    Usá rutas relativas y confirmá una operación con archivos solo si la herramienta se ejecutó correctamente.
`

function leerArchivo({path}) {
    return readFile(resolve(directorioTrabajo, path), 'utf8').catch(() => '')
}

async function escribirArchivo({path, content}) {
    const destino = resolve(directorioTrabajo, path)
    await mkdir(dirname(destino), {recursive: true})
    await writeFile(destino, content, 'utf8')
    return `Archivo escrito correctamente: ${path}`
}

const herramientas = {
    read_file: {
        descripcion: 'Lee un archivo de texto.',
        campos: {path: 'Ruta relativa al directorio de trabajo'},
        verbo: 'Leí',
        ejecutar: leerArchivo
    },
    write_file: {
        descripcion: 'Crea o reemplaza un archivo de texto y las carpetas necesarias.',
        campos: {
            path: 'Ruta relativa al directorio de trabajo',
            content: 'Contenido completo del archivo'
        },
        verbo: 'Escribí',
        ejecutar: escribirArchivo
    }
}
const herramientasApi = Object.entries(herramientas).map(describirHerramienta)

async function consultar(historial) {
    const response = await fetch(URL_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: MODELO,
            messages: [{role: 'system', content: instruccionesSistema}, ...historial],
            
            tools: herramientasApi,
            tool_choice: 'auto',
            
            temperature: 1,
            max_completion_tokens: 4096,
            top_p: 1,
            stream: false,
            // Chat Completions solo admite function tools con reasoning_effort="none".
            reasoning_effort: 'none'
        })
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(data.error?.message ?? `Error HTTP ${response.status}`)
    }

    const mensaje = data.choices?.[0]?.message
    if (!mensaje) throw new Error('El proveedor devolvió una respuesta vacía.')
    return mensaje
}

async function responder(historial, mostrar) {
    for (let vuelta = 0; vuelta < 8; vuelta += 1) {
        const respuesta = await consultar(historial)
        historial.push(respuesta)
        const llamadas = respuesta.tool_calls ?? []

        if (llamadas.length === 0) {
            mostrar({api: respuesta, tipo: 'assistant', texto: respuesta.content || 'No recibí texto en la respuesta.'})
            return
        }

        mostrar({api: respuesta})
        for (const llamada of llamadas) {
            const {name, arguments: datos} = llamada.function
            const argumentos = JSON.parse(datos)
            const accion = herramientas[name]
            let resultado, fallo
            try {
                resultado = await accion.ejecutar(argumentos)
            } catch (error) {
                fallo = error
                resultado = `Error: ${error.message}`
            }
            const api = {role: 'tool', tool_call_id: llamada.id, content: resultado}
            historial.push(api)
            mostrar({api, tipo: fallo ? 'error' : 'tool', texto: fallo?.message ?? `${accion.verbo} ${argumentos.path}`})
        }
    }

    throw new Error('Se alcanzó el límite de llamadas a herramientas para este turno.')
}

const estilos = {
    user:      {etiqueta: 'Vos: ',       color: '#55c3b2'},
    assistant: {etiqueta: 'Asistente: ', color: '#a79bf0'},
    tool:      {etiqueta: '↳ ',          color: '#8f9aa9'},
    error:     {etiqueta: 'Error: ',     color: '#f27a82'}
}

function App() {
    const [eventos, setEventos] = useState([])
    const [ocupado, setOcupado] = useState(false)
    const visibles = eventos.filter(evento => evento.texto)
    const cantidadPrompts = eventos.filter(evento => evento.tipo === 'user').length

    async function enviar(texto) {
        const prompt = texto.trim()
        if (!prompt || ocupado) return

        const usuario = {role: 'user', content: prompt}
        const mostrar = evento => setEventos(actuales => [...actuales, evento])
        mostrar({api: usuario, tipo: 'user', texto: prompt})
        setOcupado(true)

        try {
            const historial = [...eventos.map(evento => evento.api).filter(Boolean), usuario]
            await responder(historial, mostrar)
        } catch (error) {
            mostrar({tipo: 'error', texto: error.message})
        } finally {
            setOcupado(false)
        }
    }

    return (
        <Box flexDirection="column">
            <Static items={visibles}>
                {(evento, indice) => {
                    const {etiqueta, color} = estilos[evento.tipo]
                    return <Text key={indice}><Text bold color={color}>{etiqueta}</Text>{evento.texto}</Text>
                }}
            </Static>
            {ocupado && <Spinner label="Pensando…" />}
            <Box>
                <Text color={estilos.user.color} bold>› </Text>
                <TextInput
                    key={cantidadPrompts}
                    placeholder="Escribí tu mensaje…"
                    isDisabled={ocupado}
                    onSubmit={enviar}
                />
            </Box>
        </Box>
    )
}

const asistente = render(<App />)
