// Desde clase/llm: node --env-file-if-exists=.env --import tsx 12.2-agente.jsx
import React, {useEffect, useRef, useState} from 'react'
import {render, Box, Text, useInput, useWindowSize} from 'ink'
import {Spinner, TextInput} from '@inkjs/ui'
import {ScrollView} from 'ink-scroll-view'
import {MarkdownText, useShikiHighlighter} from '@assistant-ui/react-ink-markdown'
import {readFile, writeFile, mkdir} from 'node:fs/promises'
import {resolve, dirname} from 'node:path'

if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new Error("Falta OPENAI_API_KEY. Definila en el entorno o en clase/llm/.env.")
}

const URL_API = 'https://api.openai.com/v1/chat/completions'
const MODELO = 'gpt-6-sol'
const directorioTrabajo = process.cwd()
const colores = {
    terracota: '#9b3f24',
    ocre: '#805509',
    tierra: '#655448',
    linea: '#d8c7b8',
    error: '#a12622'
}

function leerArchivo({path}) {
    return readFile(resolve(directorioTrabajo, path), 'utf8').catch(error => {
        if (error.code === 'ENOENT') return ''
        throw error
    })
}

async function escribirArchivo({path, content}) {
    const destino = resolve(directorioTrabajo, path)
    await mkdir(dirname(destino), {recursive: true})
    await writeFile(destino, content, 'utf8')
    return `Archivo escrito correctamente: ${path}`
}

const instrucciones = await leerArchivo({path: 'AGENTS.md'})
const instruccionesSistema = `
Sos un asistente. Respondé en el idioma del usuario.
${instrucciones ? `Seguí estas instrucciones del archivo AGENTS.md:\n<instrucciones_agentes>\n${instrucciones}\n</instrucciones_agentes>` : ''}
Podés usar herramientas para leer y escribir archivos del directorio de trabajo: ${directorioTrabajo}.
Usá las herramientas solo si el pedido requiere trabajar con archivos; para preguntas generales, respondé directamente.
Usá rutas relativas y confirmá una operación con archivos solo si la herramienta se ejecutó correctamente.
`

function describirHerramienta([name, {descripcion, campos}]) {
    const properties = Object.fromEntries(
        Object.entries(campos).map(([campo, detalle]) => [campo, {type: 'string', description: detalle}])
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

const herramientas = {
    read_file: {
        descripcion: 'Lee un archivo de texto.',
        campos: {path: 'Ruta relativa al directorio de trabajo'},
        verbo: 'Leyó',
        accion: 'leer',
        ejecutar: leerArchivo
    },
    write_file: {
        descripcion: 'Crea o reemplaza un archivo de texto y las carpetas necesarias.',
        campos: {
            path: 'Ruta relativa al directorio de trabajo',
            content: 'Contenido completo del archivo'
        },
        verbo: 'Escribió',
        accion: 'guardar',
        ejecutar: escribirArchivo
    }
}
const herramientasApi = Object.entries(herramientas).map(describirHerramienta)

async function consultar(historial) {
    let response
    try {
        response = await fetch(URL_API, {
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
                reasoning_effort: 'none'
            })
        })
    } catch (error) {
        throw new Error(`No pude conectarme con OpenAI. Revisá tu conexión e intentá de nuevo. (${error.message})`)
    }

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
        const detalle = data.error?.message
        throw new Error(detalle
            ? `OpenAI rechazó la consulta (HTTP ${response.status}): ${detalle}`
            : `OpenAI respondió con un error (HTTP ${response.status}). Revisá la configuración e intentá de nuevo.`)
    }
    const mensaje = data.choices?.[0]?.message
    if (!mensaje) throw new Error('OpenAI no devolvió una respuesta. Probá enviar el mensaje otra vez.')
    return mensaje
}

async function responder(historial, mostrar) {
    for (let vuelta = 0; vuelta < 8; vuelta += 1) {
        const respuesta = await consultar(historial)
        historial.push(respuesta)
        const llamadas = respuesta.tool_calls ?? []

        if (llamadas.length === 0) {
            mostrar({
                api: respuesta,
                tipo: 'assistant',
                texto: respuesta.content || 'No recibí una respuesta escrita. Probá reformular el mensaje.'
            })
            return
        }

        // Conserva la llamada interna para que el próximo turno tenga el contexto completo.
        mostrar({api: respuesta})
        for (const llamada of llamadas) {
            const {name, arguments: datos} = llamada.function
            const argumentos = JSON.parse(datos)
            const accion = herramientas[name]
            let resultado
            let fallo
            try {
                resultado = await accion.ejecutar(argumentos)
            } catch (error) {
                fallo = error
                resultado = `Error: ${error.message}`
            }
            const respuestaHerramienta = {role: 'tool', tool_call_id: llamada.id, content: resultado}
            historial.push(respuestaHerramienta)
            mostrar({
                api: respuestaHerramienta,
                tipo: fallo ? 'error' : 'tool',
                texto: fallo
                    ? `No pude ${accion.accion} "${argumentos.path}": ${fallo.message}`
                    : `${accion.verbo} ${argumentos.path}`
            })
        }
    }

    throw new Error('El asistente encadenó demasiadas acciones. Probá dividir el pedido en pasos más chicos.')
}

const estilos = {
    user:      {etiqueta: 'VOS',    color: colores.ocre},
    assistant: {etiqueta: 'IA',     color: colores.terracota},
    tool:      {etiqueta: 'ACCIÓN', color: colores.tierra},
    error:     {etiqueta: 'ERROR',  color: colores.error}
}

function Mensaje({evento, highlighter, ancho}) {
    const {etiqueta, color} = estilos[evento.tipo]
    const esUsuario = evento.tipo === 'user'
    return (
        <Box flexDirection="column" marginBottom={1} paddingLeft={esUsuario ? 2 : 0}>
            <Text bold color={color}>{esUsuario ? '› ' : '● '}{etiqueta}</Text>
            <Box paddingLeft={2}>
                {evento.tipo === 'assistant'
                    ? <MarkdownText text={evento.texto} highlighter={highlighter} width={ancho} />
                    : <Text wrap="wrap">{evento.texto}</Text>}
            </Box>
        </Box>
    )
}

function App() {
    const [eventos, setEventos] = useState([])
    const [ocupado, setOcupado] = useState(false)
    const scrollRef = useRef(null)
    const highlighter = useShikiHighlighter({theme: 'github-light'})
    const cantidadPrompts = eventos.filter(evento => evento.tipo === 'user').length
    const {rows = 24, columns = 80} = useWindowSize()

    useInput((input, key) => {
        const scroll = scrollRef.current
        if (!scroll) return
        if (key.pageUp) scroll.scrollBy(-Math.max(1, scroll.getViewportHeight() - 1))
        if (key.pageDown) scroll.scrollBy(Math.max(1, scroll.getViewportHeight() - 1))
        if (key.upArrow && input === '') scroll.scrollBy(-1)
        if (key.downArrow && input === '') scroll.scrollBy(1)
    })

    useEffect(() => {
        scrollRef.current?.scrollToBottom()
    }, [eventos.length])

    async function enviar(texto) {
        const prompt = texto.trim()
        if (!prompt || ocupado) return

        const usuario = {role: 'user', content: prompt}
        const previos = eventos.filter(evento => evento.api).map(evento => evento.api)
        const mostrar = evento => setEventos(actuales => [...actuales, evento])
        mostrar({api: usuario, tipo: 'user', texto: prompt})
        setOcupado(true)

        try {
            await responder([...previos, usuario], mostrar)
        } catch (error) {
            mostrar({tipo: 'error', texto: error.message})
        } finally {
            setOcupado(false)
        }
    }

    return (
        <Box flexDirection="column" height={rows}>
            <Box flexDirection="column" flexGrow={1} flexShrink={1} paddingX={2}>
                <Box
                    justifyContent="space-between"
                    marginBottom={1}
                    paddingBottom={1}
                    borderStyle="single"
                    borderColor={colores.linea}
                    borderBottom
                >
                    <Box>
                        <Text bold color={colores.terracota}>ASISTENTE</Text>
                        <Text color={colores.tierra}>  /  {MODELO}</Text>
                    </Box>
                    <Text color={colores.tierra}>{cantidadPrompts} {cantidadPrompts === 1 ? 'consulta' : 'consultas'}</Text>
                </Box>
                <Box flexDirection="column" flexGrow={1} flexShrink={1} overflow="hidden">
                    <ScrollView
                        ref={scrollRef}
                        flexGrow={1}
                        onContentHeightChange={() => scrollRef.current?.scrollToBottom()}
                    >
                        {eventos.filter(evento => evento.texto).map((evento, indice) => (
                            <Mensaje
                                key={`${indice}-${evento.tipo}`}
                                evento={evento}
                                highlighter={highlighter}
                                ancho={Math.max(12, columns - 8)}
                            />
                        ))}
                    </ScrollView>
                    {eventos.length === 0 && (
                        <Text color={colores.tierra}>Todavía no hay mensajes. Escribí abajo para iniciar la conversación.</Text>
                    )}
                    {ocupado && <Spinner label="Preparando la respuesta…" />}
                </Box>
            </Box>

            <Box flexDirection="column" flexShrink={0} paddingX={2} paddingY={1}>
                <Text bold color={colores.terracota}>TU MENSAJE</Text>
                <Box borderStyle="round" borderColor={colores.terracota} paddingX={1}>
                    <Text color={colores.terracota} bold>› </Text>
                    <TextInput
                        key={cantidadPrompts}
                        placeholder="Escribí y presioná Enter…"
                        isDisabled={ocupado}
                        onSubmit={enviar}
                    />
                </Box>
            </Box>
        </Box>
    )
}

render(<App />, {alternateScreen: true})
